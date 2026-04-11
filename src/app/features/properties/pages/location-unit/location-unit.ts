import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft, lucideBuilding2, lucideHome, lucideMapPin,
  lucideRuler, lucideLayers, lucideLayoutGrid, lucideCalendar,
  lucideKey, lucideBanknote, lucidePencil, lucideTrash2,
  lucideX, lucidePlus, lucideChevronLeft, lucideChevronRight,
  lucideZoomIn, lucideUpload, lucideImage, lucideFile, lucideDownload,
  lucideUser, lucidePhone, lucideMail, lucideAlertTriangle,
  lucideCheckCircle, lucideXCircle, lucideClock, lucideUserPlus,
  lucideHistory, lucideSave, lucideInfo, lucideShieldCheck,
  lucideWrench, lucideRefreshCw,
} from '@ng-icons/lucide';
import { UnitStatutEnum } from '../../enums/unit-status.enum';
import { LocationUnitService } from '../../services/location-unit.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { ILocationUnit } from '../../models/location-unit.model';
import { IUnitGallery } from '../../models/unit-gallery.model';
import { getUnitStatusBadgeClass, getUnitStatusLabel } from '../../utils/property.utils';
import { ILocationModel } from '../../models/location.model';
import { UnitFormModal } from '../../components/modals/units/unit-form-modal/unit-form-modal';
import { CreateUnitPayload, UpdateUnitPayload } from '../../interfaces/unit-payload.interface';
import { TenantTab } from '../../components/shared-tabs/tenant-tab/tenant-tab';
import { LeasesTab } from '../../components/shared-tabs/leases-tab/leases-tab';
import { GalleryTab } from '../../components/shared-tabs/gallery-tab/gallery-tab';


export interface Locataire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  avatar?: string;
  profession?: string;
  ville?: string;
}

export interface Contrat {
  id: number;
  reference: string;
  dateDebut: Date;
  dateFin: Date;
  loyer: number;
  caution: number;
  statut: 'actif' | 'expiré' | 'résilié' | 'en_attente';
  locataire: Locataire;
}

export interface GalleryImage {
  id: number;
  path: string;
  caption?: string;
}

export interface UnitDocument {
  id: number;
  nom: string;
  ext: string;
  date: Date;
}

export interface UniteDetail {
  id: number;
  numero: string;
  code?: string;
  type?: string;
  etage?: number;
  lot?: string;
  surface?: number;
  statut: UnitStatutEnum;
  pieces?: number;
  chambres?: number;
  sallesDeBain?: number;
  loyer: number;
  caution: number;
  charges: number;
  prixVente?: number;
  actif: boolean;
  description?: string;
  // Relations
  bien: { id: number; nom: string; code?: string };
  locataireActuel?: Locataire;
  contratActuel?: Contrat;
  historiqueContrats?: Contrat[];
  images?: GalleryImage[];
  documents?: UnitDocument[];
}

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgIconComponent,
            DatePipe, DecimalPipe, TitleCasePipe, UnitFormModal, TenantTab, LeasesTab, GalleryTab],
  templateUrl: './location-unit.html',
  viewProviders: [
    provideIcons({
      lucideArrowLeft, lucideBuilding2, lucideHome, lucideMapPin,
      lucideRuler, lucideLayers, lucideLayoutGrid, lucideCalendar,
      lucideKey, lucideBanknote, lucidePencil, lucideTrash2,
      lucideX, lucidePlus, lucideChevronLeft, lucideChevronRight,
      lucideZoomIn, lucideUpload, lucideImage, lucideFile, lucideDownload,
      lucideUser, lucidePhone, lucideMail, lucideAlertTriangle,
      lucideCheckCircle, lucideXCircle, lucideClock, lucideUserPlus,
      lucideHistory, lucideSave, lucideInfo, lucideShieldCheck,
      lucideWrench, lucideRefreshCw,
    })
  ]
})
export class LocationUnit implements OnInit, OnDestroy {
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly unitService = inject(LocationUnitService);
  private readonly toast       = inject(ToastService);
  private readonly destroy$    = new Subject<void>();

  // État
  isLoading = signal(true);
  error = signal<string | null>(null);
  unite = signal<ILocationUnit | null>(null);
  showDeleteConfirm = signal(false);
  deleteLoading = signal(false);

  // Modal UI
  showUnitModal = signal(false);
  editingUnit = signal<ILocationUnit | null>(null);
  unitSaving = signal(false);

  // UI
  activeTab = 'infos';

  tabs = [
    { key: 'infos',      label: 'Informations', icon: 'lucideInfo'         },
    { key: 'locataire',  label: 'Locataire',    icon: 'lucideUser'         },
    { key: 'locations',  label: 'Locations',    icon: 'lucideShieldCheck'  },
    { key: 'photos',     label: 'Photos',       icon: 'lucideImage'        },
  ];

  UnitStatutEnum = UnitStatutEnum;

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
    return this.joursRestants() === 0 && this.unite()?.current_location?.status === 'active';
  });

  allLocations = computed(() => {
    const unit = this.unite();
    if (!unit) return [];
    const locations: ILocationModel[] = [...(unit.locations ?? [])];
    if (unit.current_location) {
      const index = locations.findIndex(l => l.id === unit.current_location?.id);
      if (index !== -1) locations.splice(index, 1);
      locations.unshift(unit.current_location);
    }
    return locations;
  });

  // ── Galerie ────────────────────────────────────────────────────
  lightboxIndex = 0;
  showLightbox = false;
  showDeleteImage = false;
  deletingImageId: number | null = null;
  previewUrl: string | null = null;
  isUploading = signal(false);

  get currentLightboxImage(): IUnitGallery | undefined {
    return this.unite()?.gallery?.[this.lightboxIndex];
  }

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadUnit();
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

  getContratStatutClass(s: string): string {
    return ({ 
      'active': 'bg-green-100 text-green-700',
      'expired': 'bg-gray-100 text-gray-500',
      'terminated': 'bg-red-100 text-red-600',
      'pending': 'bg-amber-100 text-amber-700' } as Record<string,string>)[s] ?? 'bg-gray-100 text-gray-500';
  }

  getLocationStatutClass(s: UnitStatutEnum): string {
    const classes: Record<string, string> = {
      'active': 'bg-green-100 text-green-700',
      'expired': 'bg-gray-100 text-gray-500',
      'terminated': 'bg-red-100 text-red-600',
      'pending': 'bg-amber-100 text-amber-700'
    };
    return classes[s] ?? 'bg-gray-100 text-gray-500';
  }

  getInitials(nom: string, prenom: string): string {
    return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
  }

  // ── Actions ───────────────────────────────────────────────────
  openEditUnit(): void {
    this.editingUnit.set(this.unite() ?? null);
    this.showUnitModal.set(true);
  }

  confirmDeleteUnit(): void {
    this.showDeleteConfirm.set(true);
  }

  deleteUnit(): void {
    const u = this.unite();
    if (!u) return;

    this.deleteLoading.set(true);
    this.unitService.delete(u.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toast.success('Unité supprimée avec succès.');
        this.deleteLoading.set(false);
        this.router.navigate(['/properties', u.property_id]);
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? 'Erreur lors de la suppression.');
        this.deleteLoading.set(false);
        this.showDeleteConfirm.set(false);
      }
    });
  }

  saveUnit(payload: CreateUnitPayload | UpdateUnitPayload): void {
    if (!payload) return;
    this.unitSaving.set(true);

    this.unitService.update(payload as UpdateUnitPayload).pipe(takeUntil(this.destroy$)).subscribe({
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
      }
    });
  }

  changerStatut(statut: UnitStatutEnum): void {
    const unit = this.unite();
    if (!unit) return;
    
    this.unitService.changeStatus(unit.id, statut)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toast.success('Statut mis à jour avec succès.');
            this.loadUnit();
          }
        },
        error: (err) => this.toast.error(err?.error?.message ?? 'Erreur lors du changement de statut.')
      });
  }

  contacterLocataire(): void {
    const locataire = this.unite()?.current_locataire;
    if (locataire?.email) {
      window.location.href = `mailto:${locataire.email}`;
    }
  }

  affecterLocataire(): void {
    // TODO: Ouvrir modal d'affectation
  }

  // ── Galerie ────────────────────────────────────────────────────
  openLightbox(i: number): void {
    this.lightboxIndex = i;
    this.showLightbox = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.showLightbox = false;
    document.body.style.overflow = '';
  }

  prevImage(): void {
    const len = this.unite()?.gallery?.length ?? 0;
    this.lightboxIndex = (this.lightboxIndex - 1 + len) % len;
  }

  nextImage(): void {
    const len = this.unite()?.gallery?.length ?? 0;
    this.lightboxIndex = (this.lightboxIndex + 1) % len;
  }

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
    reader.onload = (e) => this.previewUrl = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  uploadImage(): void {
    const unit = this.unite();
    if (!this.previewUrl || !unit) return;

    this.isUploading.set(true);
    // TODO: Appel API pour uploader l'image
    // this.unitService.uploadGalleryImage(unit.id, file).subscribe(...)
    
    // Simulation temporaire
    setTimeout(() => {
      this.isUploading.set(false);
      this.previewUrl = null;
      this.loadUnit();
    }, 1000);
  }

  cancelUpload(): void {
    this.previewUrl = null;
  }

  confirmDeleteImage(id: number): void {
    this.deletingImageId = id;
    this.showDeleteImage = true;
  }

  deleteImage(): void {
    const id = this.deletingImageId;
    if (!id) return;

    // TODO: Appel API pour supprimer l'image
    // this.unitService.deleteGalleryImage(id).subscribe(...)
    
    this.showDeleteImage = false;
    this.deletingImageId = null;
    if (this.showLightbox) this.closeLightbox();
    this.loadUnit();
  }
}