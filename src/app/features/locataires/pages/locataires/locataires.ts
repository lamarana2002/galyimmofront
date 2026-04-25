import { Component, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUsers, lucideUserCheck, lucideUserX, lucideSearch,
  lucideSearchX, lucidePlus, lucideLayoutGrid, lucideList,
  lucideEye, lucidePencil, lucideTrash2, lucidePhone, lucideMail,
  lucideTriangleAlert, lucideRefreshCw,
} from '@ng-icons/lucide';
import { Subject, takeUntil } from 'rxjs';

import { ILocataire }        from '../../models/locataire.model';
import { UserStatusEnum }    from '../../enums/user-status.enum';
import { LocataireService }  from '../../services/locataire.service';
import { ToastService }      from '../../../../shared/services/toast.service';
import { LocataireModal }    from '../../components/modals/locataire-modal/locataire-modal';

import { Pagination }             from '../../../../shared/components/pagination/pagination';
import { LoadingComponent }       from '../../../../shared/components/loading/loading';
import { EmptyStateComponent }    from '../../../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-locataires',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgIconComponent, LocataireModal,
            Pagination, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './locataires.html',
  viewProviders: [provideIcons({
    lucideUsers, lucideUserCheck, lucideUserX, lucideSearch,
    lucideSearchX, lucidePlus, lucideLayoutGrid, lucideList,
    lucideEye, lucidePencil, lucideTrash2, lucidePhone, lucideMail,
    lucideTriangleAlert, lucideRefreshCw,
  })],
})
export class Locataires implements OnInit, OnDestroy {

  private readonly service  = inject(LocataireService);
  private readonly toast    = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  // Enums
  readonly UserStatus = UserStatusEnum;

  // ── État ──────────────────────────────────────────────────────
  loading       = signal(true);
  error         = signal<string | null>(null);
  deleteLoading = signal(false);

  // ── Données ───────────────────────────────────────────────────
  allLocataires      = signal<ILocataire[]>([]);
  filteredLocataires = signal<ILocataire[]>([]);

  // ── Pagination ────────────────────────────────────────────────
  currentPage  = signal(1);
  itemsPerPage = signal(12);
  totalItems   = signal(0);

  // ── UI ────────────────────────────────────────────────────────
  viewMode     = signal<'grid' | 'table'>('grid');
  searchQuery  = signal('');
  activeStatus = signal<string>('all');

  // ── Modales ───────────────────────────────────────────────────
  showModal       = signal(false);
  editingLocataire = signal<ILocataire | null>(null);
  deleteTarget    = signal<ILocataire | null>(null);

  // ── Filtres ───────────────────────────────────────────────────
  readonly statusFilters = [
    { label: 'Tous',     value: 'all'                 },
    { label: 'Actifs',   value: UserStatusEnum.ACTIF  },
    { label: 'Archivés', value: UserStatusEnum.ARCHIVE },
  ];

  // ── Computed ──────────────────────────────────────────────────
  deleteMessage = computed(() => {
    const t = this.deleteTarget();
    return t ? `${t.full_name} sera définitivement supprimé. Cette action est irréversible.` : '';
  });

  // ── Computed KPIs ─────────────────────────────────────────────
  kpis = computed(() => {
    const all = this.allLocataires();
    return [
      {
        label:     'Total locataires',
        value:     this.totalItems(),
        icon:      'lucideUsers',
        bgClass:   'bg-primary-100',
        iconClass: 'text-primary-700',
      },
      {
        label:     'Actifs',
        value:     all.filter(l => l.status === UserStatusEnum.ACTIF).length,
        icon:      'lucideUserCheck',
        bgClass:   'bg-green-100',
        iconClass: 'text-green-600',
      },
      {
        label:     'Archivés',
        value:     all.filter(l => l.status === UserStatusEnum.ARCHIVE).length,
        icon:      'lucideUserX',
        bgClass:   'bg-orange-100',
        iconClass: 'text-orange-600',
      },
    ];
  });

  totalPages = computed(() =>
    Math.ceil(this.totalItems() / this.itemsPerPage())
  );

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement ────────────────────────────────────────────────
  loadAll(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.findAll({ page, perPage: this.itemsPerPage() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.allLocataires.set(response.data);
          this.applyFilters();

          this.currentPage.set(response.current_page);
          this.itemsPerPage.set(response.per_page);
          this.totalItems.set(response.total);

          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Erreur lors du chargement.');
          this.loading.set(false);
        },
      });
  }

  // ── Filtrage local ─────────────────────────────────────────────
  applyFilters(): void {
    let result = [...this.allLocataires()];

    if (this.searchQuery().trim()) {
      const q = this.searchQuery().toLowerCase();
      result = result.filter(l =>
        l.nom.toLowerCase().includes(q)       ||
        l.prenom.toLowerCase().includes(q)    ||
        l.email.toLowerCase().includes(q)     ||
        l.telephone.toLowerCase().includes(q)
      );
    }

    if (this.activeStatus() !== 'all') {
      result = result.filter(l => l.status === this.activeStatus());
    }

    this.filteredLocataires.set(result);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.activeStatus.set('all');
    this.applyFilters();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.applyFilters();
  }

  onStatusFilterChange(status: string): void {
    this.activeStatus.set(status);
    this.applyFilters();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.loadAll(page);
  }

  // ── Modales ───────────────────────────────────────────────────
  openAdd(): void {
    this.editingLocataire.set(null);
    this.showModal.set(true);
  }

  openEdit(l: ILocataire): void {
    this.editingLocataire.set(l);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingLocataire.set(null);
  }

  onSaved(locataire: ILocataire): void {
    const isEdit = !!this.editingLocataire();
    this.closeModal();
    this.toast.success(
      isEdit
        ? `Locataire « ${locataire.full_name} » modifié.`
        : `Locataire « ${locataire.full_name} » ajouté.`
    );
    this.loadAll(this.currentPage());
  }

  confirmDelete(l: ILocataire): void {
    this.deleteTarget.set(l);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  deleteLocataire(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.deleteLoading.set(true);

    this.service.delete(target.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success(`Locataire « ${target.full_name} » supprimé.`);
          this.deleteTarget.set(null);
          this.deleteLoading.set(false);
          const newPage = this.allLocataires().length === 1 && this.currentPage() > 1
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
  getInitials(l: ILocataire): string {
    return `${l.prenom?.[0] ?? ''}${l.nom?.[0] ?? ''}`.toUpperCase();
  }

  getStatusCount(status: string): number {
    if (status === 'all') return this.allLocataires().length;
    return this.allLocataires().filter(l => l.status === status).length;
  }
}