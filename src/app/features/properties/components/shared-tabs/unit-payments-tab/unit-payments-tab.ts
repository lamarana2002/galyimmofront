import { Component, Input, OnInit, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideBanknote,
  lucideDownload,
  lucideMoreVertical,
  lucideCheckCircle,
  lucideClock,
  lucideAlertTriangle
} from '@ng-icons/lucide';
import { PaymentService } from '../../../../../features/payments/services/payment.service';
import { Payment, ContractFinancialSummary } from '../../../../../features/payments/models/payment.model';
import { formatPaymentPeriod, getPaymentMethodLabel } from '../../../../../features/payments/utils/payment.utils';

@Component({
  selector: 'app-unit-payments-tab',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      lucidePlus,
      lucideBanknote,
      lucideDownload,
      lucideMoreVertical,
      lucideCheckCircle,
      lucideClock,
      lucideAlertTriangle
    })
  ],
  templateUrl: './unit-payments-tab.html'
})
export class UnitPaymentsTab implements OnInit {
  @Input() unitId!: number;
  @Output() addPayment = new EventEmitter<void>();

  private paymentService = inject(PaymentService);

  payments = signal<Payment[]>([]);
  summary = signal<ContractFinancialSummary | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.isLoading.set(true);
    this.paymentService.getUnitPayments(this.unitId.toString()).subscribe({
      next: (res) => {
        if (res.success) {
          this.payments.set(res.data.payments);
          if (res.data.summary) {
            this.summary.set(res.data.summary);
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onAddPayment() {
    this.addPayment.emit();
  }

  formatPeriod(start: string, end: string): string {
    return formatPaymentPeriod(start, end);
  }

  getPaymentMethodLabel(method: string): string {
    return getPaymentMethodLabel(method);
  }
}
