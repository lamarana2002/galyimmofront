import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBanknote,
  lucideDownload,
  lucideEye,
  lucideCheckCircle,
  lucideClock,
  lucideAlertTriangle,
  lucideFilter,
  lucideShieldCheck
} from '@ng-icons/lucide';
import { FactureService } from '../../services/facture.service';
import { Facture, FacturePayment } from '../../models/facture.model';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { formatPaymentPeriod, getPaymentMethodLabel } from '../../utils/payment.utils';
import { PaymentDetailDrawer } from '../../../properties/components/shared-tabs/unit-payments-tab/payment-detail-drawer';

type PaymentStatus = 'completed' | 'pending';
type StatusFilter = 'all' | PaymentStatus;

// Un paiement réel d'une facture (payments[]), avec le contexte de sa
// facture parente (référence, période) attaché pour l'affichage. Étend
// FacturePayment pour pouvoir être passé directement à PaymentDetailDrawer.
interface PaymentRow extends FacturePayment {
  reference: string;
  period_start: string;
  period_end: string;
}

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, Pagination, PaymentDetailDrawer],
  providers: [
    provideIcons({
      lucideBanknote,
      lucideDownload,
      lucideEye,
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
  private factureService = inject(FactureService);

  // Toutes les factures (avec leurs paiements) sont chargées en une fois :
  // au-delà de ce nombre, il faudrait filtrer côté backend.
  private readonly FETCH_PAGE_SIZE = 500;

  allFactures = signal<Facture[]>([]);
  isLoading = signal(true);

  // ── Pagination (locale, sur les paiements déjà filtrés) ────────
  currentPage = signal(1);
  perPage = signal(25);

  // ── Drawer de détail ───────────────────────────────────────────
  drawerPayment = signal<PaymentRow | null>(null);

  // ── Filtres ──────────────────────────────────────────────────
  activeStatus = signal<StatusFilter>('all');
  selectedMonth = signal<number | null>(null); // 1-12
  selectedYear = signal<number | null>(null);

  readonly statusFilters: { label: string; value: StatusFilter }[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Encaissés', value: 'completed' },
    { label: 'En attente', value: 'pending' },
  ];

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

  // Chaque facture devient une ou plusieurs lignes (une par paiement réel) ;
  // une facture jamais payée (payments vide) ne produit aucune ligne, puisqu'il
  // n'y a pas d'historique de paiement à montrer pour elle.
  allPayments = computed<PaymentRow[]>(() =>
    this.allFactures().flatMap(f =>
      (f.payments ?? []).map(p => ({
        ...p,
        reference: f.reference,
        period_start: f.period_start,
        period_end: f.period_end,
      })),
    ),
  );

  availableYears = computed(() => {
    const years = new Set(this.allPayments().map(p => new Date(p.paid_at).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  });

  hasActiveFilters = computed(
    () => this.activeStatus() !== 'all' || this.selectedMonth() !== null || this.selectedYear() !== null,
  );

  // ── Filtrage + pagination locale ───────────────────────────────
  filteredPayments = computed(() => {
    const status = this.activeStatus();
    const month = this.selectedMonth();
    const year = this.selectedYear();

    return this.allPayments().filter(p => {
      if (status !== 'all' && p.status !== status) return false;

      if (month !== null || year !== null) {
        const paidAt = new Date(p.paid_at);
        if (month !== null && paidAt.getMonth() + 1 !== month) return false;
        if (year !== null && paidAt.getFullYear() !== year) return false;
      }

      return true;
    });
  });

  totalItems = computed(() => this.filteredPayments().length);

  payments = computed(() => {
    const start = (this.currentPage() - 1) * this.perPage();
    return this.filteredPayments().slice(start, start + this.perPage());
  });

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.isLoading.set(true);

    this.factureService.findAll({
      page: 1,
      perPage: this.FETCH_PAGE_SIZE
    }).subscribe({
      next: (res) => {
        this.allFactures.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onStatusFilterChange(status: StatusFilter): void {
    this.activeStatus.set(status);
    this.currentPage.set(1);
  }

  onMonthChange(value: string): void {
    this.selectedMonth.set(value ? +value : null);
    this.currentPage.set(1);
  }

  onYearChange(value: string): void {
    this.selectedYear.set(value ? +value : null);
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.activeStatus.set('all');
    this.selectedMonth.set(null);
    this.selectedYear.set(null);
    this.currentPage.set(1);
  }

  formatPeriod(start: string, end: string): string {
    return formatPaymentPeriod(start, end);
  }

  getPaymentMethodLabel(method: string): string {
    return getPaymentMethodLabel(method);
  }

  openDrawer(payment: PaymentRow): void {
    this.drawerPayment.set(payment);
  }

  closeDrawer(): void {
    this.drawerPayment.set(null);
  }
}
