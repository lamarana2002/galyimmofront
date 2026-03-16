import { Component, inject, Input, signal, computed } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  lucideAlignLeft, 
  lucideBuilding2, 
  lucideCalendar, 
  lucideCrown, 
  lucideGlobe, 
  lucideInfo, 
  lucideLink,
  lucideFacebook 
} from '@ng-icons/lucide';
import { DatePipe, TitleCasePipe } from '@angular/common';

import { StructureService } from '../../../services/structure.service';
import { StructureModel } from '../../../models/structure.model';
import { StructurePlanType } from '../../../enums/structure-plan-type.enum';

@Component({
  selector: 'app-settings-tab',
  standalone: true,
  imports: [NgIcon],
  templateUrl: './settings-tab.html',
  providers: [DatePipe],
  viewProviders: [provideIcons({
    lucideLink,
    lucideGlobe, 
    lucideAlignLeft, 
    lucideInfo, 
    lucideBuilding2, 
    lucideCalendar,
    lucideCrown,
    lucideFacebook
  })]
})
export class SettingsTab {
  @Input({ required: true }) structure!: StructureModel;

  private datePipe = inject(DatePipe);
  
  protected readonly structureService = inject(StructureService);
  protected readonly StructurePlanType = StructurePlanType;

  // ── Modals ────────────────────────────────────────────────────
  showPlanModal = signal(false);
  selectedPlan = signal<StructurePlanType | undefined>(undefined);

  // ── Informations générales ────────────────────────────────────
  protected readonly generalInfoRows = computed(() => [
    {
      icon: 'lucideBuilding2',
      label: 'Nom',
      value: this.structure.name,
    },
    {
      icon: 'lucideCalendar',
      label: 'Créée le',
      value: this.datePipe.transform(this.structure.created_at, "dd MMM yyyy 'à' HH:mm") ?? '',
    },
  ]);

  // ── Plan ──────────────────────────────────────────────────────
  protected get planLabel(): string {
    return this.structure.plan === StructurePlanType.PREMIUM ? 'Premium' : 'Freemium';
  }

  protected get planClass(): string {
    return this.structure.plan === StructurePlanType.PREMIUM
      ? 'bg-secondary-100 text-secondary-600'
      : 'bg-gray-100 text-gray-600';
  }

  protected get planDaysLeft(): number {
    if (!this.structure.created_at) return 0;
    const days = Math.ceil((new Date(this.structure.created_at).getTime() - Date.now()) / 86400000);
    return Math.max(0, days);
  }

  // ── Actions ───────────────────────────────────────────────────
  openChangePlan(): void {
    this.selectedPlan.set(this.structure.plan);
    this.showPlanModal.set(true);
  }

  // ── Helpers ───────────────────────────────────────────────────
  protected hasDescription = computed(() => !!this.structure.description);
  protected hasWebSite = computed(() => !!this.structure.web_site);
  protected hasFacebook = computed(() => !!this.structure.facebook);
}