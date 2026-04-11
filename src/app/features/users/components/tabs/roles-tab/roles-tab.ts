import {
  Component, OnInit, OnDestroy, signal, computed, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideShield, lucidePlus, lucidePencil, lucideTrash2,
  lucideRefreshCw, lucideKey,
} from '@ng-icons/lucide';
import { Subject, takeUntil } from 'rxjs';

import { IRole }        from '../../../models/role.model';
import { RoleService }  from '../../../services/role.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { RoleModal }    from '../../modals/role-modal/role-modal';

import { LoadingComponent }       from '../../../../../shared/components/loading/loading';
import { EmptyStateComponent }    from '../../../../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-roles-tab',
  standalone: true,
  imports: [CommonModule, NgIconComponent, RoleModal,
            LoadingComponent, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './roles-tab.html',
  viewProviders: [provideIcons({
    lucideShield, lucidePlus, lucidePencil, lucideTrash2,
    lucideRefreshCw, lucideKey,
  })],
})
export class RolesTab implements OnInit, OnDestroy {
  private readonly roleService = inject(RoleService);
  private readonly toast       = inject(ToastService);
  private readonly destroy$    = new Subject<void>();

  // ── Données ───────────────────────────────────────────────────
  loading       = signal(true);
  deleteLoading = signal(false);
  roles         = signal<IRole[]>([]);

  // ── Modales ───────────────────────────────────────────────────
  showModal    = signal(false);
  editingRole  = signal<IRole | null>(null);
  deleteTarget = signal<IRole | null>(null);
  showDeleteConfirm = signal(false);

  deleteMessage = computed(() => {
    const r = this.deleteTarget();
    return r
      ? `Le rôle « ${r.name} » sera supprimé. Les utilisateurs associés perdront ce rôle.`
      : '';
  });

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void { this.loadRoles(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement ────────────────────────────────────────────────
  loadRoles(): void {
    this.loading.set(true);
    this.roleService.findAll().pipe(takeUntil(this.destroy$)).subscribe({
      next:  r => { this.roles.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  // ── Actions ───────────────────────────────────────────────────
  openAdd(): void {
    this.editingRole.set(null);
    this.showModal.set(true);
  }

  openEdit(role: IRole): void {
    this.editingRole.set(role);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingRole.set(null);
  }

  onSaved(_role: IRole): void {
    const isEditing = !!this.editingRole();
    this.closeModal();
    this.toast.success(isEditing ? 'Rôle mis à jour.' : 'Rôle créé.');
    this.loadRoles();
  }

  confirmDelete(role: IRole): void {
    this.deleteTarget.set(role);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deleteTarget.set(null);
  }

  deleteRole(): void {
    const r = this.deleteTarget();
    if (!r) return;
    this.deleteLoading.set(true);
    this.roleService.delete(r.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.deleteLoading.set(false);
        this.showDeleteConfirm.set(false);
        this.deleteTarget.set(null);
        this.toast.success('Rôle supprimé.');
        this.loadRoles();
      },
      error: err => {
        this.deleteLoading.set(false);
        this.toast.error(err?.error?.message ?? 'Erreur lors de la suppression.');
      },
    });
  }
}
