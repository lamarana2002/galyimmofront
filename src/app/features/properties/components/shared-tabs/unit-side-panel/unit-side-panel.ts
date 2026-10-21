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
import { LocationHelper } from '../../../utils/location.utils';

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
  readonly LocationHelper = LocationHelper;

  // Le back calcule désormais jours_restants (peut être négatif = en retard).
  // On ne recalcule localement que si le champ est absent (anciens payloads).
  joursRestants = computed(() => {
    const location = this.unit()?.current_location;
    if (!location) return 0;
    if (location.jours_restants !== undefined && location.jours_restants !== null) {
      return location.jours_restants;
    }
    const endDate = location.date_fin || location.end_date;
    if (!endDate) return 0;
    return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
  });

  locationExpireBientot = computed(() => {
    const days = this.joursRestants();
    return days > 0 && days <= 60;
  });

  locationExpire = computed(() => {
    return (
      this.joursRestants() <= 0 &&
      this.unit()?.current_location?.status === LocationStatusEnum.ACTIVE
    );
  });

  // Largeur de la barre de progression, bornée entre 0 et 100 (jours_restants
  // peut être négatif en cas de retard).
  progressPercent = computed(() => {
    const pct = 100 - (this.joursRestants() / 365) * 100;
    return Math.min(100, Math.max(0, pct));
  });

  getInitials(prenom: string, nom: string): string {
    return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
  }
}
