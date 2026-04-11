import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUser,
  lucideMail,
  lucidePhone,
  lucideMapPin,
  lucideUserPlus,
} from '@ng-icons/lucide';
import { ILocationUnit } from '../../../models/location-unit.model';

@Component({
  selector: 'app-tenant-tab',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  templateUrl: './tenant-tab.html',
  viewProviders: [
    provideIcons({
      lucideUser,
      lucideMail,
      lucidePhone,
      lucideMapPin,
      lucideUserPlus,
    }),
  ],
})
export class TenantTab {
  unit = input.required<ILocationUnit | undefined | null>();

  onContact = output<void>();
  onAffect = output<void>();

  getInitials(nom: string, prenom: string): string {
    return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
  }
}
