import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideFileText,
  lucideShieldCheck,
  lucideClock,
  lucideBanknote,
  lucideSearch,
  lucideRefreshCw,
  lucideArrowRight,
  lucideDownload,
  lucideHome,
  lucideUsers,
  lucideChevronRight,
  lucideTriangleAlert,
  lucideRotateCcw,
  lucideX,
} from '@ng-icons/lucide';
import { Subject, takeUntil } from 'rxjs';

import { LocationService } from '../../services/location.service';
import { ILocationModel } from '../../models/location.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { LoadingComponent } from '../../../../shared/components/loading/loading';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { LocationStatusEnum } from '../../enums/location-status.enum';
import { LocationHelper } from '../../utils/location.utils';

@Component({
  selector: 'app-contrats',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgIconComponent,
    DatePipe,
    DecimalPipe,
    Pagination,
    LoadingComponent,
    EmptyStateComponent,
  ],
  templateUrl: './contrats.html',
  viewProviders: [
    provideIcons({
      lucideFileText,
      lucideShieldCheck,
      lucideClock,
      lucideBanknote,
      lucideSearch,
      lucideRefreshCw,
      lucideArrowRight,
      lucideDownload,
      lucideHome,
      lucideUsers,
      lucideChevronRight,
      lucideTriangleAlert,
      lucideRotateCcw,
      lucideX,
    }),
  ],
})
export class Contrats implements OnInit, OnDestroy {
  private readonly locationService = inject(LocationService);
  private readonly toast = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  LocationStatusEnum = LocationStatusEnum;
  LocationHelper = LocationHelper;


  loading = signal(true);
  error = signal<string | null>(null);
  allLocations = signal<ILocationModel[]>([]);
  filteredLocations = signal<ILocationModel[]>([]);

  currentPage = signal(1);
  itemsPerPage = signal(12);
  totalItems = signal(0);

  searchQuery = signal('');
  activeStatus = signal<'all' | 'active' | 'expired' | 'terminated' | 'pending'>('all');

  // Actions
  renewingId = signal<number | null>(null);
  terminatingId = signal<number | null>(null);

  readonly statusFilters: Array<{
    label: string;
    value: 'all' | 'active' | 'expired' | 'terminated' | 'pending';
  }> = [
    { label: 'Tous', value: 'all' },
    { label: 'Actifs', value: 'active' },
    { label: 'Expirés', value: 'expired' },
    { label: 'Résiliés', value: 'terminated' },
    { label: 'En attente', value: 'pending' },
  ];

  readonly totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));

  readonly kpis = computed(() => {
    const all = this.allLocations();
    return [
      {
        label: 'Total contrats',
        value: all.length,
        icon: 'lucideFileText',
        bgClass: 'bg-primary-100',
        iconClass: 'text-primary-700',
      },
      {
        label: 'Contrats actifs',
        value: all.filter((location) => location.status === LocationStatusEnum.ACTIVE).length,
        icon: 'lucideShieldCheck',
        bgClass: 'bg-green-100',
        iconClass: 'text-green-600',
      },
      {
        label: 'Contrats expirés',
        value: all.filter((location) => location.status === 'expired').length,
        icon: 'lucideClock',
        bgClass: 'bg-gray-100',
        iconClass: 'text-gray-500',
      },
      {
        label: 'Loyer mensuel total',
        value: all.reduce((sum, location) => sum + (location.montant ?? 0), 0),
        icon: 'lucideBanknote',
        bgClass: 'bg-secondary-100',
        iconClass: 'text-secondary-700',
      },
    ];
  });

  ngOnInit(): void {
    this.loadContracts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContracts(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    this.locationService
      .findAll({ page, perPage: this.itemsPerPage() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.allLocations.set(response.data);
          this.applyFilters();
          this.currentPage.set(response.current_page);
          this.itemsPerPage.set(response.per_page);
          this.totalItems.set(response.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Erreur lors du chargement des contrats.');
          this.loading.set(false);
        },
      });
  }

  applyFilters(): void {
    let result = [...this.allLocations()];

    if (this.searchQuery().trim()) {
      const q = this.searchQuery().toLowerCase();
      result = result.filter(
        (l) =>
          l.locataire?.nom?.toLowerCase().includes(q) ||
          l.locataire?.prenom?.toLowerCase().includes(q) ||
          l.property?.name?.toLowerCase().includes(q) ||
          l.unite_location?.unit_number?.toString().toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q),
      );
    }

    if (this.activeStatus() !== 'all') {
      result = result.filter((l) => l.status === this.activeStatus());
    }

    this.filteredLocations.set(result);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.applyFilters();
  }

  onStatusFilterChange(status: 'all' | 'active' | 'expired' | 'terminated' | 'pending'): void {
    this.activeStatus.set(status);
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.activeStatus.set('all');
    this.applyFilters();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > Math.ceil(this.totalItems() / this.itemsPerPage())) {
      return;
    }
    this.loadContracts(page);
  }

  renewContract(location: ILocationModel): void {
    if (this.renewingId()) return; // Prevent multiple clicks

    this.renewingId.set(location.id);
    this.locationService
      .renew(location.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toast.success('Contrat renouvelé avec succès.');
            this.loadContracts(this.currentPage());
          }
          this.renewingId.set(null);
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors du renouvellement du contrat.');
          this.renewingId.set(null);
        },
      });
  }

  terminateContract(location: ILocationModel): void {
    if (this.terminatingId()) return; // Prevent multiple clicks

    this.terminatingId.set(location.id);
    this.locationService
      .terminate(location.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toast.success('Contrat résilié avec succès.');
            this.loadContracts(this.currentPage());
          }
          this.terminatingId.set(null);
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors de la résiliation du contrat.');
          this.terminatingId.set(null);
        },
      });
  }

  getStatusCount(status: string): number {
    if (status === 'all') {
      return this.allLocations().length;
    }
    return this.allLocations().filter((location) => location.status === status).length;
  }
}
