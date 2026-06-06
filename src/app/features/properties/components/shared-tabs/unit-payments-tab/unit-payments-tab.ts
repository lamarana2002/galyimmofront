import {
  Component,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  inject,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideBanknote,
  lucideDownload,
  lucideCheckCircle,
  lucideClock,
  lucideAlertTriangle,
  lucideEye,
  lucideFileText,
  lucideChevronRight,
  lucideRefreshCw,
  lucideCalendar,
} from '@ng-icons/lucide';
import { FactureService } from '../../../../../features/payments/services/facture.service';
import { Facture, FacturePayment } from '../../../../../features/payments/models/facture.model';
import { formatPaymentPeriod, getPaymentMethodLabel } from '../../../../../features/payments/utils/payment.utils';
import { PaymentDetailDrawer } from './payment-detail-drawer';

@Component({
  selector: 'app-unit-payments-tab',
  standalone: true,
  imports: [CommonModule, NgIconComponent, DatePipe, DecimalPipe, PaymentDetailDrawer],
  providers: [
    provideIcons({
      lucidePlus,
      lucideBanknote,
      lucideDownload,
      lucideCheckCircle,
      lucideClock,
      lucideAlertTriangle,
      lucideEye,
      lucideFileText,
      lucideChevronRight,
      lucideRefreshCw,
      lucideCalendar,
    }),
  ],
  templateUrl: './unit-payments-tab.html',
})
export class UnitPaymentsTab implements OnChanges {
  @Input() locationId: number | null = null;
  @Output() addPayment = new EventEmitter<void>();

  private factureService = inject(FactureService);

  factures = signal<Facture[]>([]);
  selectedFacture = signal<Facture | null>(null);
  payments = signal<FacturePayment[]>([]);
  drawerPayment = signal<FacturePayment | null>(null);

  isLoadingFactures = signal(false);
  isLoadingPayments = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['locationId'] && this.locationId) {
      this.loadFactures();
    }
  }

  loadFactures(): void {
    if (!this.locationId) return;
    this.isLoadingFactures.set(true);
    this.selectedFacture.set(null);
    this.payments.set([]);

    this.factureService.getByLocation(this.locationId).subscribe({
      next: (res) => {
        this.factures.set(res.data ?? []);
        this.isLoadingFactures.set(false);
      },
      error: () => {
        this.isLoadingFactures.set(false);
      },
    });
  }

  selectFacture(facture: Facture): void {
    this.selectedFacture.set(facture);
    this.isLoadingPayments.set(true);
    this.payments.set([]);

    this.factureService.getById(facture.id).subscribe({
      next: (res) => {
        this.payments.set(res.data.payments ?? []);
        this.selectedFacture.set(res.data);
        this.isLoadingPayments.set(false);
      },
      error: () => {
        this.isLoadingPayments.set(false);
      },
    });
  }

  openDrawer(payment: FacturePayment): void {
    this.drawerPayment.set(payment);
  }

  closeDrawer(): void {
    this.drawerPayment.set(null);
  }

  onAddPayment(): void {
    this.addPayment.emit();
  }

  reload(): void {
    this.loadFactures();
  }

  formatPeriod(start: string, end: string): string {
    return formatPaymentPeriod(start, end);
  }

  getMethodLabel(method: string): string {
    return getPaymentMethodLabel(method);
  }

  getProgressPercent(facture: Facture): number {
    if (!facture.amount) return 0;
    return Math.min(100, Math.round((facture.paid_amount / facture.amount) * 100));
  }
}
