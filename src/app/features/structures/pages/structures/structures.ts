import { Component, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2, lucideBuilding, lucideUsers, lucideKey, lucideCrown,
  lucideSearch, lucideSearchX, lucideDownload, lucidePlus, lucideLayoutGrid,
  lucideList, lucideClock, lucideCheckCircle, lucideCheck, lucidePause,
  lucidePlay, lucideMail, lucideEye, lucideTrash2, lucideX, lucideSend,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { Subject, forkJoin, takeUntil } from 'rxjs';

import { StructureModel } from '../../models/structure.model';
import { StructurePlanType } from '../../enums/structure-plan-type.enum';
import { StructureStatus }   from '../../enums/structure-status.enum';
import { StructureService }  from '../../services/structure.service';
import { FilterStructure }   from '../../interfaces/filter-structure.interface';
import { IQueryParam }       from '../../../../shared/interfaces/query-parms.interface';

import { StructureGridView } from '../../components/structures/structure-grid-view/structure-grid-view';
import { StructureListView } from '../../components/structures/structure-list-view/structure-list-view';

import {
  getStatutLabel,
  getInitials,
  getHealthScore,
  getOwnerFullName,
} from '../../utils/structure.utils';
import { StructureKpis } from '../../models/structure-kpis.model';

import { Pagination }           from '../../../../shared/components/pagination/pagination';
import { LoadingComponent }     from '../../../../shared/components/loading/loading';
import { EmptyStateComponent }  from '../../../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { ToastService }         from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-structures',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NgIconComponent,
    StructureGridView, StructureListView,
    Pagination, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent,
  ],
  templateUrl: './structures.html',
  viewProviders: [
    provideIcons({
      lucideBuilding2, lucideBuilding, lucideUsers, lucideKey, lucideCrown,
      lucideSearch, lucideSearchX, lucideDownload, lucidePlus, lucideLayoutGrid,
      lucideList, lucideClock, lucideCheckCircle, lucideCheck, lucidePause,
      lucidePlay, lucideMail, lucideEye, lucideTrash2, lucideX, lucideSend,
      lucideTriangleAlert,
    }),
  ],
})
export class Structures implements OnInit, OnDestroy {

  private readonly service  = inject(StructureService);
  private readonly toast    = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  // Enums exposés au template
  readonly StructureStatus   = StructureStatus;
  readonly StructurePlanType = StructurePlanType;

  // Utils exposés au template (fonctions pures)
  readonly getStatutLabel  = getStatutLabel;
  readonly getInitials     = getInitials;
  readonly getHealthScore  = getHealthScore;
  readonly getOwnerFullName = getOwnerFullName;

  // ── État ──────────────────────────────────────────────────────
  loading = signal(true);
  error   = signal<string | null>(null);

  // ── Données ───────────────────────────────────────────────────
  allStructures      = signal<StructureModel[]>([]);
  filteredStructures = signal<StructureModel[]>([]);

  kpisData = signal<StructureKpis>({
    total: 0, active: 0, pending: 0,
    suspended: 0, rejected: 0, premium: 0, freemium: 0,
  });

  // ── Pagination (serveur) ──────────────────────────────────────
  currentPage  = signal(1);
  itemsPerPage = signal(8);
  totalItems   = signal(0);
  hasNext      = signal(false);
  hasPrev      = signal(false);

  // ── UI ────────────────────────────────────────────────────────
  viewMode     = signal<'grid' | 'table'>('grid');
  searchQuery  = signal('');
  activePlan   = signal('all');
  activeStatut = signal('all');

  // ── Modales ───────────────────────────────────────────────────
  contactTarget  = signal<StructureModel | null>(null);
  contactSubject = signal('');
  contactMessage = signal('');
  deleteTarget   = signal<StructureModel | null>(null);
  deleteLoading  = signal(false);

  // ── Filtres ───────────────────────────────────────────────────
  readonly planFilters = [
    { label: 'Tous',     value: 'all'                   },
    { label: 'Freemium', value: StructurePlanType.FREEMIUM },
    { label: 'Premium',  value: StructurePlanType.PREMIUM  },
  ];

  readonly statutFilters = [
    { label: 'Tous',       value: 'all'                    },
    { label: 'En attente', value: StructureStatus.PENDING   },
    { label: 'Approuvés',  value: StructureStatus.APPROUVED },
    { label: 'Suspendus',  value: StructureStatus.SUSPENDED },
    { label: 'Rejetés',    value: StructureStatus.REJECTED  },
  ];

  // ── Computed ──────────────────────────────────────────────────
  kpis = computed(() => [
    { label: 'Total structures', value: this.kpisData().total,     icon: 'lucideBuilding2', bgClass: 'bg-primary-100',   iconClass: 'text-primary-700'  , trend: 0 },
    { label: 'En attente',       value: this.kpisData().pending,   icon: 'lucideClock',     bgClass: 'bg-amber-100',     iconClass: 'text-amber-600'    , trend: 0 },
    { label: 'Premium',          value: this.kpisData().premium,   icon: 'lucideCrown',     bgClass: 'bg-secondary-100', iconClass: 'text-secondary-500', trend: 0 },
    { label: 'Suspendues',       value: this.kpisData().suspended, icon: 'lucidePause',     bgClass: 'bg-orange-100',    iconClass: 'text-orange-600'   , trend: 0 },
  ]);

  totalPages = computed(() =>
    Math.ceil(this.totalItems() / this.itemsPerPage())
  );

  pagesArray = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  getPlanCount(plan: string): number {
    const structures = this.allStructures();
    if (plan === 'all') return structures.length;
    return structures.filter(s => s.plan === plan).length;
  }

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadAll(this.currentPage());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement ────────────────────────────────────────────────

  /**
   * Charge structures + KPIs en parallèle avec forkJoin
   * Une seule requête groupée — un seul loading — une seule subscription
   */
  loadAll(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      structures: this.service.findAll(this.buildQueryParams(page)),
      kpis:       this.service.getKpis(),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ structures, kpis }) => {
        this.allStructures.set(structures.data);
        this.applyFilters(this.buildFilterData());

        this.currentPage.set(structures.current_page);
        this.itemsPerPage.set(structures.per_page);
        this.totalItems.set(structures.total);
        this.hasNext.set(!!structures.next_page_url);
        this.hasPrev.set(!!structures.prev_page_url);

        this.kpisData.set(kpis);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Erreur lors du chargement.');
        this.loading.set(false);
      },
    });
  }

  // ── Filtrage local ────────────────────────────────────────────
  // Le filtrage local complète le filtrage serveur
  // Utilisé pour la recherche instantanée sans requête supplémentaire
  applyFilters(filter?: FilterStructure & IQueryParam): void {
    const all = this.allStructures();

    if (!all.length) {
      this.filteredStructures.set([]);
      return;
    }

    let result = [...all];

    if (filter?.search?.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q)             ||
        s.owner?.nom?.toLowerCase().includes(q)      ||
        s.owner?.prenom?.toLowerCase().includes(q)   ||
        s.owner?.email?.toLowerCase().includes(q)
      );
    }

    if (filter?.plan && filter.plan !== 'all') {
      result = result.filter(s => s.plan === filter.plan);
    }

    if (filter?.status && filter.status !== 'all') {
      result = result.filter(s => s.status === filter.status);
    }

    this.filteredStructures.set(result);
  }

  buildFilterData(): FilterStructure & IQueryParam {
    return {
      search: this.searchQuery(),
      plan:   this.activePlan(),
      status: this.activeStatut(),
    };
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.activePlan.set('all');
    this.activeStatut.set('all');
    this.applyFilters();
  }

  // ── Handlers filtres ──────────────────────────────────────────
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.applyFilters(this.buildFilterData());
  }

  onPlanFilterChange(plan: string): void {
    this.activePlan.set(plan);
    this.applyFilters(this.buildFilterData());
  }

  onStatusFilterChange(status: string): void {
    this.activeStatut.set(status);
    this.applyFilters(this.buildFilterData());
  }

  onViewModeChange(mode: 'grid' | 'table'): void {
    this.viewMode.set(mode);
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.loadAll(page);
  }

  // ── Actions ───────────────────────────────────────────────────
  onStatusChanged(data: { id: number; status: StructureStatus }): void {
    this.service.changeStatus(data.id, data.status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Statut mis à jour avec succès.');
          this.loadAll(this.currentPage());
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors du changement de statut.');
        },
      });
  }

  onPlanChange(id: number): void {
    this.service.togglePlan(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Plan mis à jour avec succès.');
          this.loadAll(this.currentPage());
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors du changement de plan.');
        },
      });
  }

  // ── Modale Contact ────────────────────────────────────────────
  openContact(structure: StructureModel): void {
    this.contactTarget.set(structure);
    this.contactSubject.set(`Concernant votre structure "${structure.name}"`);
    this.contactMessage.set('');
  }

  closeContact(): void {
    this.contactTarget.set(null);
  }

  sendContact(): void {
    // TODO: this.service.sendContact(...).subscribe(...)
    this.contactTarget.set(null);
  }

  // ── Modale Suppression ────────────────────────────────────────
  confirmDelete(structure: StructureModel): void {
    this.deleteTarget.set(structure);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  deleteStructure(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.deleteLoading.set(true);

    this.service.delete(target.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success(`Structure « ${target.name} » supprimée.`);
          this.deleteTarget.set(null);
          this.deleteLoading.set(false);
          const newPage = this.allStructures().length === 1 && this.currentPage() > 1
            ? this.currentPage() - 1
            : this.currentPage();
          this.loadAll(newPage);
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors de la suppression.');
          this.deleteLoading.set(false);
        },
      });
  }

  // ── Helpers ───────────────────────────────────────────────────
  private buildQueryParams(page: number): IQueryParam {
    return {
      page,
      perPage: this.itemsPerPage(),
    };
  }
}