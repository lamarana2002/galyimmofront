import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideX,
  lucideBanknote,
  lucideCalendar,
  lucideCheckCircle,
  lucideClock,
  lucideDownload,
  lucideFileText,
  lucideHash,
} from '@ng-icons/lucide';
import { FacturePayment } from '../../../../../features/payments/models/facture.model';
import { getPaymentMethodLabel } from '../../../../../features/payments/utils/payment.utils';

@Component({
  selector: 'app-payment-detail-drawer',
  standalone: true,
  imports: [CommonModule, NgIconComponent, DatePipe, DecimalPipe],
  templateUrl: './payment-detail-drawer.html',
  viewProviders: [
    provideIcons({
      lucideX,
      lucideBanknote,
      lucideCalendar,
      lucideCheckCircle,
      lucideClock,
      lucideDownload,
      lucideFileText,
      lucideHash,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailDrawer {
  payment = input.required<FacturePayment>();

  close = output<void>();

  getMethodLabel(method: string): string {
    return getPaymentMethodLabel(method);
  }
}
