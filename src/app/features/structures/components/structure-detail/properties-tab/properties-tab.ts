import { Component, inject, Input, NgModule } from '@angular/core';
import { StructureModel } from '../../../models/structure.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAlignLeft,
  lucideCalendar,
  lucideMail,
  lucideMapPin,
  lucidePhone,
  lucideUser,
  lucideUserX,
} from '@ng-icons/lucide';
import { StructureDetail } from '../../../pages/structure-details/structure-details';
import { StructureService } from '../../../services/structure.service';
import { PlanType } from '../../structures/structure-card/structure-card';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyTypeStyleConfig } from '../../../../properties/interfaces/property-type-styleConfig.interface';
import { ProperttyStatusEnum } from '../../../../properties/enums/property-status.enum';

@Component({
  selector: 'app-properties-tab',
  imports: [NgIcon, TitleCasePipe, FormsModule],
  templateUrl: './properties-tab.html',
  styleUrl: './properties-tab.css',
  viewProviders: [
    provideIcons({
      lucideUser,
      lucideMail,
      lucidePhone,
      lucideMapPin,
      lucideCalendar,
      lucideAlignLeft,
      lucideUserX,
    }),
  ],
})
export class PropertiesTab {
  @Input({ required: true }) structure!: StructureModel;
  structureService = inject(StructureService);
  // ── UI states ─────────────────────────────────────────────────
  showContactModal = false;
  showDeleteConfirm = false;
  showPlanModal = false;
  contactMessage = '';
  contactSubject = '';
  selectedPlan: PlanType = 'premium';

  PropertyStatus = ProperttyStatusEnum;

  propertyTypeStyles: Record<string, PropertyTypeStyleConfig> = {
    appartement: {
      bgClass: 'bg-primary-100',
      textClass: 'text-primary-600',
      borderClass: 'border-primary-200',
      icon: 'lucideBuilding',
    },
    villa: {
      bgClass: 'bg-secondary-100',
      textClass: 'text-secondary-500',
      borderClass: 'border-secondary-200',
      icon: 'lucideHome',
    },
    commercial: {
      bgClass: 'bg-amber-100',
      textClass: 'text-amber-600',
      borderClass: 'border-amber-200',
      icon: 'lucideStore',
    },
    studio: {
      bgClass: 'bg-purple-100',
      textClass: 'text-purple-600',
      borderClass: 'border-purple-200',
      icon: 'lucideDoorOpen',
    },
  };

  defaultStyle: PropertyTypeStyleConfig = {
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-200',
    icon: 'lucideHelpCircle',
  };

  getInitials(name?: string): string {
    return name ? this.structureService.getInitials(name) : '';
  }
  sendContactMessage(): void {
    console.log('Message envoyé à', this.structure?.owner?.email);
    // this.addAuditLog(`Message envoyé au propriétaire : "${this.contactSubject}".`);
    this.showContactModal = false;
    this.contactMessage = '';
    this.contactSubject = '';
  }
}
