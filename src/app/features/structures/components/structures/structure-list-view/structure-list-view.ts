import { Component, Input, output, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2, lucideBuilding, lucideUsers, lucideKey, lucideCrown,
  lucideCheck, lucideX, lucidePause, lucidePlay, lucideEye, lucideMail,
  lucideTrash2, lucideCheckCircle, lucideXCircle,
} from '@ng-icons/lucide';

import { StructureModel }    from '../../../models/structure.model';
import { StructureStatus }   from '../../../enums/structure-status.enum';
import { StructurePlanType } from '../../../enums/structure-plan-type.enum';
import {
  getHealthScore, getHealthScoreClass, getHealthTextClass,
  getInitials, getStatutLabel, getStatusBadgeClass, getStatusDotClass,
  getOwnerFullName, getPlanBadgeClass, getPlanLabel,
} from '../../../utils/structure.utils';

@Component({
  selector: 'app-structure-list-view',
  standalone: true,
  imports: [NgIconComponent, DatePipe, RouterLink],
  templateUrl: './structure-list-view.html',
  viewProviders: [
    provideIcons({
      lucideBuilding2, lucideBuilding, lucideUsers, lucideKey, lucideCrown,
      lucideCheck, lucideX, lucidePause, lucidePlay, lucideEye, lucideMail,
      lucideTrash2, lucideCheckCircle, lucideXCircle,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructureListView {

  @Input({ required: true }) structures!: StructureModel[];

  // Pagination — inputs du parent
  @Input() currentPage  = 1;
  @Input() itemsPerPage = 12;
  @Input() totalItems   = 0;
  @Input() hasNextPage  = false;
  @Input() hasPrevPage  = false;

  // Enums
  readonly StructureStatus   = StructureStatus;
  readonly StructurePlanType = StructurePlanType;

  // Utils
  readonly getStatutLabel      = getStatutLabel;
  readonly getStatusBadgeClass = getStatusBadgeClass;
  readonly getStatusDotClass   = getStatusDotClass;
  readonly getInitials         = getInitials;
  readonly getOwnerFullName    = getOwnerFullName;
  readonly getPlanBadgeClass   = getPlanBadgeClass;
  readonly getPlanLabel        = getPlanLabel;
  readonly getHealthScore      = getHealthScore;
  readonly getHealthScoreClass = getHealthScoreClass;
  readonly getHealthTextClass  = getHealthTextClass;

  // Outputs — tout remonte au parent
  readonly changePage   = output<number>();
  readonly changeStatus = output<{ id: number; status: StructureStatus }>();
  readonly changePlan   = output<number>();
  readonly contact      = output<StructureModel>();
  readonly delete       = output<StructureModel>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onStatusChange(s: StructureModel, status: StructureStatus): void {
    this.changeStatus.emit({ id: s.id, status });
  }

  onPlanChange(id: number): void {
    this.changePlan.emit(id);
  }

  onPageChange(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.changePage.emit(p);
  }

  onContact(s: StructureModel): void {
    this.contact.emit(s);
  }

  onDelete(s: StructureModel): void {
    this.delete.emit(s);
  }
}