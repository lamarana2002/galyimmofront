import { Component, inject, OnInit, OnDestroy, computed, signal, WritableSignal } from '@angular/core';
import { CommonModule, TitleCasePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideHome, lucideBuilding2, lucideSearch, lucideSearchX,
  lucideDownload, lucidePlus, lucideLayoutGrid, lucideList,
  lucideMapPin, lucideKey, lucideCheck, lucideBanknote,
  lucideEye, lucidePencil, lucideTrash2, lucideX, lucideSend,
  lucideTriangleAlert, lucideLoader, lucideStore, lucideMap,
  lucideWarehouse, lucideBuilding,
} from '@ng-icons/lucide';

import { PropertyModel } from '../../models/property.model';
import { PropertyStatusEnum } from '../../enums/property-status.enum';
import { PropertyService } from '../../services/property.service';
import { FilterProperty } from '../../interfaces/filter-property.interface';
import { PropertyKpis } from '../../models/property-kpis.model';

// Utils
import * as propertyUtils from '../../utils/property.utils';
import { IQueryParam } from '../../../../shared/interfaces/query-parms.interface';
import { AddPropertyModal } from "../../components/modals/add-property-modal/add-property-modal";
import { PropertyGridView } from "../../components/propertties/property-grid-view/property-grid-view";
import { ProfileService } from '../../../../core/auth/services/profile.service';
import { PropertyListView } from "../../components/propertties/property-list-view/property-list-view";

import { Pagination }             from '../../../../shared/components/pagination/pagination';
import { LoadingComponent }       from '../../../../shared/components/loading/loading';
import { EmptyStateComponent }    from '../../../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { ToastService }           from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, NgIconComponent, TitleCasePipe, DecimalPipe,
    AddPropertyModal, PropertyGridView, PropertyListView,
    Pagination, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent,
  ],
  templateUrl: './properties.html',
  styleUrls: ['./properties.css'],
  viewProviders: [
    provideIcons({
      lucideHome, lucideBuilding2, lucideSearch, lucideSearchX,
      lucideDownload, lucidePlus, lucideLayoutGrid, lucideList,
      lucideMapPin, lucideKey, lucideCheck, lucideBanknote,
      lucideEye, lucidePencil, lucideTrash2, lucideX, lucideSend,
      lucideTriangleAlert, lucideLoader, lucideStore, lucideMap,
      lucideWarehouse, lucideBuilding,
    })
  ]
})
export class Properties implements OnInit, OnDestroy {
  
  private readonly service  = inject(PropertyService);
  private readonly toast    = inject(ToastService);
  private readonly profile  = inject(ProfileService);
  private readonly router   = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // Enums exposés au template
  readonly PropertyStatus = PropertyStatusEnum;

  // Utils exposés au template
  readonly propertyUtils = propertyUtils;

  // ── État ──────────────────────────────────────────────────────
  loading = signal(true);
  error   = signal<string | null>(null);

  // ── Données ───────────────────────────────────────────────────
  allProperties = signal<PropertyModel[]>([]);
  filteredProperties = signal<PropertyModel[]>([]);
  structureId = signal<number | null>(null);

  kpisData = signal<PropertyKpis>({
    total: 0,
    available: 0,
    rented: 0,
    under_renovation: 0,
  });

  // ── Pagination (serveur) ──────────────────────────────────────
  currentPage  = signal(1);
  itemsPerPage = signal(12);
  totalItems   = signal(0);
  hasNext      = signal(false);
  hasPrev      = signal(false);

  // ── UI ────────────────────────────────────────────────────────
  viewMode     = signal<'grid' | 'table'>('grid');
  searchQuery  = signal('');
  activeStatut = signal('all');
  activeType   = signal<string>('all');

  // ── Modales ───────────────────────────────────────────────────
  editingPropertyId = signal<number | null>(null);
  addPropertyModal = signal<boolean>(false);

  deleteTarget = signal<PropertyModel | null>(null);
  deleteLoading = signal(false);

  // ── Filtres ───────────────────────────────────────────────────
  readonly statutFilters = [
    { label: 'Tous', value: 'all' },
    { label: 'Disponible', value: PropertyStatusEnum.AVAILABLE },
    { label: 'À louer', value: PropertyStatusEnum.FOR_RENT },
    { label: 'En vente', value: PropertyStatusEnum.FOR_SALE },
    { label: 'Loué', value: PropertyStatusEnum.RENTED },
    { label: 'Vendu', value: PropertyStatusEnum.SOLD },
    { label: 'En travaux', value: PropertyStatusEnum.UNDER_RENOVATION },
  ];

  // Types (seront chargés depuis le backend)
  typeOptions = signal<{ value: string; label: string; icon: string }[]>([
    { value: 'appartement', label: 'Appartement', icon: 'lucideHome' },
    { value: 'villa', label: 'Villa', icon: 'lucideBuilding2' },
    { value: 'commercial', label: 'Local commercial', icon: 'lucideStore' },
    { value: 'terrain', label: 'Terrain', icon: 'lucideMap' },
    { value: 'bureau', label: 'Bureau', icon: 'lucideBuilding' },
    { value: 'entrepot', label: 'Entrepôt', icon: 'lucideWarehouse' },
    { value: 'immeuble', label: 'Immeuble', icon: 'lucideBuilding2' },
  ]);

  // ── Computed ──────────────────────────────────────────────────
  kpis = computed(() => [
    {
      label: 'Total biens',
      value: this.kpisData().total,
      icon: 'lucideHome',
      bgClass: 'bg-primary-100',
      iconClass: 'text-primary-700',
      trend: 0
    },
    {
      label: 'Disponibles',
      value: this.kpisData().available,
      icon: 'lucideCheck',
      bgClass: 'bg-green-100',
      iconClass: 'text-green-600',
      trend: 0
    },
    {
      label: 'Loués',
      value: this.kpisData().rented,
      icon: 'lucideKey',
      bgClass: 'bg-amber-100',
      iconClass: 'text-amber-600',
      trend: 0
    },
    {
      label: 'En travaux',
      value: this.kpisData().under_renovation,
      icon: 'lucideBuilding2',
      bgClass: 'bg-orange-100',
      iconClass: 'text-orange-600',
      trend: 0
    },
  ]);

  totalPages = computed(() =>
    Math.ceil(this.totalItems() / this.itemsPerPage())
  );

  pagesArray = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    if (!this.profile.userStructure) {
      this.router.navigate(['']);
    }else {
      this.structureId?.set(this.profile.userStructure)
    }
    this.loadAll(this.currentPage());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement ────────────────────────────────────────────────
  loadAll(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      properties: this.service.findAll(this.buildQueryParams(page)),
      kpis: this.service.getKpis(),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ properties, kpis }) => {
        this.allProperties.set(properties.data);
        this.applyFilters(this.buildFilterData());

        this.currentPage.set(properties.current_page);
        this.itemsPerPage.set(properties.per_page);
        this.totalItems.set(properties.total);
        this.hasNext.set(!!properties.next_page_url);
        this.hasPrev.set(!!properties.prev_page_url);

        this.kpisData.set(kpis);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Erreur lors du chargement.');
        this.loading.set(false);
      },
    });
  }

  //modal de mise a jour
  editPropertty(id: number){
    this.editingPropertyId.set(id);
    this.addPropertyModal.set(true);
  }

  // ── Filtrage local ────────────────────────────────────────────
  applyFilters(filter?: FilterProperty & IQueryParam & { type?: string }): void {
    const all = this.allProperties();

    if (!all.length) {
      this.filteredProperties.set([]);
      return;
    }

    let result = [...all];

    if (filter?.search?.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q)
      );
    }

    if (filter?.status && filter.status !== 'all') {
      result = result.filter(p => p.status === filter.status);
    }

    if (filter?.type && filter.type !== 'all') {
      result = result.filter(p => p.property_type?.slug === filter.type);
    }

    this.filteredProperties.set(result);
  }

  buildFilterData(): FilterProperty & IQueryParam & { type?: string } {
    return {
      search: this.searchQuery(),
      status: this.activeStatut() !== 'all' ? this.activeStatut() : undefined,
      type: this.activeType() !== 'all' ? this.activeType() : undefined,
    };
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.activeStatut.set('all');
    this.activeType.set('all');
    this.applyFilters();
  }

  // ── Handlers filtres ──────────────────────────────────────────
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.applyFilters(this.buildFilterData());
  }

  onStatusFilterChange(status: string): void {
    this.activeStatut.set(status);
    this.applyFilters(this.buildFilterData());
  }

  onTypeFilterChange(type: string): void {
    this.activeType.set(type);
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
  onStatusChanged(data: { id: number; status: PropertyStatusEnum }): void {
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

  // ── Modale Suppression ────────────────────────────────────────
  confirmDelete(property: PropertyModel): void {
    this.deleteTarget.set(property);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  deleteProperty(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.deleteLoading.set(true);

    this.service.delete(target.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success(`Bien « ${target.name} » supprimé.`);
          this.deleteTarget.set(null);
          this.deleteLoading.set(false);
          const newPage = this.allProperties().length === 1 && this.currentPage() > 1
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

  // ── Count helpers ─────────────────────────────────────────────
  getStatutCount(status: string): number {
    if (status === 'all') return this.allProperties().length;
    return this.allProperties().filter(p => p.status === status).length;
  }

  getTypeCount(type: string): number {
    if (type === 'all') return this.allProperties().length;
    return this.allProperties().filter(p => p.property_type?.slug === type).length;
  }

  // ── Helpers ───────────────────────────────────────────────────
  private buildQueryParams(page: number): IQueryParam {
    return {
      page,
      perPage: this.itemsPerPage(),
    };
  }
}