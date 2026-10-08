import {
  Component,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, NgIconComponent, DatePipe, DecimalPipe, PaymentDetailDrawer],
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

  // ── Filtres ────────────────────────────────────────────────────
  searchQuery = signal('');
  selectedMonth = signal<number | null>(null);
  selectedYear = signal<number | null>(null);

  readonly months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

  availableYears = computed(() => {
    const years = new Set(this.factures().map((f) => new Date(f.period_start).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  });

  hasActiveFilters = computed(
    () => !!this.searchQuery() || this.selectedMonth() !== null || this.selectedYear() !== null,
  );

  filteredFactures = computed(() => {
    const search = this.searchQuery().trim().toLowerCase();
    const month = this.selectedMonth();
    const year = this.selectedYear();

    return this.factures().filter((f) => {
      if (search && !f.reference.toLowerCase().includes(search)) return false;

      const periodStart = new Date(f.period_start);
      if (month !== null && periodStart.getMonth() + 1 !== month) return false;
      if (year !== null && periodStart.getFullYear() !== year) return false;

      return true;
    });
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['locationId'] && this.locationId) {
      this.resetFilters();
      this.loadFactures();
    }
  }

  setSearch(value: string): void {
    this.searchQuery.set(value);
  }

  setMonth(value: string): void {
    this.selectedMonth.set(value ? +value : null);
  }

  setYear(value: string): void {
    this.selectedYear.set(value ? +value : null);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedMonth.set(null);
    this.selectedYear.set(null);
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
