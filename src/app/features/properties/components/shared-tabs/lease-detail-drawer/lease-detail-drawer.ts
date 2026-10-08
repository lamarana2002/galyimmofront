import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideX,
  lucideUser,
  lucideMail,
  lucidePhone,
  lucideShieldCheck,
  lucideBanknote,
  lucideDownload,
  lucideReceipt,
} from '@ng-icons/lucide';

import { ILocationModel } from '../../../models/location.model';
import { LocationHelper } from '../../../utils/location.utils';

@Component({
  selector: 'app-lease-detail-drawer',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  templateUrl: './lease-detail-drawer.html',
  viewProviders: [
    provideIcons({
      lucideX,
      lucideUser,
      lucideMail,
      lucidePhone,
      lucideShieldCheck,
      lucideBanknote,
      lucideDownload,
      lucideReceipt,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaseDetailDrawer {
  location = input.required<ILocationModel>();

  closed = output<void>();

  LocationHelper = LocationHelper;

  getInitials(nom?: string, prenom?: string): string {
    return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
  }

  close(): void {
    this.closed.emit();
  }
}
