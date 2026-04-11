import { Component, inject, Input, computed } from '@angular/core';
import { DatePipe } from '@angular/common';

import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state';

import { StructureService } from '../../../services/structure.service';
import { StructureModel } from '../../../models/structure.model';
import { UserStatus } from '../../../../users/enums/user-status.enum';
import { GenreEnum } from '../../../../../shared/enums/genre.enum';
import { NgIcon } from '@ng-icons/core';
import { getInitials, getOwnerFullName } from '../../../utils/structure.utils';

@Component({
  selector: 'app-users-tab',
  standalone: true,
  imports: [DatePipe, NgIcon, EmptyStateComponent],
  templateUrl: './users-tab.html',
})
export class UsersTab {
  @Input({ required: true }) structure!: StructureModel;
  
  protected readonly structureService = inject(StructureService);
  protected readonly UserStatus = UserStatus;
  protected readonly GenreEnum = GenreEnum;

  // ── Getters ───────────────────────────────────────────────────
  protected get users() {
    return this.structure.users ?? [];
  }

  protected hasUsers = computed(() => this.users.length > 0);

  // ── Méthodes utilitaires ─────────────────────────────────────
  protected getUserFullName(user: { nom: string; prenom: string }): string {
    return getOwnerFullName(user.nom, user.prenom);
  }

  protected getUserInitials(user: { nom: string; prenom: string }): string {
    const fullName = this.getUserFullName(user);
    return getInitials(fullName);
  }

  protected getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      [UserStatus.ACTIVE]: 'bg-green-100 text-green-700',
      [UserStatus.SUSPENDED]: 'bg-red-100 text-red-600',
      [UserStatus.REJECTED]: 'bg-gray-100 text-gray-600',
    };
    return statusMap[status] ?? 'bg-gray-100 text-gray-600';
  }

  protected getStatusDotClass(status: string): string {
    const statusMap: Record<string, string> = {
      [UserStatus.ACTIVE]: 'bg-green-500',
      [UserStatus.SUSPENDED]: 'bg-red-500',
      [UserStatus.REJECTED]: 'bg-amber-500',
    };
    return statusMap[status] ?? 'bg-gray-500';
  }

  protected getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      [UserStatus.ACTIVE]: 'Actif',
      [UserStatus.SUSPENDED]: 'Suspendu',
      [UserStatus.REJECTED]: 'Rejjete',
    };
    return statusMap[status] ?? status;
  }

  protected getRoleLabel(role?: string): string {
    const roleMap: Record<string, string> = {
      admin: 'Administrateur',
      owner: 'Propriétaire',
      manager: 'Gestionnaire',
      agent: 'Agent',
      employee: 'Employé',
    };
    return roleMap[role?.toLowerCase() ?? ''] ?? role ?? 'Employé';
  }
}