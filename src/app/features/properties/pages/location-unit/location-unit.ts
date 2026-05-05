import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideBuilding2,
  lucideHome,
  lucideMapPin,
  lucideRuler,
  lucideLayers,
  lucideLayoutGrid,
  lucideCalendar,
  lucideKey,
  lucideBanknote,
  lucidePencil,
  lucideTrash2,
  lucideX,
  lucidePlus,
  lucideChevronLeft,
  lucideChevronRight,
  lucideZoomIn,
  lucideUpload,
  lucideImage,
  lucideFile,
  lucideDownload,
  lucideUser,
  lucidePhone,
  lucideMail,
  lucideAlertTriangle,
  lucideCheckCircle,
  lucideXCircle,
  lucideClock,
  lucideUserPlus,
  lucideHistory,
  lucideSave,
  lucideInfo,
  lucideShieldCheck,
  lucideWrench,
  lucideRefreshCw,
  lucideRotateCcw,
} from '@ng-icons/lucide';
import { Subject, switchMap, takeUntil } from 'rxjs';

import { UnitStatutEnum } from '../../enums/unit-status.enum';
import { LocationUnitService } from '../../services/location-unit.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { ILocationUnit } from '../../models/location-unit.model';
import { getUnitStatusBadgeClass, getUnitStatusLabel } from '../../utils/property.utils';
import { ILocationModel } from '../../models/location.model';
import { UnitFormModal } from '../../components/modals/units/unit-form-modal/unit-form-modal';
import { CreateUnitPayload, UpdateUnitPayload } from '../../interfaces/unit-payload.interface';
import { TenantTab } from '../../components/shared-tabs/tenant-tab/tenant-tab';
import { LeasesTab } from '../../components/shared-tabs/leases-tab/leases-tab';
import { GalleryTab } from '../../components/shared-tabs/gallery-tab/gallery-tab';
import { CreateLocationModal } from '../../components/modals/create-location-modal/create-location-modal';
import { LocationService } from '../../services/location.service';
import { LocationStatusEnum } from '../../enums/location-status.enum';
import { ContactModal } from '../../../../shared/components/modals/contact-modal/contact-modal';
import { ContactService } from '../../../../shared/services/contact.service';
import { IUnitGallery } from '../../models/unit-gallery.model';
import { UnitPaymentsTab } from '../../components/shared-tabs/unit-payments-tab/unit-payments-tab';
import { PaymentModalComponent } from '../../../../shared/components/payment-modal/payment-modal';

// Pour la compatibilité avec property-gallery.service.ts
export type GalleryImage = IUnitGallery;

@Component({
  selector: 'app-location-unit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgIconComponent,
    DatePipe,
    DecimalPipe,
    TitleCasePipe,
    UnitFormModal,
    TenantTab,
    LeasesTab,
    GalleryTab,
    CreateLocationModal,
    ConfirmDialogComponent,
    ContactModal,
    UnitPaymentsTab,
    PaymentModalComponent
  ],
  templateUrl: './location-unit.html',
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideBuilding2,
      lucideHome,
      lucideMapPin,
      lucideRuler,
      lucideLayers,
      lucideLayoutGrid,
      lucideCalendar,
      lucideKey,
      lucideBanknote,
      lucidePencil,
      lucideTrash2,
      lucideX,
      lucidePlus,
      lucideChevronLeft,
      lucideChevronRight,
      lucideZoomIn,
      lucideUpload,
      lucideImage,
      lucideFile,
      lucideDownload,
      lucideUser,
      lucidePhone,
      lucideMail,
      lucideAlertTriangle,
      lucideCheckCircle,
      lucideXCircle,
      lucideClock,
      lucideUserPlus,
      lucideHistory,
      lucideSave,
      lucideInfo,
      lucideShieldCheck,
      lucideWrench,
      lucideRefreshCw,
      lucideRotateCcw,
    }),
  ],
})
export class LocationUnit implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly unitService = inject(LocationUnitService);
  private readonly locationService = inject(LocationService);
  private readonly toast = inject(ToastService);
  private readonly contactService = inject(ContactService);
  private readonly destroy$ = new Subject<void>();

  // Exposer les enums au template
  readonly LocationStatusEnum = LocationStatusEnum;
  readonly UnitStatutEnum = UnitStatutEnum;

  // État
  isLoading = signal(true);
  error = signal<string | null>(null);
  unite = signal<ILocationUnit | null>(null);

  // Modales & Confirmation
  showDeleteConfirm = signal(false);
  deleteLoading = signal(false);

  // Location actions
  showRenewConfirm = signal(false);
  showTerminateConfirm = signal(false);
  renewingLocation = signal(false);
  terminatingLocation = signal(false);

  // Modal UI
  showUnitModal = signal(false);
  editingUnit = signal<ILocationUnit | null>(null);
  unitSaving = signal(false);
  showLocationModal = signal(false);
  showContactModal = signal(false);
  showPaymentModal = signal(false);

  // UI
  activeTab = 'infos';
  tabs = [
    { key: 'infos', label: 'Informations', icon: 'lucideInfo' },
    { key: 'locataire', label: 'Locataire', icon: 'lucideUser' },
    { key: 'locations', label: 'Locations', icon: 'lucideShieldCheck' },
    { key: 'photos', label: 'Photos', icon: 'lucideImage' },
    { key: 'paiements', label: 'Paiements', icon: 'lucideBanknote' },
  ];

  // ── Computed ──────────────────────────────────────────────────
  joursRestants = computed(() => {
    const location = this.unite()?.current_location;
    if (!location?.end_date) return 0;
    const endDate = new Date(location.end_date);
    return Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000));
  });

  locationExpireBientot = computed(() => {
    const days = this.joursRestants();
    return days > 0 && days <= 60;
  });

  locationExpire = computed(() => {
    return (
      this.joursRestants() === 0 &&
      this.unite()?.current_location?.status === LocationStatusEnum.ACTIVE
    );
  });

  allLocations = computed(() => {
    const unit = this.unite();
    if (!unit) return [];

    // Combiner current_location et locations
    const locations: ILocationModel[] = [...(unit.locations ?? [])];
    if (unit.current_location) {
      const exists = locations.some(l => l.id === unit.current_location?.id);
      if (!exists) {
        locations.unshift(unit.current_location);
      }
    }
    // Trier par date décroissante (plus récent en haut)
    return locations.sort((a, b) =>
      new Date(b.date_location).getTime() - new Date(a.date_location).getTime()
    );
  });

  // ── Galerie ────────────────────────────────────────────────────
  showDeleteImage = false;
  deletingImageId: number | null = null;
  previewUrl: string | null = null;
  isUploading = signal(false);

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadUnit();

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement ────────────────────────────────────────────────
  loadUnit(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.route.params
      .pipe(
        switchMap((params) => this.unitService.findById(Number(params['unitId']))),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response) => {
          this.unite.set(response.data);
          this.isLoading.set(false);
        },
        error: (err) => {
          const msg = err?.error?.message ?? "Erreur lors du chargement de l'unité.";
          this.error.set(msg);
          this.toast.error(msg);
          this.isLoading.set(false);
        },
      });
  }

  // ── Statut helpers ────────────────────────────────────────────
  getStatutLabel(status: UnitStatutEnum): string {
    return getUnitStatusLabel(status);
  }

  getStatutClass(status: UnitStatutEnum): string {
    return getUnitStatusBadgeClass(status);
  }

  getInitials(nom: string, prenom: string): string {
    return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
  }

  // ── Actions ───────────────────────────────────────────────────
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
  openEditUnit(): void {
    this.editingUnit.set(this.unite());
    this.showUnitModal.set(true);
  }

  confirmDeleteUnit(): void {
    this.showDeleteConfirm.set(true);
  }

  deleteUnit(): void {
    const u = this.unite();
    if (!u) return;

    this.deleteLoading.set(true);
    this.unitService
      .delete(u.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Unité supprimée avec succès.');
          this.deleteLoading.set(false);
          this.router.navigate(['/properties', u.property_id]);
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors de la suppression.');
          this.deleteLoading.set(false);
          this.showDeleteConfirm.set(false);
        },
      });
  }

  saveUnit(payload: CreateUnitPayload | UpdateUnitPayload): void {
    if (!payload) return;
    this.unitSaving.set(true);

    this.unitService
      .update(payload as UpdateUnitPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.toast.success('Unité mise à jour avec succès.');
            this.loadUnit();
            this.showUnitModal.set(false);
          }
          this.unitSaving.set(false);
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors de la mise à jour.');
          this.unitSaving.set(false);
        },
      });
  }

  renewLocation(): void {
    const currentLocation = this.unite()?.current_location;
    if (!currentLocation) return;
    if (this.renewingLocation()) return;

    this.renewingLocation.set(true);
    this.locationService
      .renew(currentLocation.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toast.success('Contrat renouvelé avec succès.');
            this.showRenewConfirm.set(false);
            this.loadUnit();
          }
          this.renewingLocation.set(false);
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors du renouvellement.');
          this.renewingLocation.set(false);
        },
      });
  }

  terminateLocation(): void {
    const currentLocation = this.unite()?.current_location;
    if (!currentLocation) return;
    if (this.terminatingLocation()) return;

    this.terminatingLocation.set(true);
    this.locationService
      .terminate(currentLocation.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toast.success('Contrat résilié avec succès.');
            this.showTerminateConfirm.set(false);
            this.loadUnit();
          }
          this.terminatingLocation.set(false);
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors de la résiliation.');
          this.terminatingLocation.set(false);
        },
      });
  }

  contacterLocataire(data?: { subject: string; message: string }): void {
    if (!data) {
      this.showContactModal.set(true);
      return;
    }

    const locataire = this.unite()?.current_locataire;
    if (!locataire?.email) {
      this.toast.error("Ce locataire n'a pas d'adresse email.");
      return;
    }

    this.contactService.sendEmail({
      email: locataire.email,
      subject: data.subject,
      body: data.message
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toast.success('Message envoyé avec succès.');
        this.showContactModal.set(false);
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? "Erreur lors de l'envoi de l'email.");
      }
    });
  }

  affecterLocataire(): void {
    this.showLocationModal.set(true);
  }

  onLocationSaved(): void {
    this.showLocationModal.set(false);
    this.toast.success('Location créée avec succès.');
    this.loadUnit();
  }

  onLocationError(message: string): void {
    this.toast.error(message);
  }

  // ── Galerie ────────────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toast.warning('Le fichier doit être une image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toast.warning("L'image ne doit pas dépasser 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => (this.previewUrl = e.target?.result as string);
    reader.readAsDataURL(file);
  }

  uploadImage(): void {
    // TODO: Implémenter l'upload réel quand l'endpoint sera prêt
    this.toast.info('Fonctionnalité bientôt disponible.');
    this.previewUrl = null;
  }

  cancelUpload(): void {
    this.previewUrl = null;
  }

  confirmDeleteImage(id: number): void {
    this.deletingImageId = id;
    this.showDeleteImage = true;
  }

  deleteImage(): void {
    this.toast.info('Fonctionnalité bientôt disponible.');
    this.showDeleteImage = false;
    this.deletingImageId = null;
  }

  // ── Paiements ──────────────────────────────────────────────────
  openPaymentModal(): void {
    const currentLocation = this.unite()?.current_location;
    if (!currentLocation) {
      this.toast.warning('Aucun contrat actif pour enregistrer un paiement.');
      return;
    }
    this.showPaymentModal.set(true);
  }

  closePaymentModal(): void {
    this.showPaymentModal.set(false);
  }

  onPaymentSuccess(): void {
    this.toast.success('Paiement enregistré avec succès.');
    this.showPaymentModal.set(false);
    // Reload if needed
  }
}
