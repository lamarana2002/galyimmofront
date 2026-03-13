import { Component, inject, Input } from '@angular/core';
import { PlanType, StructureDetail } from '../../../pages/structure-details/structure-details';
import { StructureService } from '../../../services/structure.service';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCrown, lucideTrendingUp } from '@ng-icons/lucide';
import { FormsModule } from '@angular/forms';
import { ChangePlanModal } from "../change-plan-modal/change-plan-modal";

@Component({
  selector: 'app-financial-tab',
  imports: [CurrencyPipe, DatePipe, NgIcon, TitleCasePipe, FormsModule, ChangePlanModal],
  templateUrl: './financial-tab.html',
  styleUrl: './financial-tab.css',
  viewProviders: [
    provideIcons({
      lucideCrown,
      lucideTrendingUp,
    }),
  ],
})
export class FinancialTab {
  @Input({ required: true }) structure!: StructureDetail;
  structureService = inject(StructureService);
  // ── UI states ─────────────────────────────────────────────────
  showContactModal = false;
  showDeleteConfirm = false;
  showPlanModal = false;
  contactMessage = '';
  contactSubject = '';
  selectedPlan: PlanType = 'premium';

  confirmChangePlan(selectedPlan: PlanType): void {
    // const old = this.structure.plan;
    // this.structure.plan = selectedPlan;
    console.log('selected plan', selectedPlan);
    
    this.showPlanModal = false;
    // this.addAuditLog(`Plan modifié : ${old} → ${this.selectedPlan}.`);
  }
  openChangePlan(): void {
    this.selectedPlan = this.structure.plan;
    this.showPlanModal = true;
  }
  get planDaysLeft(): number {
    if (!this.structure.planExpiresAt) return 0;
    return Math.max(0, Math.ceil((this.structure.planExpiresAt.getTime() - Date.now()) / 86400000));
  }
  get totalRevenu(): number {
    return (
      this.structure.paiements
        ?.filter((p) => p.statut === 'payé')
        .reduce((a, p) => a + p.montant, 0) ?? 0
    );
  }
  get totalEnAttente(): number {
    return (
      this.structure.paiements
        ?.filter((p) => p.statut === 'en_attente')
        .reduce((a, p) => a + p.montant, 0) ?? 0
    );
  }
}
