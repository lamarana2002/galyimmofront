import { Component, computed, input, output } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideShieldCheck, lucidePlus } from '@ng-icons/lucide';

import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state';
import { ILocationUnit } from '../../../models/location-unit.model';
import { ILocationModel } from '../../../models/location.model';

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
})
export class LeasesTab {
  unit = input.required<ILocationUnit | undefined | null>();

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

  getContratStatutClass(s: string): string {
    return (
      ({
        active: 'bg-green-100 text-green-700',
        expired: 'bg-gray-100 text-gray-500',
        terminated: 'bg-red-100 text-red-600',
        pending: 'bg-amber-100 text-amber-700',
      } as Record<string, string>)[s] ?? 'bg-gray-100 text-gray-500'
    );
  }
}
