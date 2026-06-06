import { Component, computed, input, output } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUser,
  lucideMail,
  lucidePhone,
  lucideShieldCheck,
  lucideRotateCcw,
  lucideX,
} from '@ng-icons/lucide';

import { ILocationUnit } from '../../../models/location-unit.model';
import { LocationStatusEnum } from '../../../enums/location-status.enum';

@Component({
  selector: 'app-unit-side-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, NgIconComponent],
  templateUrl: './unit-side-panel.html',
  viewProviders: [
    provideIcons({
      lucideUser,
      lucideMail,
      lucidePhone,
      lucideShieldCheck,
      lucideRotateCcw,
      lucideX,
    }),
  ],
})
export class UnitSidePanel {
  unit = input<ILocationUnit | null | undefined>(null);
  renewLoading = input<boolean>(false);
  terminateLoading = input<boolean>(false);

  contact = output<void>();
  renew = output<void>();
  terminate = output<void>();

  readonly LocationStatusEnum = LocationStatusEnum;

  joursRestants = computed(() => {
    const location = this.unit()?.current_location;
    if (!location?.end_date) return 0;
    const endDate = new Date(location.end_date);
    return Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000));
  });

  locationExpireBientot = computed(() => {
    const days = this.joursRestants();
    return days > 0 && days <= 60;
  });

  locationExpire = computed(() => {
    return (
      this.joursRestants() === 0 &&
      this.unit()?.current_location?.status === LocationStatusEnum.ACTIVE
    );
  });

  getInitials(prenom: string, nom: string): string {
    return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
  }
}
