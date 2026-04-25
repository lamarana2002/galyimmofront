import {
  Component, Input, OnInit, OnDestroy, output, signal, computed, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideX, lucideSave, lucideShield, lucideLoader, lucideKey,
} from '@ng-icons/lucide';
import { Subject, switchMap, map, takeUntil } from 'rxjs';

import { IRole, IPermission }   from '../../../models/role.model';
import { RoleService }           from '../../../services/role.service';
import { CreateRolePayload, UpdateRolePayload } from '../../../interfaces/role-payload.interface';

interface PermissionGroup {
  resource: string;
  permissions: IPermission[];
}

@Component({
  selector: 'app-role-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  templateUrl: './role-modal.html',
  viewProviders: [provideIcons({ lucideX, lucideSave, lucideShield, lucideLoader, lucideKey })],
})
export class RoleModal implements OnInit, OnDestroy {
  @Input() role: IRole | null = null;

  readonly saved  = output<IRole>();
  readonly cancel = output<void>();

  private readonly roleService = inject(RoleService);
  private readonly destroy$    = new Subject<void>();

  // ── État ──────────────────────────────────────────────────────
  saving              = signal(false);
  error               = signal<string | null>(null);
  loadingPermissions  = signal(false);
  allPermissions      = signal<IPermission[]>([]);
  selectedPermissions = signal<number[]>([]);
  roleName            = signal('');

  // ── Computed ──────────────────────────────────────────────────
  isEdit = computed(() => !!this.role);
  title  = computed(() => this.isEdit() ? 'Modifier le rôle' : 'Nouveau rôle');
  isValid = computed(() => this.roleName().trim() !== '');

  permissionGroups = computed((): PermissionGroup[] => {
    const perms = this.allPermissions();
    const groups: Record<string, IPermission[]> = {};

    perms.forEach(p => {
      const resource = p.name.split('.')[0] ?? 'other';
      if (!groups[resource]) groups[resource] = [];
      groups[resource].push(p);
    });

    return Object.entries(groups).map(([resource, permissions]) => ({ resource, permissions }));
  });

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadPermissions();
    if (this.role) {
      this.roleName.set(this.role.name);
      this.selectedPermissions.set(this.role.permissions?.map(p => p.id) ?? []);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement ────────────────────────────────────────────────
  loadPermissions(): void {
    this.loadingPermissions.set(true);
    this.roleService.allPermissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  r => { this.allPermissions.set(r.data); this.loadingPermissions.set(false); },
        error: () => this.loadingPermissions.set(false),
      });
  }

  // ── Sélection permissions ─────────────────────────────────────
  togglePermission(id: number): void {
    this.selectedPermissions.update(perms =>
      perms.includes(id) ? perms.filter(p => p !== id) : [...perms, id]
    );
  }

  isSelected(id: number): boolean {
    return this.selectedPermissions().includes(id);
  }

  isGroupFullySelected(group: PermissionGroup): boolean {
    return group.permissions.every(p => this.isSelected(p.id));
  }

  toggleGroup(group: PermissionGroup): void {
    const allSelected = this.isGroupFullySelected(group);
    const ids = group.permissions.map(p => p.id);
    this.selectedPermissions.update(perms => {
      const without = perms.filter(id => !ids.includes(id));
      return allSelected ? without : [...without, ...ids];
    });
  }

  // ── Sauvegarde ────────────────────────────────────────────────
  save(): void {
    if (!this.isValid() || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);

    if (this.role) {
      const payload: UpdateRolePayload = { id: this.role.id, name: this.roleName() };
      this.roleService.update(payload).pipe(
        switchMap(res =>
          this.roleService.syncPermissions(this.role!.id, { permissions: this.selectedPermissions() }).pipe(
            map(() => res)
          )
        ),
        takeUntil(this.destroy$)
      ).subscribe({
        next:  res => { this.saving.set(false); this.saved.emit(res.data); },
        error: err => { this.saving.set(false); this.error.set(err?.error?.message ?? 'Erreur lors de la mise à jour.'); },
      });
    } else {
      const payload: CreateRolePayload = {
        name:        this.roleName(),
        permissions: this.selectedPermissions(),
      };
      this.roleService.create(payload).pipe(takeUntil(this.destroy$)).subscribe({
        next:  res => { this.saving.set(false); this.saved.emit(res.data); },
        error: err => { this.saving.set(false); this.error.set(err?.error?.message ?? 'Erreur lors de la création.'); },
      });
    }
  }

  close(): void { this.cancel.emit(); }
}
