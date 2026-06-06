import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  providers: [
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
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm"
      (click)="close.emit()"
    ></div>

    <!-- Drawer -->
    <div class="fixed right-0 top-0 h-full w-96 z-50 bg-white shadow-2xl flex flex-col animate-slide-in-right">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
            <ng-icon name="lucideBanknote" size="18" class="text-primary-700"></ng-icon>
          </div>
          <div>
            <p class="text-sm font-bold text-primary-900">Détail du paiement</p>
            <p class="text-[11px] text-primary-400 font-mono">#{{ payment.id }}</p>
          </div>
        </div>
        <button
          (click)="close.emit()"
          class="p-2 text-primary-400 hover:text-primary-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ng-icon name="lucideX" size="18"></ng-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-5 space-y-4">

        <!-- Montant -->
        <div class="bg-primary-50 rounded-2xl p-5 text-center border border-primary-100">
          <p class="text-[11px] font-semibold text-primary-400 uppercase tracking-wider mb-1">Montant encaissé</p>
          <p class="text-3xl font-bold text-primary-900">{{ payment.amount | number:'1.0-0' }}</p>
          <p class="text-sm text-primary-500 mt-0.5">GNF</p>
        </div>

        <!-- Statut -->
        <div class="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
          <span class="text-xs text-primary-400 font-medium">Statut</span>
          @if (payment.status === 'completed') {
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-100">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Encaissé
            </span>
          } @else {
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              En attente
            </span>
          }
        </div>

        <!-- Détails -->
        <div class="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100">
          <div class="flex items-center justify-between px-4 py-3">
            <span class="text-xs text-primary-400">Méthode</span>
            <span class="text-xs font-semibold text-primary-800">{{ getMethodLabel(payment.method) }}</span>
          </div>
          <div class="flex items-center justify-between px-4 py-3">
            <span class="text-xs text-primary-400">Date de paiement</span>
            <span class="text-xs font-semibold text-primary-800">{{ payment.paid_at | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="flex items-center justify-between px-4 py-3">
            <span class="text-xs text-primary-400">Heure</span>
            <span class="text-xs font-semibold text-primary-800">{{ payment.paid_at | date:'HH:mm' }}</span>
          </div>
          <div class="flex items-center justify-between px-4 py-3">
            <span class="text-xs text-primary-400">Créé le</span>
            <span class="text-xs font-semibold text-primary-800">{{ payment.created_at | date:'dd/MM/yyyy' }}</span>
          </div>
        </div>

        <!-- Notes -->
        @if (payment.notes) {
          <div class="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p class="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1.5">Notes / Référence</p>
            <p class="text-sm text-amber-900">{{ payment.notes }}</p>
          </div>
        }

        <!-- Reçu -->
        @if (payment.receipt_url) {
          <a
            [href]="payment.receipt_url"
            target="_blank"
            class="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-xl transition-colors"
          >
            <ng-icon name="lucideDownload" size="16"></ng-icon>
            Télécharger le reçu
          </a>
        }
      </div>
    </div>
  `,
})
export class PaymentDetailDrawer {
  @Input() payment!: FacturePayment;
  @Output() close = new EventEmitter<void>();

  getMethodLabel(method: string): string {
    return getPaymentMethodLabel(method);
  }
}
