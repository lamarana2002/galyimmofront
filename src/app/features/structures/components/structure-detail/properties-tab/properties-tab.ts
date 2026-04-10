import { Component, inject, Input, computed } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding,
  lucideHome,
  lucideStore,
  lucideDoorOpen,
  lucideHelpCircle,
  lucideMapPin,
} from '@ng-icons/lucide';
import { TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StructureModel } from '../../../models/structure.model';
import { StructureService } from '../../../services/structure.service';
import { PropertyTypeStyleConfig } from '../../../../properties/interfaces/property-type-styleConfig.interface';
import { PropertyStatusEnum } from '../../../../properties/enums/property-status.enum';

@Component({
  selector: 'app-properties-tab',
  standalone: true,
  imports: [NgIcon, TitleCasePipe, FormsModule],
  templateUrl: './properties-tab.html',
  viewProviders: [
    provideIcons({
      lucideBuilding,
      lucideHome,
      lucideStore,
      lucideDoorOpen,
      lucideHelpCircle,
      lucideMapPin,
    }),
  ],
})
export class PropertiesTab {
  @Input({ required: true }) structure!: StructureModel;
  
  protected readonly structureService = inject(StructureService);
  protected readonly PropertyStatus = PropertyStatusEnum;

  // ── Configuration des styles par type de propriété ────────────
  protected readonly propertyTypeStyles: Record<string, PropertyTypeStyleConfig> = {
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
    immeuble: {
      bgClass: 'bg-indigo-100',
      textClass: 'text-indigo-600',
      borderClass: 'border-indigo-200',
      icon: 'lucideBuilding',
    },
    terrain: {
      bgClass: 'bg-emerald-100',
      textClass: 'text-emerald-600',
      borderClass: 'border-emerald-200',
      icon: 'lucideMapPin',
    },
  };

  protected readonly defaultStyle: PropertyTypeStyleConfig = {
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-600',
    borderClass: 'border-gray-200',
    icon: 'lucideHelpCircle',
  };

  // ── Getters pratiques ─────────────────────────────────────────
  protected get properties() {
    return this.structure.properties ?? [];
  }

  protected hasProperties = computed(() => this.properties.length > 0);

  // ── Méthodes utilitaires ──────────────────────────────────────
  protected getPropertyStyle(typeName?: string): PropertyTypeStyleConfig {
    return typeName? this.propertyTypeStyles[typeName?.toLowerCase()] : this.defaultStyle;
  }

  protected getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      [PropertyStatusEnum.RENTED]: 'bg-green-100 text-green-700',
      [PropertyStatusEnum.AVAILABLE]: 'bg-blue-100 text-blue-700',
      [PropertyStatusEnum.UNDER_RENOVATION]: 'bg-orange-100 text-orange-700',
      [PropertyStatusEnum.SOLD]: 'bg-gray-100 text-gray-700',
    };
    return statusMap[status] ?? 'bg-gray-100 text-gray-600';
  }

  protected getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      [PropertyStatusEnum.RENTED]: 'Loué',
      [PropertyStatusEnum.AVAILABLE]: 'Disponible',
      [PropertyStatusEnum.SOLD]: 'Vendu',
      [PropertyStatusEnum.UNDER_RENOVATION]: 'Sous renovation',
    };
    return statusMap[status] ?? status;
  }
}