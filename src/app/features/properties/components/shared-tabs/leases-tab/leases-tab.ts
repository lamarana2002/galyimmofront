import { Component, computed, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideShieldCheck, lucidePlus } from '@ng-icons/lucide';

import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state';
import { ILocationUnit } from '../../../models/location-unit.model';
import { ILocationModel } from '../../../models/location.model';
import { LocationStatusEnum } from '../../../enums/location-status.enum';
import { LocationHelper } from '../../../utils/location.utils';

@Component({
  selector: 'app-leases-tab',
  standalone: true,
  imports: [CommonModule, NgIconComponent, DatePipe, DecimalPipe, TitleCasePipe, EmptyStateComponent],
  templateUrl: './leases-tab.html',
  viewProviders: [
    provideIcons({
      lucideShieldCheck,
      lucidePlus,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeasesTab {
  unit = input.required<ILocationUnit | undefined | null>();
  LocationStatutEnum = LocationStatusEnum;
  LocationHelper = LocationHelper;

  onNewLease = output<void>();

  allLocations = computed(() => {
    const u = this.unit();
    if (!u) return [];
    const locations: ILocationModel[] = [...(u.locations ?? [])];
    if (u.current_location) {
      const index = locations.findIndex((l) => l.id === u.current_location?.id);
      if (index !== -1) locations.splice(index, 1);
      locations.unshift(u.current_location);
    }
    return locations;
  });

  getInitials(nom: string, prenom: string): string {
    return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
  }
}
