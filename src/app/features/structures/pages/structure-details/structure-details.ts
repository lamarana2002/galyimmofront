import { Component, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCrown,
  lucideBuilding2,
  lucideBuilding,
  lucideCheckCircle,
  lucideXCircle,
  lucideClock,
  lucideGlobe,
  lucideUsers,
  lucideKey,
  lucideCalendar,
  lucideUser,
  lucideMail,
  lucidePhone,
  lucideMapPin,
  lucideAlignLeft,
  lucideLink,
  lucideInfo,
  lucideFile,
  lucideDownload,
  lucideHistory,
  lucideUserX,
  lucideFileX,
  lucidePause,
  lucidePlay,
  lucideRefreshCw,
  lucideTrash2,
  lucideSend,
  lucideX,
  lucideEdit,
  lucideCreditCard,
  lucideCheck,
  lucideBan,
  lucideTrendingUp,
  lucideAlertTriangle,
  lucideMessageSquare,
  lucideShield,
  lucideActivity,
} from '@ng-icons/lucide';
import { Subject, switchMap, takeUntil } from 'rxjs';

import { StructureService } from '../../services/structure.service';
import { StructureModel } from '../../models/structure.model';
import { StructureStatus } from '../../enums/structure-status.enum';
import { StructurePlanType } from '../../enums/structure-plan-type.enum';
import {
  getStatutLabel,
  getStatusBadgeClass,
  getPlanBadgeClass,
  getPlanLabel,
  getInitials,
  getOwnerFullName,
} from '../../utils/structure.utils';

import { PropertiesTab } from '../../components/structure-detail/properties-tab/properties-tab';
import { OwnerTap } from '../../components/structure-detail/owner-tap/owner-tap';
import { UsersTab } from '../../components/structure-detail/users-tab/users-tab';
import { DocumentsTab } from '../../components/structure-detail/documents-tab/documents-tab';
import { FinancialTab } from '../../components/structure-detail/financial-tab/financial-tab';
import { SettingsTab } from '../../components/structure-detail/settings-tab/settings-tab';
import { AuditTab } from '../../components/structure-detail/audit-tab/audit-tab';
import { ChangePlanModal } from '../../components/structure-detail/change-plan-modal/change-plan-modal';
import { ContactStructureModal } from '../../components/structure-detail/contact-structure-modal/contact-structure-modal';
import { ToastService } from '../../../../shared/services/toast.service';
import { AddStructureModal } from '../../components/modals/add-structure-modal/add-structure-modal';

@Component({
  selector: 'app-structure-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgIconComponent,
    DatePipe,
    SlicePipe,
    PropertiesTab,
    OwnerTap,
    UsersTab,
    DocumentsTab,
    FinancialTab,
    SettingsTab,
    AuditTab,
    ChangePlanModal,
    ContactStructureModal,
    AddStructureModal,
  ],
  templateUrl: './structure-details.html',
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideCrown,
      lucideBuilding2,
      lucideBuilding,
      lucideCheckCircle,
      lucideXCircle,
      lucideClock,
      lucideGlobe,
      lucideUsers,
      lucideKey,
      lucideCalendar,
      lucideUser,
      lucideMail,
      lucidePhone,
      lucideMapPin,
      lucideAlignLeft,
      lucideLink,
      lucideInfo,
      lucideFile,
      lucideDownload,
      lucideHistory,
      lucideUserX,
      lucideFileX,
      lucidePause,
      lucidePlay,
      lucideRefreshCw,
      lucideTrash2,
      lucideSend,
      lucideX,
      lucideEdit,
      lucideCreditCard,
      lucideCheck,
      lucideBan,
      lucideTrendingUp,
      lucideAlertTriangle,
      lucideMessageSquare,
      lucideShield,
      lucideActivity,
    }),
  ],
})
export class StructureDetails implements OnInit, OnDestroy {
  private readonly route    = inject(ActivatedRoute);
  private readonly router   = inject(Router);
  private readonly service  = inject(StructureService);
  private readonly toast    = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  // Enums
  readonly StructureStatus = StructureStatus;
  readonly StructurePlanType = StructurePlanType;

  // Utils exposés au template
  readonly getStatutLabel = getStatutLabel;
  readonly getStatusBadgeClass = getStatusBadgeClass;
  readonly getPlanBadgeClass = getPlanBadgeClass;
  readonly getPlanLabel = getPlanLabel;
  readonly getInitials = getInitials;
  readonly getOwnerFullName = getOwnerFullName;

  // ── État ──────────────────────────────────────────────────────
  isLoading = signal(true);
  error = signal<string | null>(null);
  deleteLoading = signal(false);

  // ── Données ───────────────────────────────────────────────────
  structure = signal<StructureModel | null>(null);

  // ── UI ────────────────────────────────────────────────────────
  activeTab = signal('proprietaire');

  readonly tabs = [
    { key: 'proprietaire', label: 'Propriétaire', icon: 'lucideUser' },
    { key: 'biens', label: 'Biens', icon: 'lucideBuilding' },
    { key: 'employes', label: 'Employés', icon: 'lucideUsers' },
    { key: 'documents', label: 'Documents', icon: 'lucideFile' },
    { key: 'financier', label: 'Financier', icon: 'lucideCreditCard' },
    { key: 'parametres', label: 'Paramètres', icon: 'lucideInfo' },
    { key: 'activite', label: 'Activité', icon: 'lucideHistory' },
  ];

  // ── Modales ───────────────────────────────────────────────────
  showContactModal = signal(false);
  showDeleteConfirm = signal(false);
  showPlanModal = signal(false);
  showEditModal = signal(false);

  contactSubject = signal('');
  contactMessage = signal('');

  // ── Computed ──────────────────────────────────────────────────

  // Taux d'occupation calculé depuis les stats
  occupancyRate = computed(() => {
    const stats = this.structure()?.stats;
    if (!stats?.biens) return 0;
    return Math.round((stats.locations / stats.biens) * 100);
  });

  // Jours depuis la création — à remplacer par planExpiresAt quand disponible
  // TODO: utiliser un champ plan_expires_at quand le backend l'exposera
  daysSinceCreation = computed(() => {
    const createdAt = this.structure()?.created_at;
    if (!createdAt) return 0;
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);
  });

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadStructure();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement ────────────────────────────────────────────────
  // switchMap annule l'appel précédent si les params changent
  // évite d'avoir deux appels en parallèle si on navigue vite
  loadStructure(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.route.params
      .pipe(
        switchMap((params) => {
          const id = Number(params['structureId']);
          return this.service.findById(id);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response) => {
          this.structure.set(response.data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Erreur lors du chargement de la structure.');
          this.isLoading.set(false);
        },
      });
  }

  // ── Onglets ───────────────────────────────────────────────────
  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  // ── Actions ───────────────────────────────────────────────────
  changeStatus(status: StructureStatus): void {
    const s = this.structure();
    if (!s) return;

    this.service
      .changeStatus(s.id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.structure.update((current) => ({ ...current!, ...response.data }));
          this.toast.success('Statut mis à jour avec succès.');
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors du changement de statut.');
        },
      });
  }

  toggleSuspend(): void {
    const s = this.structure();
    if (!s) return;
    const next =
      s.status === StructureStatus.SUSPENDED
        ? StructureStatus.APPROUVED
        : StructureStatus.SUSPENDED;
    this.changeStatus(next);
  }

  openChangePlan(): void {
    this.showPlanModal.set(true);
  }

  confirmChangePlan(newPlan: StructurePlanType): void {
    const s = this.structure();
    if (!s) return;

    this.service
      .togglePlan(s.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.structure.update((current) => ({ ...current!, plan: newPlan }));
          this.showPlanModal.set(false);
          this.toast.success('Plan mis à jour avec succès.');
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors du changement de plan.');
        },
      });
  }

  openContactModal(): void {
    this.contactSubject.set(`Concernant votre structure "${this.structure()?.name}"`);
    this.contactMessage.set('');
    this.showContactModal.set(true);
  }

  sendContactMessage(): void {
    // TODO: this.service.sendContact(...).subscribe(...)
    this.showContactModal.set(false);
    this.contactSubject.set('');
    this.contactMessage.set('');
  }

  openEditStructure(): void {
    this.showEditModal.set(true);
  }

  onStructureSaved(updated: StructureModel): void {
    this.structure.update((s) => ({ ...s!, ...updated }));
    // Optional: reload full detailed stats
    this.loadStructure();
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  deleteStructure(): void {
    const s = this.structure();
    if (!s) return;

    this.deleteLoading.set(true);

    this.service
      .delete(s.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.deleteLoading.set(false);
          this.router.navigate(['/structures']);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Erreur lors de la suppression.');
          this.deleteLoading.set(false);
          this.showDeleteConfirm.set(false);
        },
      });
  }
}
