import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { UnitStatutEnum } from '../../../enums/unit-status.enum';
import {
  getUnitStatusBadgeClass,
  getUnitStatusDotClass,
  getUnitStatusLabel,
} from '../../../utils/property.utils';
import { provideIcons } from '@ng-icons/core';
import {
  lucideTrendingUp,
  lucideBanknote,
  lucideWrench,
  lucideAlertTriangle,
} from '@ng-icons/lucide';
import { ProperttyStatusEnum } from '../../../enums/property-status.enum';
import { PropertyModel } from '../../../models/property.model';

@Component({
  selector: 'app-financial-tab',
  imports: [NgIcon, DecimalPipe],
  templateUrl: './financial-tab.html',
  styleUrl: './financial-tab.css',
  viewProviders: [
    provideIcons({ lucideTrendingUp, lucideBanknote, lucideWrench, lucideAlertTriangle }),
  ],
})
export class FinancialTab {
  @Input({ required: true }) bien!: PropertyModel;

  get totalLoyerPotentiel(): number {
    return this.bien.units?.reduce((s, u) => s + (u.rent_amount ?? 0), 0) ?? 0;
  }
  get totalCharges(): number {
    return this.bien.units?.reduce((s, u) => s + (u.monthly_charges ?? 0), 0) ?? 0;
  }
  get totalLoyer(): number {
    return (
      this.bien.units
        ?.filter((u) => u.status === UnitStatutEnum.RENTED)
        .reduce((s, u) => s + (u.rent_amount ?? 0), 0) ?? 0
    );
  }

  readonly getUnitStatutLabel = getUnitStatusLabel;
  readonly getUnitStatutClass = getUnitStatusBadgeClass;
  readonly getUnitStatutDotClass = getUnitStatusDotClass;
}
