import {
  Component, OnInit, OnDestroy, signal, computed, inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUsers, lucideUserCheck, lucideUserX, lucideSearch,
  lucidePlus, lucidePencil, lucideTrash2, lucideRefreshCw, lucideShield,
} from '@ng-icons/lucide';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { UserModel }     from '../../../models/user.model';
import { UserStatus }    from '../../../enums/user-status.enum';
import { UserService }   from '../../../services/user.service';
import { ToastService }  from '../../../../../shared/services/toast.service';
import { AuthService }   from '../../../../../core/auth/services/auth.service';
import { UserModal }     from '../../modals/user-modal/user-modal';

import { Pagination }             from '../../../../../shared/components/pagination/pagination';
import { LoadingComponent }       from '../../../../../shared/components/loading/loading';
import { EmptyStateComponent }    from '../../../../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-users-handler-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, UserModal,
            Pagination, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './users-handler-tab.html',
  viewProviders: [provideIcons({
    lucideUsers, lucideUserCheck, lucideUserX, lucideSearch,
    lucidePlus, lucidePencil, lucideTrash2, lucideRefreshCw, lucideShield,
  })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersHandlerTab implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly toast       = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly destroy$    = new Subject<void>();
  private readonly search$     = new Subject<string>();

  readonly UserStatus = UserStatus;

  // ── Données ───────────────────────────────────────────────────
  loading       = signal(true);
  deleteLoading = signal(false);
  users         = signal<UserModel[]>([]);

  // ── Pagination ────────────────────────────────────────────────
  currentPage  = signal(1);
  totalPages   = signal(1);
  totalItems   = signal(0);
  perPage      = 15;

  // ── Recherche ─────────────────────────────────────────────────
  searchQuery  = signal('');

  // ── Modales ───────────────────────────────────────────────────
  showModal       = signal(false);
  editingUser     = signal<UserModel | null>(null);
  deleteTarget    = signal<UserModel | null>(null);
  showDeleteConfirm = signal(false);

  // ── Computed ──────────────────────────────────────────────────
  deleteMessage = computed(() => {
    const u = this.deleteTarget();
    return u ? `${u.prenom} ${u.nom} sera supprimé définitivement.` : '';
  });

  // ── Computed KPIs ─────────────────────────────────────────────
  kpis = computed(() => {
    const all = this.users();
    return [
      { label: 'Total',    value: this.totalItems(), color: 'bg-blue-50 text-blue-700',    icon: 'lucideUsers'     },
      { label: 'Actifs',   value: all.filter(u => u.status === UserStatus.ACTIVE).length,   color: 'bg-green-50 text-green-700',  icon: 'lucideUserCheck' },
      { label: 'Suspendus',value: all.filter(u => u.status === UserStatus.SUSPENDED).length, color: 'bg-red-50 text-red-700', icon: 'lucideUserX'    },
    ];
  });
  // ── Computed pour l'utilisateur connecté ──────────────────────
  readonly currentUserId = computed(() => this.authService.user()?.id ?? null);

  // ── Helpers ───────────────────────────────────────────────────
  isCurrentUser(user: UserModel): boolean {
    return user.id === this.currentUserId();
  }
  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(q => { this.currentPage.set(1); this.loadUsers(q); });

    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement ────────────────────────────────────────────────
  loadUsers(search = this.searchQuery()): void {
    this.loading.set(true);
    this.userService.findAll({ page: this.currentPage(), perPage: this.perPage, search }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: r => {
        this.users.set(r.data);
        this.totalItems.set(r.total);
        this.totalPages.set(r.last_page);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.search$.next(value);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadUsers();
  }

  // ── Actions ───────────────────────────────────────────────────
  openAdd(): void {
    this.editingUser.set(null);
    this.showModal.set(true);
  }

  openEdit(user: UserModel): void {
    this.editingUser.set(user);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUser.set(null);
  }

  onSaved(user: UserModel): void {
    const isEditing = !!this.editingUser();
    this.closeModal();
    this.toast.success(isEditing ? 'Utilisateur mis à jour.' : 'Utilisateur créé.');
    this.loadUsers();
  }

  confirmDelete(user: UserModel): void {
    this.deleteTarget.set(user);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deleteTarget.set(null);
  }

  deleteUser(): void {
    const u = this.deleteTarget();
    if (!u) return;
    this.deleteLoading.set(true);
    this.userService.delete(u.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.deleteLoading.set(false);
        this.showDeleteConfirm.set(false);
        this.deleteTarget.set(null);
        this.toast.success('Utilisateur supprimé.');
        this.loadUsers();
      },
      error: err => {
        this.deleteLoading.set(false);
        this.toast.error(err?.error?.message ?? 'Erreur lors de la suppression.');
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  getInitials(u: UserModel): string {
    return `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase();
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      [UserStatus.ACTIVE]:    'bg-green-100 text-green-700',
      [UserStatus.SUSPENDED]: 'bg-red-100 text-red-600',
      [UserStatus.REJECTED]:  'bg-gray-100 text-gray-500',
    };
    return classes[status] ?? 'bg-gray-100 text-gray-500';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      [UserStatus.ACTIVE]:    'Actif',
      [UserStatus.SUSPENDED]: 'Suspendu',
      [UserStatus.REJECTED]:  'Rejeté',
    };
    return labels[status] ?? status;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  minOf(a: number, b: number): number { return Math.min(a, b); }
}
