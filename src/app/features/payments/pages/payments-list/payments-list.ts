import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBanknote,
  lucideDownload,
  lucideMoreVertical,
  lucideCheckCircle,
  lucideClock,
  lucideAlertTriangle,
  lucideFilter,
  lucideShieldCheck
} from '@ng-icons/lucide';
import { PaymentService } from '../../services/payment.service';
import { Payment } from '../../models/payment.model';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { formatPaymentPeriod, getPaymentMethodLabel } from '../../utils/payment.utils';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [CommonModule, NgIconComponent, Pagination],
  providers: [
    provideIcons({
      lucideBanknote,
      lucideDownload,
      lucideMoreVertical,
      lucideCheckCircle,
      lucideClock,
      lucideAlertTriangle,
      lucideFilter,
      lucideShieldCheck
    })
  ],
  templateUrl: './payments-list.html'
})
export class PaymentsListComponent implements OnInit {
  private paymentService = inject(PaymentService);

  payments = signal<Payment[]>([]);
  isLoading = signal(true);

  // Pagination
  currentPage = signal(1);
  perPage = signal(10);
  totalItems = signal(0);

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.isLoading.set(true);
    
    this.paymentService.getAllPayments({
      page: this.currentPage(),
      perPage: this.perPage()
    }).subscribe({
      next: (res) => {
        this.payments.set(res.data);
        this.totalItems.set(res.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadPayments();
  }

  formatPeriod(start: string, end: string): string {
    return formatPaymentPeriod(start, end);
  }

  getPaymentMethodLabel(method: string): string {
    return getPaymentMethodLabel(method);
  }
}
