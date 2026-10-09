import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideMail,
  lucidePhone,
  lucidePencil,
  lucideTrash2,
  lucideUser,
  lucideAlignLeft,
  lucideShieldCheck,
  lucideLayoutGrid,
  lucideBanknote,
  lucideArrowRight,
  lucideAlertTriangle,
} from '@ng-icons/lucide';
import { Subject, switchMap, takeUntil } from 'rxjs';

import { ILocataire } from '../../models/locataire.model';
import { UserStatusEnum } from '../../enums/user-status.enum';
import { LocataireService } from '../../services/locataire.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ContactService } from '../../../../shared/services/contact.service';
import { LocataireModal } from '../../components/modals/locataire-modal/locataire-modal';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { ContactModal } from '../../../../shared/components/modals/contact-modal/contact-modal';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { getInitials } from '../../../structures/utils/structure.utils';

@Component({
  selector: 'app-locataire-detail',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    RouterLink,
    NgIconComponent,
    LocataireModal,
    ConfirmDialogComponent,
    ContactModal,
    EmptyStateComponent,
  ],
  templateUrl: './locataire-detail.html',
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideMail,
      lucidePhone,
      lucidePencil,
      lucideTrash2,
      lucideUser,
      lucideAlignLeft,
      lucideShieldCheck,
      lucideLayoutGrid,
      lucideBanknote,
      lucideArrowRight,
      lucideAlertTriangle,
    }),
  ],
})
export class LocataireDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(LocataireService);
  private readonly contactService = inject(ContactService);
  private readonly toast = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  readonly UserStatus = UserStatusEnum;

  // ── État ──────────────────────────────────────────────────────
  isLoading = signal(true);
  error = signal<string | null>(null);
  locataire = signal<ILocataire | null>(null);

  // ── Modales ───────────────────────────────────────────────────
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  deleteLoading = signal(false);
  showContactModal = signal(false);

  deleteMessage = computed(() => {
    const l = this.locataire();
    return l ? `${l.full_name} sera définitivement supprimé. Cette action est irréversible.` : '';
  });

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadLocataire();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement ────────────────────────────────────────────────
  loadLocataire(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.route.params
      .pipe(
        switchMap((params) => this.service.findById(Number(params['locataireId']))),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response) => {
          this.locataire.set(response.data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? "Erreur lors du chargement du locataire.");
          this.isLoading.set(false);
        },
      });
  }

  // ── Helpers ───────────────────────────────────────────────────
  readonly getInitials = getInitials;

  // Statut libre renvoyé par le backend pour ce résumé (ex: "en cours")
  isLocationOngoing(status: string): boolean {
    return status.toLowerCase() === 'en cours';
  }

  getLocationCardClass(status: string): string {
    return this.isLocationOngoing(status) ? 'border-green-200 bg-green-50/50' : 'border-gray-100 bg-gray-50/50';
  }

  getLocationBadgeClass(status: string): string {
    return this.isLocationOngoing(status)
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-gray-100 text-gray-500 border-gray-200';
  }

  // ── Modale édition ────────────────────────────────────────────
  openEdit(): void {
    this.showEditModal.set(true);
  }

  closeEdit(): void {
    this.showEditModal.set(false);
  }

  onSaved(locataire: ILocataire): void {
    this.locataire.set(locataire);
    this.closeEdit();
    this.toast.success(`Locataire « ${locataire.full_name} » modifié.`);
  }

  // ── Suppression ───────────────────────────────────────────────
  confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  deleteLocataire(): void {
    const target = this.locataire();
    if (!target) return;

    this.deleteLoading.set(true);
    this.service
      .delete(target.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success(`Locataire « ${target.full_name} » supprimé.`);
          this.router.navigate(['/locataires']);
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors de la suppression.');
          this.deleteLoading.set(false);
        },
      });
  }

  // ── Contact ───────────────────────────────────────────────────
  openContact(): void {
    this.showContactModal.set(true);
  }

  sendContactMessage(data: { subject: string; message: string }): void {
    const target = this.locataire();
    if (!target) return;

    this.contactService
      .sendEmail({ email: target.email, subject: data.subject, body: data.message })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Message envoyé avec succès.');
          this.showContactModal.set(false);
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? "Erreur lors de l'envoi de l'email.");
        },
      });
  }
}
