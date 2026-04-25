import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';

import { LoadingComponent }    from '../../../../../shared/components/loading/loading';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state';
import {
  lucideCrown, lucideTrendingUp, lucideAlertTriangle,
  lucideCalendar, lucideShield,
} from '@ng-icons/lucide';

import { StructureModel }    from '../../../models/structure.model';
import { StructurePlanType } from '../../../enums/structure-plan-type.enum';
import { getPlanBadgeClass, getPlanLabel } from '../../../utils/structure.utils';

// ── Interfaces temporaires ─────────────────────────────────────
// À déplacer dans un fichier payment.model.ts quand l'endpoint sera prêt
export type PaymentStatus = 'payé' | 'en_attente' | 'échoué';

export interface StructurePayment {
  id:          number;
  date:        string;      // ISO string — format Laravel
  montant:     number;
  status:      PaymentStatus;
  description: string;
}

@Component({
  selector: 'app-financial-tab',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgIconComponent, LoadingComponent, EmptyStateComponent],
  templateUrl: './financial-tab.html',
  viewProviders: [provideIcons({
    lucideCrown, lucideTrendingUp, lucideAlertTriangle,
    lucideCalendar, lucideShield,
  })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialTab implements OnInit {

  @Input({ required: true }) structure!: StructureModel;

  // Enums
  readonly StructurePlanType = StructurePlanType;

  // Utils
  readonly getPlanBadgeClass = getPlanBadgeClass;
  readonly getPlanLabel      = getPlanLabel;

  // État
  paymentsLoading = false;
  paymentsError: string | null = null;

  // TODO: Remplacer par un vrai appel API quand l'endpoint sera prêt
  // GET /structures/{id}/payments
  payments: StructurePayment[] = [];

  ngOnInit(): void {
    // TODO: this.loadPayments();
  }

  // TODO: décommenter quand l'endpoint existe
  // private loadPayments(): void {
  //   this.paymentsLoading = true;
  //   this.structureService.getPayments(this.structure.id)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (response) => {
  //         this.payments = response.data;
  //         this.paymentsLoading = false;
  //       },
  //       error: (err) => {
  //         this.paymentsError = err?.error?.message ?? 'Erreur chargement paiements';
  //         this.paymentsLoading = false;
  //       },
  //     });
  // }

  // ── Computed getters ──────────────────────────────────────────
  get totalEncaisse(): number {
    return this.payments
      .filter(p => p.status === 'payé')
      .reduce((sum, p) => sum + p.montant, 0);
  }

  get totalEnAttente(): number {
    return this.payments
      .filter(p => p.status === 'en_attente')
      .reduce((sum, p) => sum + p.montant, 0);
  }

  get hasPaymentsPending(): boolean {
    return this.payments.some(p => p.status === 'en_attente');
  }

  getPaymentBadgeClass(status: PaymentStatus): string {
    const map: Record<PaymentStatus, string> = {
      'payé':       'bg-green-100 text-green-700',
      'en_attente': 'bg-amber-100 text-amber-700',
      'échoué':     'bg-red-100 text-red-600',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  getPaymentDotClass(status: PaymentStatus): string {
    const map: Record<PaymentStatus, string> = {
      'payé':       'bg-green-500',
      'en_attente': 'bg-amber-500',
      'échoué':     'bg-red-500',
    };
    return map[status] ?? 'bg-gray-400';
  }

  getPaymentLabel(status: PaymentStatus): string {
    const map: Record<PaymentStatus, string> = {
      'payé':       'Payé',
      'en_attente': 'En attente',
      'échoué':     'Échoué',
    };
    return map[status] ?? status;
  }
}