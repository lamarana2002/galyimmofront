import { Component, computed, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideShieldCheck, lucidePlus, lucideEye } from '@ng-icons/lucide';

import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state';
import { ILocationUnit } from '../../../models/location-unit.model';
import { ILocationModel } from '../../../models/location.model';
import { LocationStatusEnum } from '../../../enums/location-status.enum';
import { LocationHelper } from '../../../utils/location.utils';
import { LeaseDetailDrawer } from '../lease-detail-drawer/lease-detail-drawer';

@Component({
  selector: 'app-leases-tab',
  standalone: true,
  imports: [CommonModule, NgIconComponent, DatePipe, DecimalPipe, TitleCasePipe, EmptyStateComponent, LeaseDetailDrawer],
  templateUrl: './leases-tab.html',
  viewProviders: [
    provideIcons({
      lucideShieldCheck,
      lucidePlus,
      lucideEye,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeasesTab {
  unit = input.required<ILocationUnit | undefined | null>();
  LocationStatutEnum = LocationStatusEnum;
  LocationHelper = LocationHelper;

  onNewLease = output<void>();

  selectedLocation = signal<ILocationModel | null>(null);

  viewDetails(location: ILocationModel): void {
    this.selectedLocation.set(location);
  }

  closeDetails(): void {
    this.selectedLocation.set(null);
  }

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
