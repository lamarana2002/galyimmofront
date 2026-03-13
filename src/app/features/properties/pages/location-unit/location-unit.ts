import { Component } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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

export type UnitStatut = 'disponible' | 'loué' | 'maintenance' | 'vendu' | 'inactif';

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
  statut: UnitStatut;
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
            DatePipe, DecimalPipe, TitleCasePipe],
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
export class LocationUnit {

  activeTab = 'infos';

  tabs = [
    { key: 'infos',      label: 'Informations', icon: 'lucideInfo'         },
    { key: 'locataire',  label: 'Locataire',     icon: 'lucideUser'         },
    { key: 'contrats',   label: 'Contrats',      icon: 'lucideShieldCheck'  },
    { key: 'photos',     label: 'Photos',        icon: 'lucideImage'        },
    { key: 'documents',  label: 'Documents',     icon: 'lucideFile'         },
  ];

  // ── Galerie ────────────────────────────────────────────────────
  lightboxIndex   = 0;
  showLightbox    = false;
  showDeleteImage = false;
  deletingImageId: number | null = null;
  previewUrl: string | null = null;

  // ── Données mock ──────────────────────────────────────────────
  unite: UniteDetail = {
    id: 2,
    numero: 'A02',
    code: 'UNIT-002',
    type: 'Bureau',
    etage: 1,
    lot: 'LOT-02',
    surface: 95,
    statut: 'loué',
    pieces: 3,
    chambres: 0,
    sallesDeBain: 1,
    loyer: 1200000,
    caution: 2400000,
    charges: 150000,
    actif: true,
    description: 'Bureau en open space, lumineux, vue sur jardin intérieur. Climatisation centralisée.',
    bien: { id: 3, nom: 'Immeuble Le Plateau', code: 'BIEN-003' },
    locataireActuel: {
      id: 1,
      nom: 'Camara',
      prenom: 'Ibrahim',
      email: 'i.camara@techsolutions.ci',
      telephone: '+225 07 45 67 89',
      profession: 'Directeur Général',
      ville: 'Abidjan',
    },
    contratActuel: {
      id: 1,
      reference: 'CTR-2024-042',
      dateDebut: new Date('2024-01-01'),
      dateFin: new Date('2025-01-01'),
      loyer: 1200000,
      caution: 2400000,
      statut: 'actif',
      locataire: {
        id: 1, nom: 'Camara', prenom: 'Ibrahim',
        email: 'i.camara@techsolutions.ci', telephone: '+225 07 45 67 89',
      },
    },
    historiqueContrats: [
      {
        id: 2, reference: 'CTR-2023-018',
        dateDebut: new Date('2023-01-01'), dateFin: new Date('2023-12-31'),
        loyer: 1100000, caution: 2200000, statut: 'expiré',
        locataire: { id: 2, nom: 'Koné', prenom: 'Salif', email: 's.kone@mail.ci', telephone: '+225 05 11 22 33' },
      },
      {
        id: 3, reference: 'CTR-2022-007',
        dateDebut: new Date('2022-06-01'), dateFin: new Date('2022-12-31'),
        loyer: 1000000, caution: 2000000, statut: 'résilié',
        locataire: { id: 3, nom: 'Traoré', prenom: 'Aminata', email: 'a.traore@mail.ci', telephone: '+225 01 99 88 77' },
      },
    ],
    images: [
      { id: 1, path: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', caption: 'Vue générale' },
      { id: 2, path: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800', caption: 'Espace de travail' },
      { id: 3, path: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800', caption: 'Salle de réunion' },
    ],
    documents: [
      { id: 1, nom: 'Contrat de bail CTR-2024-042', ext: 'pdf',  date: new Date('2024-01-01') },
      { id: 2, nom: 'État des lieux entrée',         ext: 'pdf',  date: new Date('2024-01-02') },
      { id: 3, nom: 'Inventaire mobilier',           ext: 'docx', date: new Date('2024-01-02') },
    ],
  };

  // ── Computed ──────────────────────────────────────────────────
  get joursRestants(): number {
    if (!this.unite.contratActuel) return 0;
    return Math.max(0, Math.ceil(
      (this.unite.contratActuel.dateFin.getTime() - Date.now()) / 86400000
    ));
  }

  get contratExpireBientot(): boolean {
    return this.joursRestants > 0 && this.joursRestants <= 60;
  }

  get contratExpire(): boolean {
    return this.joursRestants === 0 && this.unite.contratActuel?.statut === 'actif';
  }

  get allContrats(): Contrat[] {
    const contrats = [...(this.unite.historiqueContrats ?? [])];
    if (this.unite.contratActuel) contrats.unshift(this.unite.contratActuel);
    return contrats;
  }

  get currentLightboxImage(): GalleryImage | undefined {
    return this.unite.images?.[this.lightboxIndex];
  }

  // ── Statut helpers ────────────────────────────────────────────
  getStatutLabel(s: string): string {
    return ({ 'disponible': 'Disponible', 'loué': 'Loué', 'maintenance': 'En travaux',
              'vendu': 'Vendu', 'inactif': 'Inactif' } as Record<string,string>)[s] ?? s;
  }

  getStatutClass(s: string): string {
    return ({ 'disponible': 'bg-green-100 text-green-700',
              'loué': 'bg-amber-100 text-amber-700',
              'maintenance': 'bg-orange-100 text-orange-600',
              'vendu': 'bg-gray-100 text-gray-500',
              'inactif': 'bg-red-100 text-red-600' } as Record<string,string>)[s] ?? 'bg-gray-100 text-gray-500';
  }

  getContratStatutClass(s: string): string {
    return ({ 'actif': 'bg-green-100 text-green-700',
              'expiré': 'bg-gray-100 text-gray-500',
              'résilié': 'bg-red-100 text-red-600',
              'en_attente': 'bg-amber-100 text-amber-700' } as Record<string,string>)[s] ?? 'bg-gray-100 text-gray-500';
  }

  getDocIconColor(ext: string): string {
    return ({ 'pdf': 'text-red-600 bg-red-100', 'doc': 'text-blue-600 bg-blue-100',
              'docx': 'text-blue-600 bg-blue-100', 'xls': 'text-green-600 bg-green-100',
              'xlsx': 'text-green-600 bg-green-100' } as Record<string,string>)[ext] ?? 'text-gray-500 bg-gray-100';
  }

  getInitials(nom: string, prenom: string): string {
    return `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase();
  }

  // ── Actions ───────────────────────────────────────────────────
  changerStatut(statut: UnitStatut): void { this.unite.statut = statut; }
  contacterLocataire(): void { console.log('Contacter', this.unite.locataireActuel?.email); }
  affecterLocataire(): void { console.log('Ouvrir formulaire affectation locataire'); }

  // ── Galerie ────────────────────────────────────────────────────
  openLightbox(i: number): void {
    this.lightboxIndex = i;
    this.showLightbox  = true;
    document.body.style.overflow = 'hidden';
  }
  closeLightbox(): void { this.showLightbox = false; document.body.style.overflow = ''; }
  prevImage(): void { const l = this.unite.images?.length ?? 0; this.lightboxIndex = (this.lightboxIndex - 1 + l) % l; }
  nextImage(): void { const l = this.unite.images?.length ?? 0; this.lightboxIndex = (this.lightboxIndex + 1) % l; }

  onFileSelected(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = ev => this.previewUrl = ev.target?.result as string;
    r.readAsDataURL(file);
  }
  uploadImage(): void {
    if (!this.previewUrl) return;
    const newId = Math.max(0, ...(this.unite.images?.map(i => i.id) ?? [0])) + 1;
    this.unite.images = [...(this.unite.images ?? []), { id: newId, path: this.previewUrl }];
    this.previewUrl = null;
  }
  cancelUpload(): void { this.previewUrl = null; }
  confirmDeleteImage(id: number): void { this.deletingImageId = id; this.showDeleteImage = true; }
  deleteImage(): void {
    this.unite.images = this.unite.images?.filter(i => i.id !== this.deletingImageId);
    this.showDeleteImage = false; this.deletingImageId = null;
    if (this.showLightbox) this.closeLightbox();
  }
}