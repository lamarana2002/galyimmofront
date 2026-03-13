import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideHome, lucideBuilding2, lucideSearch, lucideSearchX,
  lucideDownload, lucidePlus, lucideLayoutGrid, lucideList,
  lucideMapPin, lucideKey, lucideCheck, lucideBanknote,
  lucideEye, lucidePencil, lucideTrash2,
} from '@ng-icons/lucide';

export type BienStatut = 'disponible' | 'loué' | 'maintenance' | 'vendu' | 'inactif';

export interface BienItem {
  id: number;
  nom: string;
  code?: string;
  cover?: string;
  type: string;
  statut: BienStatut;
  adresse?: string;
  ville?: string;
  stats: {
    totalUnits: number;
    rentedUnits: number;
    availableUnits: number;
    revenuPotentiel: number;
  };
}

@Component({
  selector: 'app-properties',
  imports: [CommonModule, FormsModule, RouterLink, NgIconComponent, TitleCasePipe, DecimalPipe],
  templateUrl: './properties.html',
  styleUrl: './properties.css',
  viewProviders: [
    provideIcons({
      lucideHome, lucideBuilding2, lucideSearch, lucideSearchX,
      lucideDownload, lucidePlus, lucideLayoutGrid, lucideList,
      lucideMapPin, lucideKey, lucideCheck, lucideBanknote,
      lucideEye, lucidePencil, lucideTrash2,
    })
  ]
})
export class Properties implements OnInit {

  structureName = 'Immo Prestige CI';
  viewMode: 'grid' | 'table' = 'grid';
  searchQuery = '';
  activeStatut = 'all';
  activeType   = 'all';
  currentPage  = 1;
  itemsPerPage = 12;

  deleteBienTarget: BienItem | null = null;

  typeOptions = ['appartement', 'villa', 'commercial', 'terrain', 'bureau'];

  statutFilters = [
    { label: 'Tous',        value: 'all'         },
    { label: 'Disponible',  value: 'disponible'  },
    { label: 'Loué',        value: 'loué'        },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Vendu',       value: 'vendu'       },
  ];

  kpis = [
    { label: 'Total biens',  value: 0, icon: 'lucideHome',      bgClass: 'bg-primary-100',   iconClass: 'text-primary-700'   },
    { label: 'Disponibles',  value: 0, icon: 'lucideCheck',     bgClass: 'bg-green-100',     iconClass: 'text-green-600'     },
    { label: 'Loués',        value: 0, icon: 'lucideKey',       bgClass: 'bg-amber-100',     iconClass: 'text-amber-600'     },
    { label: 'En travaux',   value: 0, icon: 'lucideBuilding2', bgClass: 'bg-orange-100',    iconClass: 'text-orange-600'    },
  ];

  allBiens: BienItem[] = [
    { id: 1, nom: 'Villa Les Deux Plateaux',       code: 'BIEN-001', type: 'villa',        statut: 'loué',        adresse: 'Cocody',   ville: 'Abidjan',    stats: { totalUnits: 1,  rentedUnits: 1,  availableUnits: 0, revenuPotentiel: 2500000  } },
    { id: 2, nom: 'Appartement T3 Zone 4',         code: 'BIEN-002', type: 'appartement',  statut: 'disponible',  adresse: 'Marcory',  ville: 'Abidjan',    stats: { totalUnits: 1,  rentedUnits: 0,  availableUnits: 1, revenuPotentiel: 800000   } },
    { id: 3, nom: 'Immeuble Le Plateau',           code: 'BIEN-003', type: 'commercial',   statut: 'loué',        adresse: 'Plateau',  ville: 'Abidjan',    stats: { totalUnits: 6,  rentedUnits: 5,  availableUnits: 1, revenuPotentiel: 9000000  } },
    { id: 4, nom: 'Terrain Bingerville 800m²',     code: 'BIEN-004', type: 'terrain',      statut: 'disponible',  adresse: '',         ville: 'Bingerville',stats: { totalUnits: 1,  rentedUnits: 0,  availableUnits: 1, revenuPotentiel: 0        } },
    { id: 5, nom: 'Résidence Angré 10 logements',  code: 'BIEN-005', type: 'appartement',  statut: 'loué',        adresse: 'Angré',    ville: 'Abidjan',    stats: { totalUnits: 10, rentedUnits: 8,  availableUnits: 2, revenuPotentiel: 6400000  } },
    { id: 6, nom: 'Bureau Riviera 3',              code: 'BIEN-006', type: 'bureau',       statut: 'maintenance', adresse: 'Riviera',  ville: 'Abidjan',    stats: { totalUnits: 3,  rentedUnits: 0,  availableUnits: 0, revenuPotentiel: 3600000  } },
    { id: 7, nom: 'Villa Yopougon Selmer',         code: 'BIEN-007', type: 'villa',        statut: 'disponible',  adresse: 'Yopougon',  ville: 'Abidjan',   stats: { totalUnits: 1,  rentedUnits: 0,  availableUnits: 1, revenuPotentiel: 1200000  } },
  ];

  filteredBiens: BienItem[] = [];

  ngOnInit(): void {
    this.applyFilters();
    this.updateKpis();
  }

  applyFilters(): void {
    let result = [...this.allBiens];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(b =>
        b.nom.toLowerCase().includes(q) ||
        b.code?.toLowerCase().includes(q) ||
        b.adresse?.toLowerCase().includes(q) ||
        b.ville?.toLowerCase().includes(q)
      );
    }
    if (this.activeStatut !== 'all') result = result.filter(b => b.statut === this.activeStatut);
    if (this.activeType   !== 'all') result = result.filter(b => b.type   === this.activeType);
    this.filteredBiens = result;
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.activeStatut = 'all';
    this.activeType   = 'all';
    this.applyFilters();
  }

  updateKpis(): void {
    this.kpis[0].value = this.allBiens.length;
    this.kpis[1].value = this.allBiens.filter(b => b.statut === 'disponible').length;
    this.kpis[2].value = this.allBiens.filter(b => b.statut === 'loué').length;
    this.kpis[3].value = this.allBiens.filter(b => b.statut === 'maintenance').length;
  }

  getStatutCount(statut: string): number {
    if (statut === 'all') return this.allBiens.length;
    return this.allBiens.filter(b => b.statut === statut).length;
  }

  getStatutLabel(statut: string): string {
    const m: Record<string, string> = {
      'disponible':  'Disponible',
      'loué':        'Loué',
      'maintenance': 'En travaux',
      'vendu':       'Vendu',
      'inactif':     'Inactif',
    };
    return m[statut] ?? statut;
  }

  getStatutClass(statut: string): string {
    const m: Record<string, string> = {
      'disponible':  'bg-green-100 text-green-700',
      'loué':        'bg-amber-100 text-amber-700',
      'maintenance': 'bg-orange-100 text-orange-600',
      'vendu':       'bg-gray-100 text-gray-600',
      'inactif':     'bg-red-100 text-red-600',
    };
    return m[statut] ?? 'bg-gray-100 text-gray-600';
  }

  getTauxOccupation(b: BienItem): number {
    if (!b.stats.totalUnits) return 0;
    return Math.round((b.stats.rentedUnits / b.stats.totalUnits) * 100);
  }

  openAddBien(): void { console.log('Ouvrir formulaire nouveau bien'); }
  editBien(b: BienItem): void { console.log('Éditer bien', b.id); }
  confirmDeleteBien(b: BienItem): void { this.deleteBienTarget = b; }
  deleteBien(): void {
    if (!this.deleteBienTarget) return;
    this.allBiens = this.allBiens.filter(b => b.id !== this.deleteBienTarget!.id);
    this.deleteBienTarget = null;
    this.applyFilters();
    this.updateKpis();
  }

  get totalPages(): number { return Math.ceil(this.filteredBiens.length / this.itemsPerPage); }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  changePage(p: number): void { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }
}