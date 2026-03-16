import { Component, Input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2, lucideBuilding, lucideUsers, lucideKey, lucideCrown,
  lucideClock, lucideCheck, lucideX, lucidePause, lucidePlay, lucideEye,
  lucideMail, lucideTrash2, lucideEllipsisVertical,
} from '@ng-icons/lucide';

import { StructureModel }    from '../../../models/structure.model';
import { StructureStatus }   from '../../../enums/structure-status.enum';
import { StructurePlanType } from '../../../enums/structure-plan-type.enum';
import {
  getHealthScore, getHealthScoreClass, getHealthTextClass,
  getInitials, getStatutLabel, getStatusBadgeClass,
  getOwnerFullName, getPlanBadgeClass, getPlanLabel,
} from '../../../utils/structure.utils';

@Component({
  selector: 'app-structure-grid-view',
  standalone: true,
  imports: [NgIconComponent, RouterLink, DatePipe],
  templateUrl: './structure-grid-view.html',
  viewProviders: [
    provideIcons({
      lucideBuilding2, lucideBuilding, lucideUsers, lucideKey, lucideCrown,
      lucideClock, lucideCheck, lucideX, lucidePause, lucidePlay, lucideEye,
      lucideMail, lucideTrash2, lucideEllipsisVertical,
    }),
  ],
})
export class StructureGridView {

  @Input({ required: true }) structures!: StructureModel[];

  // Enums
  readonly StructureStatus   = StructureStatus;
  readonly StructurePlanType = StructurePlanType;

  // Utils
  readonly getStatutLabel      = getStatutLabel;
  readonly getStatusBadgeClass = getStatusBadgeClass;
  readonly getInitials         = getInitials;
  readonly getOwnerFullName    = getOwnerFullName;
  readonly getPlanBadgeClass   = getPlanBadgeClass;
  readonly getPlanLabel        = getPlanLabel;
  readonly getHealthScore      = getHealthScore;
  readonly getHealthScoreClass = getHealthScoreClass;
  readonly getHealthTextClass  = getHealthTextClass;

  // Outputs
  readonly changeStatus = output<{ id: number; status: StructureStatus }>();
  readonly changePlan   = output<number>();
  readonly contact      = output<StructureModel>();
  readonly delete       = output<StructureModel>();

  // ID de la card dont le menu est ouvert — null si aucun
  openMenuId = signal<number | null>(null);

  toggleMenu(id: number): void {
    this.openMenuId.update(current => current === id ? null : id);
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  onStatusChange(s: StructureModel, status: StructureStatus): void {
    this.changeStatus.emit({ id: s.id, status });
    this.closeMenu();
  }

  onPlanChange(s: StructureModel): void {
    this.changePlan.emit(s.id);
    this.closeMenu();
  }

  onContact(s: StructureModel): void {
    this.contact.emit(s);
    this.closeMenu();
  }

  onDelete(s: StructureModel): void {
    this.delete.emit(s);
    this.closeMenu();
  }
}