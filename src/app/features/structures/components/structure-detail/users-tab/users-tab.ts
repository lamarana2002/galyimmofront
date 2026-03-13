import { Component, inject, Input } from '@angular/core';
import { StructureService } from '../../../services/structure.service';
import { PlanType, StructureDetail } from '../../../pages/structure-details/structure-details';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { StructureModel } from '../../../models/structure.model';
import { UserStatus } from '../../../../users/enums/user-status.enum';
import { GenreEnum } from '../../../../../shared/enums/genre.enum';

@Component({
  selector: 'app-users-tab',
  imports: [TitleCasePipe, DatePipe],
  templateUrl: './users-tab.html',
  styleUrl: './users-tab.css',
})
export class UsersTab {
  @Input({required: true}) structure!: StructureModel;
  structureService = inject(StructureService);
  UserStatus = UserStatus;
  GenreEnum = GenreEnum;

  // ── UI states ─────────────────────────────────────────────────
    showContactModal  = false;
    showDeleteConfirm = false;
    showPlanModal     = false;
    contactMessage    = '';
    contactSubject    = '';
    selectedPlan: PlanType = 'premium';

  getInitials(name?: string): string {
      return name ? this.structureService.getInitials(name) : '';
  }
  getUserFullName(nom: string, prenom: string): string{
    return this.structureService.getOwnerName(nom, prenom);
  }
}
