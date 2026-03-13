import { Component, inject, Input } from '@angular/core';
import { PlanType, StructureDetail } from '../../../pages/structure-details/structure-details';
import { StructureService } from '../../../services/structure.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlignLeft, lucideBuilding2, lucideCalendar, lucideCrown, lucideGlobe, lucideInfo, lucideLink } from '@ng-icons/lucide';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { StructureModel } from '../../../models/structure.model';

@Component({
  selector: 'app-settings-tab',
  imports: [NgIcon, DatePipe, TitleCasePipe],
  templateUrl: './settings-tab.html',
  styleUrl: './settings-tab.css',
  viewProviders: [provideIcons({
    lucideLink,lucideGlobe, lucideAlignLeft, lucideInfo, lucideBuilding2, lucideCalendar,
    lucideCrown
  })]
})
export class SettingsTab {
  @Input({required: true}) structure!: StructureModel;
  structureService = inject(StructureService);
  // ── UI states ─────────────────────────────────────────────────
    showContactModal  = false;
    showDeleteConfirm = false;
    showPlanModal     = false;
    contactMessage    = '';
    contactSubject    = '';
    selectedPlan: PlanType = 'premium';
    
  openChangePlan(): void {
    this.selectedPlan = this.structure.plan;
    this.showPlanModal = true;
  }
  get planDaysLeft(): number {
    if (!this.structure.created_at) return 0;
    return Math.max(0, Math.ceil((new Date(this.structure.created_at).getTime() - Date.now()) / 86400000));
    // if (!this.structure.planExpiresAt) return 0;
    // return Math.max(0, Math.ceil((this.structure.planExpiresAt.getTime() - Date.now()) / 86400000));
  }
  get totalRevenu(): number {
    return 20000000;
    // return this.structure.paiements?.filter(p => p.statut === 'payé').reduce((a, p) => a + p.montant, 0) ?? 0;
  }
  get totalEnAttente(): number {
    return 50000000;
    // return this.structure.paiements?.filter(p => p.statut === 'en_attente').reduce((a, p) => a + p.montant, 0) ?? 0;
  }
}