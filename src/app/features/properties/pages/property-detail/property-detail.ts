import { Component, inject, OnDestroy, OnInit, signal, Signal } from '@angular/core';
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
import { PropertyService } from '../../services/property.service';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { PropertyModel } from '../../models/property.model';
import {
  getDocIconColor,
  getPropertyStatusBadgeClass,
  getPropertyStatusDotClass,
  getPropertyStatusLabel,
  getUnitStatusBadgeClass,
  getUnitStatusDotClass,
  getUnitStatusLabel,
} from '../../utils/property.utils';
import { ProperttyStatusEnum } from '../../enums/property-status.enum';
import { UnitStatutEnum } from '../../enums/unit-status.enum';


export interface Locataire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
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

export interface UniteLocation {
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
  loyer?: number;
  caution?: number;
  charges?: number;
  prixVente?: number;
  actif: boolean;
  description?: string;
}

export interface BienDocument {
  id: number;
  nom: string;
  ext: string;
  date: Date;
  path: string;
}

export interface GalleryImage {
  id: number;
  path: string;
  caption?: string;
}

export interface BienDetail {
  id: number;
  nom: string;
  code?: string;
  cover?: string;
  type?: string;
  statut: ProperttyStatusEnum;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  description?: string;
  surface?: number;
  etages?: number;
  totalUnits?: number;
  latitude?: number;
  longitude?: number;
  prixVente?: number;
  charges?: number;
  createdAt: Date;
  // ── Clé principale : bien subdivisé ou bien simple
  hasUnits: boolean;
  // Si hasUnits === false : données financières + locataire directement sur le bien
  loyer?: number;
  caution?: number;
  locataireActuel?: Locataire;
  contratActuel?: Contrat;
  historiqueContrats?: Contrat[];
  // Si hasUnits === true : liste des unités
  unites?: UniteLocation[];
  documents?: BienDocument[];
  images?: GalleryImage[];
}

@Component({
  selector: 'app-bien-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgIconComponent,
    DatePipe,
    DecimalPipe,
    TitleCasePipe,
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
  private readonly destroy$ = new Subject<void>();

  // États de chargement
  isLoading = signal(true);
  error = signal<string | null>(null);
  
  // Données du bien (API)
  property = signal<PropertyModel | null>(null);

  ngOnInit(): void {
    // this.loadProperty();
  }

  loadProperty(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.route.params
      .pipe(
        switchMap((params) => {
          const id = Number(params['propertyId']);
          return this.service.findById(id);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response) => {
          // Pour l'instant, on garde le mock
          // Plus tard on fera le mapping
          console.log('Données API reçues:', response.data);
          this.property.set(response.data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.error.set(err?.error?.message ?? 'Erreur lors du chargement du bien.');
          this.isLoading.set(false);
        },
      });
  }

  activeTab = 'infos';

  // ── Onglets dynamiques selon hasUnits ────────────────────────
  get tabs() {
    if (this.bien.hasUnits) {
      return [
        { key: 'infos', label: 'Informations', icon: 'lucideInfo' },
        { key: 'unites', label: 'Unités', icon: 'lucideLayoutGrid' },
        { key: 'galerie', label: 'Galerie', icon: 'lucideImage' },
        { key: 'documents', label: 'Documents', icon: 'lucideFile' },
        { key: 'finances', label: 'Finances', icon: 'lucideBanknote' },
        { key: 'activite', label: 'Activité', icon: 'lucideHistory' },
      ];
    } else {
      return [
        { key: 'infos', label: 'Informations', icon: 'lucideInfo' },
        { key: 'locataire', label: 'Locataire', icon: 'lucideUser' },
        { key: 'contrats', label: 'Contrats', icon: 'lucideShieldCheck' },
        { key: 'galerie', label: 'Galerie', icon: 'lucideImage' },
        { key: 'documents', label: 'Documents', icon: 'lucideFile' },
        { key: 'activite', label: 'Activité', icon: 'lucideHistory' },
      ];
    }
  }

  // ── État modals unité ──────────────────────────────────────────
  showUnitModal = false;
  showDeleteUnit = false;
  editingUnitId: number | null = null;
  deletingUnit: UniteLocation | null = null;

  // ── Formulaire unité ──────────────────────────────────────────
  unitForm = this.emptyUnitForm();

  // ── Galerie / lightbox ────────────────────────────────────────
  lightboxIndex = 0;
  showLightbox = false;
  showDeleteImage = false;
  deletingImageId: number | null = null;
  previewUrl: string | null = null;

  // ── Données mock — BIEN AVEC UNITÉS (immeuble) ───────────────
  // Pour tester le bien simple, commenter ce bloc et décommenter le suivant
  bien: BienDetail = {
    id: 3,
    nom: 'Immeuble Le Plateau',
    code: 'BIEN-003',
    type: 'commercial',
    statut: ProperttyStatusEnum.RENTED,
    hasUnits: true, // ← BIEN SUBDIVISÉ
    adresse: '14 Rue des Bâtisseurs',
    ville: 'Abidjan',
    codePostal: '',
    description: 'Immeuble de bureaux situé en plein cœur du Plateau, 6 étages, parking sécurisé.',
    surface: 2400,
    etages: 6,
    totalUnits: 6,
    latitude: 5.3215,
    longitude: -4.0217,
    charges: 1200000,
    createdAt: new Date('2023-09-15'),
    unites: [
      {
        id: 1,
        numero: 'A01',
        code: 'UNIT-001',
        type: 'Bureau',
        etage: 1,
        surface: 120,
        statut: UnitStatutEnum.RENTED,
        loyer: 1500000,
        caution: 3000000,
        charges: 200000,
        pieces: 4,
        chambres: 0,
        sallesDeBain: 1,
        actif: true,
      },
      {
        id: 2,
        numero: 'A02',
        code: 'UNIT-002',
        type: 'Bureau',
        etage: 1,
        surface: 95,
        statut: UnitStatutEnum.RENTED,
        loyer: 1200000,
        caution: 2400000,
        charges: 150000,
        pieces: 3,
        chambres: 0,
        sallesDeBain: 1,
        actif: true,
      },
      {
        id: 3,
        numero: 'B01',
        code: 'UNIT-003',
        type: 'Salle conf.',
        etage: 2,
        surface: 60,
        statut: UnitStatutEnum.AVAILABLE,
        loyer: 800000,
        caution: 1600000,
        charges: 100000,
        pieces: 1,
        chambres: 0,
        sallesDeBain: 1,
        actif: true,
      },
      {
        id: 4,
        numero: 'B02',
        code: 'UNIT-004',
        type: 'Bureau',
        etage: 2,
        surface: 110,
        statut: UnitStatutEnum.RENTED,
        loyer: 1400000,
        caution: 2800000,
        charges: 180000,
        pieces: 4,
        chambres: 0,
        sallesDeBain: 1,
        actif: true,
      },
      {
        id: 5,
        numero: 'C01',
        code: 'UNIT-005',
        type: 'Showroom',
        etage: 0,
        surface: 200,
        statut: UnitStatutEnum.RENTED,
        loyer: 2500000,
        caution: 5000000,
        charges: 350000,
        pieces: 2,
        chambres: 0,
        sallesDeBain: 2,
        actif: true,
      },
      {
        id: 6,
        numero: 'C02',
        code: 'UNIT-006',
        type: 'Bureau',
        etage: 3,
        surface: 80,
        statut: UnitStatutEnum.UNDER_RENOVATION,
        loyer: 1000000,
        caution: 2000000,
        charges: 130000,
        pieces: 3,
        chambres: 0,
        sallesDeBain: 1,
        actif: false,
      },
    ],
    documents: [
      {
        id: 1,
        nom: 'Titre foncier - Immeuble Plateau',
        ext: 'pdf',
        date: new Date('2023-09-16'),
        path: '',
      },
      { id: 2, nom: 'Plan architectural R+6', ext: 'pdf', date: new Date('2023-10-01'), path: '' },
      {
        id: 3,
        nom: 'Devis travaux Unité C02',
        ext: 'docx',
        date: new Date('2024-03-05'),
        path: '',
      },
      { id: 4, nom: 'Bilan charges 2023', ext: 'xlsx', date: new Date('2024-01-10'), path: '' },
    ],
    images: [
      {
        id: 1,
        path: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
        caption: 'Façade principale',
      },
      {
        id: 2,
        path: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        caption: "Hall d'entrée",
      },
      {
        id: 3,
        path: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
        caption: 'Bureau type',
      },
      {
        id: 4,
        path: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800',
        caption: 'Vue extérieure',
      },
      {
        id: 5,
        path: 'https://images.unsplash.com/photo-1577017040065-650ee4d43339?w=800',
        caption: 'Parking',
      },
    ],
  };

  // ── Données mock — BIEN SIMPLE (studio, appt, villa) ─────────
  // bienSimple: BienDetail = {
  //   id: 7,
  //   nom: 'Studio Cocody Danga',
  //   code: 'BIEN-007',
  //   type: 'appartement',
  //   statut: 'loué',
  //   hasUnits: false,       // ← BIEN SIMPLE
  //   adresse: '12 Résidence Les Jardins',
  //   ville: 'Abidjan',
  //   surface: 35,
  //   loyer: 350000,
  //   caution: 700000,
  //   charges: 30000,
  //   createdAt: new Date('2024-02-01'),
  //   locataireActuel: {
  //     id: 5, nom: 'Diallo', prenom: 'Fatoumata',
  //     email: 'f.diallo@mail.ci', telephone: '+225 05 77 88 99',
  //     profession: 'Étudiante', ville: 'Abidjan',
  //   },
  //   contratActuel: {
  //     id: 10, reference: 'CTR-2024-088',
  //     dateDebut: new Date('2024-02-01'), dateFin: new Date('2025-02-01'),
  //     loyer: 350000, caution: 700000, statut: 'actif',
  //     locataire: { id:5, nom:'Diallo', prenom:'Fatoumata', email:'f.diallo@mail.ci', telephone:'+225 05 77 88 99' },
  //   },
  //   documents: [],
  //   images: [],
  // };

  // ── Computed stats (bien avec unités) ─────────────────────────
  get unitsCount(): number {
    return this.bien.unites?.length ?? 0;
  }
  get rentedUnits(): number {
    return this.bien.unites?.filter((u) => u.statut === UnitStatutEnum.RENTED).length ?? 0;
  }
  get availableUnits(): number {
    return this.bien.unites?.filter((u) => u.statut === UnitStatutEnum.AVAILABLE).length ?? 0;
  }
  get totalLoyer(): number {
    return (
      this.bien.unites
        ?.filter((u) => u.statut === UnitStatutEnum.RENTED)
        .reduce((s, u) => s + (u.loyer ?? 0), 0) ?? 0
    );
  }
  get totalLoyerPotentiel(): number {
    return this.bien.unites?.reduce((s, u) => s + (u.loyer ?? 0), 0) ?? 0;
  }
  get totalCharges(): number {
    return this.bien.unites?.reduce((s, u) => s + (u.charges ?? 0), 0) ?? 0;
  }

  // ── Computed (bien simple) ─────────────────────────────────────
  get joursRestants(): number {
    if (!this.bien.contratActuel) return 0;
    return Math.max(
      0,
      Math.ceil((this.bien.contratActuel.dateFin.getTime() - Date.now()) / 86400000),
    );
  }
  get contratExpireBientot(): boolean {
    return this.joursRestants > 0 && this.joursRestants <= 60;
  }
  get allContrats(): Contrat[] {
    const h = [...(this.bien.historiqueContrats ?? [])];
    if (this.bien.contratActuel) h.unshift(this.bien.contratActuel);
    return h;
  }
  get getInitials() {
    return (nom: string, prenom: string) => `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase();
  }

  get adresseComplete(): string {
    return [this.bien.adresse, this.bien.ville, this.bien.codePostal].filter(Boolean).join(', ');
  }

  get tauxOccupation(): number {
    if (!this.unitsCount) return 0;
    return Math.round((this.rentedUnits / this.unitsCount) * 100);
  }

  // ── Actions unité ──────────────────────────────────────────────
  openAddUnit(): void {
    this.editingUnitId = null;
    this.unitForm = this.emptyUnitForm();
    this.showUnitModal = true;
  }

  openEditUnit(u: UniteLocation): void {
    this.editingUnitId = u.id;
    this.unitForm = {
      numero: u.numero,
      code: u.code ?? '',
      type: u.type ?? '',
      etage: u.etage ?? 0,
      lot: u.lot ?? '',
      surface: u.surface ?? 0,
      statut: u.statut,
      pieces: u.pieces ?? 0,
      chambres: u.chambres ?? 0,
      sallesDeBain: u.sallesDeBain ?? 0,
      loyer: u.loyer ?? 0,
      caution: u.caution ?? 0,
      charges: u.charges ?? 0,
      prixVente: u.prixVente ?? 0,
      actif: u.actif,
      description: u.description ?? '',
    };
    this.showUnitModal = true;
  }

  saveUnit(): void {
    if (!this.unitForm.numero.trim()) return;
    if (this.editingUnitId !== null) {
      const idx = this.bien.unites?.findIndex((u) => u.id === this.editingUnitId) ?? -1;
      if (idx > -1 && this.bien.unites) {
        this.bien.unites[idx] = { ...this.bien.unites[idx], ...this.unitFormToUnit() };
      }
    } else {
      const newId = Math.max(0, ...(this.bien.unites?.map((u) => u.id) ?? [0])) + 1;
      this.bien.unites = [...(this.bien.unites ?? []), { id: newId, ...this.unitFormToUnit() }];
    }
    this.showUnitModal = false;
  }

  confirmDeleteUnit(u: UniteLocation): void {
    this.deletingUnit = u;
    this.showDeleteUnit = true;
  }

  deleteUnit(): void {
    if (!this.deletingUnit) return;
    this.bien.unites = this.bien.unites?.filter((u) => u.id !== this.deletingUnit!.id);
    this.showDeleteUnit = false;
    this.deletingUnit = null;
  }

  private unitFormToUnit(): Omit<UniteLocation, 'id'> {
    return {
      numero: this.unitForm.numero,
      code: this.unitForm.code,
      type: this.unitForm.type,
      etage: this.unitForm.etage,
      lot: this.unitForm.lot,
      surface: this.unitForm.surface,
      statut: this.unitForm.statut as UnitStatutEnum,
      pieces: this.unitForm.pieces,
      chambres: this.unitForm.chambres,
      sallesDeBain: this.unitForm.sallesDeBain,
      loyer: this.unitForm.loyer,
      caution: this.unitForm.caution,
      charges: this.unitForm.charges,
      prixVente: this.unitForm.prixVente,
      actif: this.unitForm.actif,
      description: this.unitForm.description,
    };
  }

  private emptyUnitForm() {
    return {
      numero: '',
      code: '',
      type: '',
      etage: 0,
      lot: '',
      surface: 0,
      statut: UnitStatutEnum.RENTED,
      pieces: 0,
      chambres: 0,
      sallesDeBain: 0,
      loyer: 0,
      caution: 0,
      charges: 0,
      prixVente: 0,
      actif: true,
      description: '',
    };
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
    const len = this.bien.images?.length ?? 0;
    this.lightboxIndex = (this.lightboxIndex - 1 + len) % len;
  }

  nextImage(): void {
    const len = this.bien.images?.length ?? 0;
    this.lightboxIndex = (this.lightboxIndex + 1) % len;
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => (this.previewUrl = e.target?.result as string);
    reader.readAsDataURL(file);
  }

  uploadImage(): void {
    if (!this.previewUrl) return;
    const newId = Math.max(0, ...(this.bien.images?.map((i) => i.id) ?? [0])) + 1;
    this.bien.images = [...(this.bien.images ?? []), { id: newId, path: this.previewUrl }];
    this.previewUrl = null;
    const input = document.getElementById('galleryInput') as HTMLInputElement;
    if (input) input.value = '';
  }

  cancelUpload(): void {
    this.previewUrl = null;
  }

  confirmDeleteImage(id: number): void {
    this.deletingImageId = id;
    this.showDeleteImage = true;
  }

  deleteImage(): void {
    this.bien.images = this.bien.images?.filter((i) => i.id !== this.deletingImageId);
    this.showDeleteImage = false;
    this.deletingImageId = null;
    if (this.showLightbox) this.closeLightbox();
  }

  // ── Helpers ────────────────────────────────────────────────────
  readonly getStatutLabel = getPropertyStatusLabel;
  readonly getUnitStatutLabel = getUnitStatusLabel;
  readonly getUnitStatutClass = getUnitStatusBadgeClass;
  readonly getStatutClass = getPropertyStatusBadgeClass;
  readonly getStatutDotClass = getPropertyStatusDotClass;
  readonly getUnitStatutDotClass = getUnitStatusDotClass;
  readonly getDocIconColor = getDocIconColor;

  get currentLightboxImage(): GalleryImage | undefined {
    return this.bien.images?.[this.lightboxIndex];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
