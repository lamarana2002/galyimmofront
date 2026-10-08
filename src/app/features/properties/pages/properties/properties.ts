import { Component, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
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
import { PropertyTypeService } from '../../services/property-type.service';
import { FilterProperty } from '../../interfaces/filter-property.interface';
import { PropertyKpis } from '../../models/property-kpis.model';

// Utils
import * as propertyUtils from '../../utils/property.utils';
import { IQueryParam } from '../../../../shared/interfaces/query-parms.interface';
import { AddPropertyModal } from "../../components/modals/add-property-modal/add-property-modal";
import { PropertyGridView } from "../../components/properties/property-grid-view/property-grid-view";
import { ProfileService } from '../../../../core/auth/services/profile.service';
import { PropertyListView } from "../../components/properties/property-list-view/property-list-view";

import { Pagination }             from '../../../../shared/components/pagination/pagination';
import { LoadingComponent }       from '../../../../shared/components/loading/loading';
import { EmptyStateComponent }    from '../../../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { ToastService }           from '../../../../shared/services/toast.service';

type PropertySortKey = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'occupation_desc';

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
  private readonly propertyTypeService = inject(PropertyTypeService);
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

  // Tous les biens de la structure sont chargés en une fois : au-delà de
  // ce nombre, il faudrait repasser le filtrage/tri côté serveur.
  private readonly FETCH_PAGE_SIZE = 500;

  // ── Pagination (locale, sur les résultats déjà filtrés) ────────
  currentPage  = signal(1);
  itemsPerPage = signal(12);

  // ── UI ────────────────────────────────────────────────────────
  viewMode     = signal<'grid' | 'table'>('grid');
  searchQuery  = signal('');
  activeStatut = signal('all');
  activeType   = signal<string>('all');

  // ── Modales ───────────────────────────────────────────────────
  editingProperty = signal<PropertyModel | null>(null);
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

  // Types (chargés depuis le backend)
  typeOptions = signal<{ value: string; label: string; icon: string }[]>([]);

  // ── Tri ───────────────────────────────────────────────────────
  sortBy = signal<PropertySortKey>('date_desc');
  readonly sortOptions = [
    { value: 'date_desc' as const,       label: 'Plus récent' },
    { value: 'date_asc' as const,        label: 'Plus ancien' },
    { value: 'name_asc' as const,        label: 'Nom (A→Z)' },
    { value: 'name_desc' as const,       label: 'Nom (Z→A)' },
    { value: 'occupation_desc' as const, label: "Taux d'occupation" },
  ];

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

  totalItems = computed(() => this.filteredProperties().length);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage()))
  );

  // Sous-ensemble affiché sur la page locale courante
  pagedProperties = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredProperties().slice(start, start + this.itemsPerPage());
  });

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    if (!this.profile.userStructure) {
      this.router.navigate(['']);
    }else {
      this.structureId?.set(this.profile.userStructure)
    }
    this.loadPropertyTypes();
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement ────────────────────────────────────────────────
  loadPropertyTypes(): void {
    this.propertyTypeService.findAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        const options = response.data.map(type => ({
          value: type.slug,
          label: type.name,
          icon: type.icon
        }));
        this.typeOptions.set(options);
      },
      error: () => this.toast.error('Impossible de charger les types de bien.')
    });
  }

  loadAll(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      properties: this.service.findAll({ page: 1, perPage: this.FETCH_PAGE_SIZE }),
      kpis: this.service.getKpis(),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ properties, kpis }) => {
        this.allProperties.set(properties.data);
        this.applyFilters(this.buildFilterData());
        this.kpisData.set(kpis);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Erreur lors du chargement.');
        this.loading.set(false);
      },
    });
  }

  editProperty(id: number): void {
    const property = this.allProperties().find(p => p.id === id) ?? null;
    this.editingProperty.set(property);
    this.addPropertyModal.set(true);
  }

  // ── Filtrage local ────────────────────────────────────────────
  applyFilters(filter?: FilterProperty & IQueryParam & { type?: string }): void {
    let result = [...this.allProperties()];

    if (filter?.search?.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(p => {
        const fullAddress = propertyUtils.getPropertyFullAddress(p).toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q) ||
          fullAddress.includes(q)
        );
      });
    }

    if (filter?.status && filter.status !== 'all') {
      result = result.filter(p => p.status === filter.status);
    }

    if (filter?.type && filter.type !== 'all') {
      result = result.filter(p => p.property_type?.slug === filter.type);
    }

    result = this.sortProperties(result);

    this.filteredProperties.set(result);

    // Si les résultats ont rétréci (filtre, suppression), on ramène la
    // page locale dans les clous plutôt que de laisser une page vide.
    const maxPage = Math.max(1, Math.ceil(result.length / this.itemsPerPage()));
    if (this.currentPage() > maxPage) this.currentPage.set(maxPage);
  }

  private sortProperties(list: PropertyModel[]): PropertyModel[] {
    const sorted = [...list];
    switch (this.sortBy()) {
      case 'name_asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'date_asc':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'occupation_desc':
        return sorted.sort(
          (a, b) => propertyUtils.getPropertyOccupationRate(b) - propertyUtils.getPropertyOccupationRate(a),
        );
      case 'date_desc':
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
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
    this.currentPage.set(1);
    this.applyFilters();
  }

  // ── Handlers filtres ──────────────────────────────────────────
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
    this.applyFilters(this.buildFilterData());
  }

  onStatusFilterChange(status: string): void {
    this.activeStatut.set(status);
    this.currentPage.set(1);
    this.applyFilters(this.buildFilterData());
  }

  onTypeFilterChange(type: string): void {
    this.activeType.set(type);
    this.currentPage.set(1);
    this.applyFilters(this.buildFilterData());
  }

  onSortChange(sort: PropertySortKey): void {
    this.sortBy.set(sort);
    this.currentPage.set(1);
    this.applyFilters(this.buildFilterData());
  }

  onViewModeChange(mode: 'grid' | 'table'): void {
    this.viewMode.set(mode);
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  // ── Actions ───────────────────────────────────────────────────
  onStatusChanged(data: { id: number; status: PropertyStatusEnum }): void {
    this.service.changeStatus(data.id, data.status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Statut mis à jour avec succès.');
          this.loadAll();
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
          this.loadAll();
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
}