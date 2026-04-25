import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideHome,
  lucideBuilding2,
  lucideMapPin,
  lucideRuler,
  lucideLayers,
  lucideLayoutGrid,
  lucideCalendar,
  lucideCheck,
  lucideCheckCircle,
  lucideKey,
  lucideBanknote,
  lucidePencil,
  lucideTrash2,
  lucideX,
  lucidePlus,
  lucideArrowRight,
  lucideChevronLeft,
  lucideChevronRight,
  lucideZoomIn,
  lucideUpload,
  lucideImage,
  lucideFile,
  lucideDownload,
  lucideInfo,
  lucideHistory,
  lucideSave,
  lucideAlertTriangle,
  lucideTrendingUp,
  lucideWrench,
  lucideUser,
  lucidePhone,
  lucideMail,
  lucideShieldCheck,
  lucideUserPlus,
  lucideXCircle,
} from '@ng-icons/lucide';
import { Subject, switchMap, takeUntil } from 'rxjs';

import { PropertyService } from '../../services/property.service';
import { PropertyModel } from '../../models/property.model';
import { PropertyStatusEnum } from '../../enums/property-status.enum';
import { UnitStatutEnum } from '../../enums/unit-status.enum';
import {
  CreateUnitPayload,
  UpdateUnitPayload,
  emptyUnitForm,
  unitToUpdatePayload,
} from '../../interfaces/unit-payload.interface';
import {
  getDocIconColor,
  getPropertyStatusBadgeClass,
  getPropertyStatusDotClass,
  getPropertyStatusLabel,
  getUnitStatusBadgeClass,
  getUnitStatusDotClass,
  getUnitStatusLabel,
  getPropertyFullAddress,
} from '../../utils/property.utils';

import { InfoTab } from '../../components/property-detail/info-tab/info-tab';
import { UnitsTab } from '../../components/property-detail/units-tab/units-tab';
import { GalleryTab } from '../../components/shared-tabs/gallery-tab/gallery-tab';
import { DocumentsTab } from '../../components/shared-tabs/documents-tab/documents-tab';
import { FinancialTab } from '../../components/property-detail/financial-tab/financial-tab';
import { LocationUnitService } from '../../services/location-unit.service';
import { PropertyGalleryService } from '../../services/property-gallery.service';
import { UnitFormModal } from '../../components/modals/units/unit-form-modal/unit-form-modal';
import { ILocationUnit } from '../../models/location-unit.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { AddPropertyModal } from '../../components/modals/add-property-modal/add-property-modal';
import { TenantTab } from '../../components/shared-tabs/tenant-tab/tenant-tab';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { LeasesTab } from '../../components/shared-tabs/leases-tab/leases-tab';
import { CreateLocationModal } from '../../components/modals/create-location-modal/create-location-modal';
import { PropertyDocumentService } from '../../services/property-document.service';
import { UploadPropertyDocumentPayload } from '../../interfaces/upload-property-document-payload.interface';
import { ContactService } from '../../../../shared/services/contact.service';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgIconComponent,
    DecimalPipe,
    UnitFormModal,
    AddPropertyModal,
    CreateLocationModal,
    ConfirmDialogComponent,
    DocumentsTab,
    GalleryTab,
    LeasesTab,
    TenantTab,
    InfoTab,
    UnitsTab,
    FinancialTab
],
  templateUrl: './property-detail.html',
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideHome,
      lucideBuilding2,
      lucideMapPin,
      lucideRuler,
      lucideLayers,
      lucideLayoutGrid,
      lucideCalendar,
      lucideCheck,
      lucideCheckCircle,
      lucideKey,
      lucideBanknote,
      lucidePencil,
      lucideTrash2,
      lucideX,
      lucidePlus,
      lucideArrowRight,
      lucideChevronLeft,
      lucideChevronRight,
      lucideZoomIn,
      lucideUpload,
      lucideImage,
      lucideFile,
      lucideDownload,
      lucideInfo,
      lucideHistory,
      lucideSave,
      lucideAlertTriangle,
      lucideTrendingUp,
      lucideWrench,
      lucideUser,
      lucidePhone,
      lucideMail,
      lucideShieldCheck,
      lucideUserPlus,
      lucideXCircle,
    }),
  ],
})
export class PropertyDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(PropertyService);
  private readonly unitService = inject(LocationUnitService);
  private readonly galleryService = inject(PropertyGalleryService);
  protected readonly toast = inject(ToastService);
  private readonly documentService = inject(PropertyDocumentService);
  private readonly contactService  = inject(ContactService);
  private readonly destroy$ = new Subject<void>();

  // ── Enums & utils exposés au template ─────────────────────────
  readonly PropertyStatus = PropertyStatusEnum;
  readonly getStatutLabel = getPropertyStatusLabel;
  readonly getStatutClass = getPropertyStatusBadgeClass;
  readonly getStatutDotClass = getPropertyStatusDotClass;
  readonly getUnitStatutLabel = getUnitStatusLabel;
  readonly getUnitStatutClass = getUnitStatusBadgeClass;
  readonly getUnitStatutDotClass = getUnitStatusDotClass;
  readonly getDocIconColor = getDocIconColor;
  readonly getFullAddress = getPropertyFullAddress;

  // ── État ──────────────────────────────────────────────────────
  isLoading = signal(true);
  error = signal<string | null>(null);

  // ── Données ───────────────────────────────────────────────────
  bien = signal<PropertyModel | null>(null);

  // ── UI ────────────────────────────────────────────────────────
  activeTab = signal('infos');

  // Onglets dynamiques selon has_units
  tabs = computed(() => {
    if (this.bien()?.has_units) {
      return [
        { key: 'infos', label: 'Informations', icon: 'lucideInfo' },
        { key: 'unites', label: 'Unités', icon: 'lucideLayoutGrid' },
        { key: 'galerie', label: 'Galerie', icon: 'lucideImage' },
        { key: 'documents', label: 'Documents', icon: 'lucideFile' },
        { key: 'finances', label: 'Finances', icon: 'lucideBanknote' },
        { key: 'activite', label: 'Activité', icon: 'lucideHistory' },
      ];
    }
    return [
      { key: 'infos', label: 'Informations', icon: 'lucideInfo' },
      { key: 'locataire', label: 'Locataire', icon: 'lucideUser' },
      { key: 'contrats', label: 'Contrats', icon: 'lucideShieldCheck' },
      { key: 'galerie', label: 'Galerie', icon: 'lucideImage' },
      { key: 'documents', label: 'Documents', icon: 'lucideFile' },
      { key: 'activite', label: 'Activité', icon: 'lucideHistory' },
    ];
  });

  // ── Modales unité ─────────────────────────────────────────────
  showUnitModal = signal(false);
  showDeleteUnit = signal(false);
  editingUnit = signal<ILocationUnit | null>(null);
  deletingUnit = signal<ILocationUnit | null>(null);
  unitSaving = signal(false);
  // ── Modal affectation locataire ─────────────────────────────────
  showLocationModal = signal(false);
  unitToAffect = signal<ILocationUnit | null>(null);

  // Formulaire unité — CreateUnitPayload ou UpdateUnitPayload
  unitForm = signal<CreateUnitPayload | UpdateUnitPayload>(emptyUnitForm(0));

  showPropertyModal = signal(false);
  showDeletePropertyConfirm = signal(false);
  deletePropertyLoading = signal(false);

  // ── Galerie ───────────────────────────────────────────────────
  showDeleteImage = signal(false);
  deletingImageId = signal<number | null>(null);
  previewUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  isUploading = signal(false);

  // ── Computed stats ────────────────────────────────────────────
  unitsCount = computed(() => this.bien()?.units?.length ?? 0);

  rentedUnits = computed(
    () => this.bien()?.units?.filter((u) => u.status === UnitStatutEnum.RENTED).length ?? 0,
  );

  availableUnits = computed(
    () => this.bien()?.units?.filter((u) => u.status === UnitStatutEnum.AVAILABLE).length ?? 0,
  );

  totalLoyer = computed(
    () =>
      this.bien()
        ?.units?.filter((u) => u.status === UnitStatutEnum.RENTED)
        .reduce((sum, u) => sum + (u.rent_amount ?? 0), 0) ?? 0,
  );

  tauxOccupation = computed(() => {
    const total = this.unitsCount();
    if (!total) return 0;
    return Math.round((this.rentedUnits() / total) * 100);
  });

  adresseComplete = computed(() => {
    const b = this.bien();
    if (!b) return '';
    return getPropertyFullAddress(b);
  });

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadProperty();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement ────────────────────────────────────────────────
  loadProperty(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.route.params
      .pipe(
        switchMap((params) => this.service.findById(Number(params['propertyId']))),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response) => {
          this.bien.set(response.data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Erreur lors du chargement du bien.');
          this.isLoading.set(false);
        },
      });
  }

  // ── Onglets ───────────────────────────────────────────────────
  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  // ── Actions Bien ──────────────────────────────────────────────
  openEditProperty(): void {
    this.showPropertyModal.set(true);
  }

  confirmDeleteProperty(): void {
    this.showDeletePropertyConfirm.set(true);
  }

  deleteProperty(): void {
    const p = this.bien();
    if (!p) return;

    this.deletePropertyLoading.set(true);
    this.service
      .delete(p.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Bien supprimé avec succès.');
          this.deletePropertyLoading.set(false);
          this.router.navigate(['/properties']);
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors de la suppression.');
          this.deletePropertyLoading.set(false);
          this.showDeletePropertyConfirm.set(false);
        },
      });
  }

  // ── Actions unité ─────────────────────────────────────────────
  openAddUnit(): void {
    const propertyId = this.bien()?.id ?? 0;
    this.editingUnit.set(null);
    this.unitForm.set(emptyUnitForm(propertyId));
    this.showUnitModal.set(true);
  }

  openEditUnit(unit: ILocationUnit): void {
    this.editingUnit.set(unit);
    this.unitForm.set(unitToUpdatePayload(unit));
    this.showUnitModal.set(true);
  }

  saveUnit(payload: CreateUnitPayload | UpdateUnitPayload): void {
    if (!payload) return;

    this.unitSaving.set(true);

    if (this.editingUnit()) {
      this.unitService
        .update(payload as UpdateUnitPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.toast.success('Unité mise à jour avec succès.');
              this.loadProperty();
              this.closeUnitModal();
            }
            this.unitSaving.set(false);
          },
          error: (err) => {
            this.toast.error(err?.error?.message ?? 'Erreur lors de la mise à jour.');
            this.unitSaving.set(false);
          },
        });
    } else {
      this.unitService
        .create(payload as CreateUnitPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.toast.success('Unité ajoutée avec succès.');
              this.loadProperty();
              this.closeUnitModal();
            }
            this.unitSaving.set(false);
          },
          error: (err) => {
            this.toast.error(err?.error?.message ?? 'Erreur lors de la création.');
            this.unitSaving.set(false);
          },
        });
    }
  }

  closeUnitModal(): void {
    this.showUnitModal.set(false);
    this.editingUnit.set(null);
    this.unitSaving.set(false);
  }

  confirmDeleteUnit(unit: ILocationUnit): void {
    this.deletingUnit.set(unit);
    this.showDeleteUnit.set(true);
  }

  deleteUnit(): void {
    const unit = this.deletingUnit();
    if (!unit) return;

    // TODO: this.unitService.delete(unit.id).subscribe(...)
    this.toast.info("Suppression d'unité non encore implémentée.");

    // Optimistic update local en attendant l'endpoint
    this.bien.update((b) =>
      b
        ? {
            ...b,
            units: b.units?.filter((u) => u.id !== unit.id) ?? [],
          }
        : b,
    );

    this.showDeleteUnit.set(false);
    this.deletingUnit.set(null);
  }

  // ── Galerie ───────────────────────────────────────────────────

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      this.toast.warning('Le fichier doit être une image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toast.warning("L'image ne doit pas dépasser 5 MB.");
      return;
    }

    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  cancelUpload(): void {
    this.previewUrl.set(null);
  }

  uploadImage(): void {
    const file = this.selectedFile();
    const bien = this.bien();

    if (!this.previewUrl() || !file || !bien) return;
    this.isUploading.set(true);

    this.galleryService
      .upload(file, bien.id, 'Image de la propriété')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Ajouter la nouvelle image à la galerie existante
            this.bien.update((b) => {
              if (!b) return b;
              return {
                ...b,
                gallery: [...(b.gallery || []), response.data!],
              };
            });

            // Réinitialiser le formulaire
            this.previewUrl.set(null);
            this.selectedFile.set(null);

            // Réinitialiser l'input file
            const fileInput = document.getElementById('galleryInput') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            this.toast.success('Image uploadée avec succès.');
          }
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? "Erreur lors de l'upload.");
          this.isUploading.set(false);
        },
        complete: () => {
          this.isUploading.set(false);
        },
      });
  }

  confirmDeleteImage(id: number): void {
    this.deletingImageId.set(id);
    this.showDeleteImage.set(true);
  }

  deleteImage(): void {
    const id = this.deletingImageId();
    if (!id) return;

    this.galleryService
      .delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Supprimer l'image de la galerie locale
            this.bien.update((b) =>
              b
                ? {
                    ...b,
                    gallery: b.gallery?.filter((img) => img.id !== id) ?? [],
                  }
                : b,
            );

            this.showDeleteImage.set(false);
            this.deletingImageId.set(null);

            this.toast.success('Image supprimée avec succès.');
          }
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors de la suppression.');
        },
      });
  }

  // Affecter locataire ───────────────────────────────────────────────────────────────
  affecterLocataire(): void {
    const unit = this.bien()?.units?.[0];
    if (!unit) {
      this.toast.warning('Aucune unité trouvée pour ce bien.');
      return;
    }
    this.unitToAffect.set(unit);
    this.showLocationModal.set(true);
  }

  contacterLocataire(data: { subject: string; message: string }): void {
    const locataire = this.bien()?.units?.[0]?.current_locataire;
    if (!locataire?.email) {
      this.toast.error('Ce locataire n\'a pas d\'adresse email.');
      return;
    }

    this.contactService.sendEmail({
      email: locataire.email,
      subject: data.subject,
      body: data.message
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toast.success('Message envoyé avec succès.');
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? 'Erreur lors de l\'envoi de l\'email.');
      }
    });
  }
  onLocationSaved(): void {
    this.showLocationModal.set(false);
    this.toast.success('Location créée avec succès.');
    this.loadProperty();
  }

  onLocationError(message: string): void {
    this.toast.error(message);
  }

  // ── Documents ───────────────────────────────────────────────────
  uploadDocument(payload: UploadPropertyDocumentPayload): void {
    this.documentService.upload(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.bien.update(b => b ? { ...b, documents: [...(b.documents || []), res.data!] } : b);
          this.toast.success('Document ajouté avec succès.');
        }
      },
      error: (err) => this.toast.error(err?.error?.message ?? "Erreur lors de l'envoi du document.")
    });
  }

  deleteDocument(id: number): void {
    this.documentService.delete(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.bien.update(b => b ? { ...b, documents: b.documents?.filter(d => d.id !== id) } : b);
        this.toast.success('Document supprimé avec succès.');
      },
      error: (err) => this.toast.error(err?.error?.message ?? 'Erreur lors de la suppression.')
    });
  }

  downloadDocument(id: number): void {
    this.documentService.openDocument(id);
  }
}
