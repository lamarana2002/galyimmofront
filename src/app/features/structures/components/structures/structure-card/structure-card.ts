import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2, lucideBuilding, lucideUsers, lucideKey, lucideCrown,
  lucideSearch, lucideSearchX, lucideDownload, lucidePlus, lucideLayoutGrid,
  lucideList, lucideClock, lucideCheckCircle, lucideCheck, lucidePause,
  lucidePlay, lucideMail, lucideEye, lucideTrash2, lucideX, lucideSend,
  lucideTriangleAlert,
} from '@ng-icons/lucide';

export type PlanType    = 'premium' | 'freemium';
export type StatutType  = 'approuvé' | 'rejeté' | 'en_attente' | 'suspendu';

export interface StructureOwner {
  name: string;
  email: string;
}

export interface StructureItem {
  id: number;
  name: string;
  cover?: string;
  plan: PlanType;
  statut: StatutType;
  stats: { employes: number; biens: number; locations: number };
  proprietaire?: StructureOwner;
  lastActivity: string;
  lastActivityType: string;
  createdAt: Date;
}

@Component({
  selector: 'app-structures',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgIconComponent, DatePipe, TitleCasePipe],
  templateUrl: './structure-card.html',
  viewProviders: [
    provideIcons({
      lucideBuilding2, lucideBuilding, lucideUsers, lucideKey, lucideCrown,
      lucideSearch, lucideSearchX, lucideDownload, lucidePlus, lucideLayoutGrid,
      lucideList, lucideClock, lucideCheckCircle, lucideCheck, lucidePause,
      lucidePlay, lucideMail, lucideEye, lucideTrash2, lucideX, lucideSend,
      lucideTriangleAlert,
    })
  ]
})
export class StructureCard implements OnInit {

  viewMode: 'grid' | 'table' = 'grid';
  searchQuery = '';
  activePlan = 'all';
  activeStatut = 'all';
  currentPage = 1;
  itemsPerPage = 12;

  contactTarget: StructureItem | null = null;
  contactSubject = '';
  contactMessage = '';
  deleteTarget: StructureItem | null = null;

  planFilters    = [{ label: 'Tous', value: 'all' }, { label: 'Freemium', value: 'freemium' }, { label: 'Premium', value: 'premium' }];
  statutFilters  = [{ label: 'Tous', value: 'all' }, { label: 'En attente', value: 'en_attente' }, { label: 'Approuvés', value: 'approuvé' }, { label: 'Suspendus', value: 'suspendu' }, { label: 'Rejetés', value: 'rejeté' }];

  kpis = [
    { label: 'Total structures', value: 0,  icon: 'lucideBuilding2', bgClass: 'bg-primary-100',   iconClass: 'text-primary-700',  trend: 12  },
    { label: 'En attente',       value: 0,  icon: 'lucideClock',     bgClass: 'bg-amber-100',     iconClass: 'text-amber-600',    trend: 5   },
    { label: 'Premium',          value: 0,  icon: 'lucideCrown',     bgClass: 'bg-secondary-100', iconClass: 'text-secondary-500', trend: 8  },
    { label: 'Suspendues',       value: 0,  icon: 'lucidePause',     bgClass: 'bg-orange-100',    iconClass: 'text-orange-600',   trend: -2  },
  ];

  // ── Données mock ────────────────────────────────────────────────
  allStructures: StructureItem[] = [
    { id: 1, name: 'Immo Prestige CI',      plan: 'premium',  statut: 'approuvé',   stats: { employes: 8,  biens: 23, locations: 14 }, proprietaire: { name: 'Koné Mamadou',   email: 'kone@immoprestige.ci'    }, lastActivity: 'il y a 2h',    lastActivityType: 'Nouveau bien ajouté',     createdAt: new Date('2024-01-15') },
    { id: 2, name: 'Habitat Plus',          plan: 'freemium', statut: 'en_attente', stats: { employes: 2,  biens: 5,  locations: 3  }, proprietaire: { name: 'Aka Brice',      email: 'aka@habitatplus.ci'      }, lastActivity: 'il y a 1j',    lastActivityType: 'Document soumis',         createdAt: new Date('2024-03-02') },
    { id: 3, name: 'Résidence Cocody',      plan: 'premium',  statut: 'approuvé',   stats: { employes: 5,  biens: 12, locations: 9  }, proprietaire: { name: 'Kouamé Denis',   email: 'kouame@rescocody.ci'     }, lastActivity: 'il y a 3j',    lastActivityType: 'Contrat signé',           createdAt: new Date('2023-11-20') },
    { id: 4, name: 'Sud Immo',             plan: 'freemium', statut: 'suspendu',   stats: { employes: 1,  biens: 2,  locations: 0  }, proprietaire: { name: 'Bah Ibrahim',    email: 'bah@sudimmo.ci'          }, lastActivity: 'il y a 15j',   lastActivityType: 'Compte suspendu',         createdAt: new Date('2024-05-10') },
    { id: 5, name: 'Plateaux Invest',      plan: 'premium',  statut: 'approuvé',   stats: { employes: 12, biens: 34, locations: 21 }, proprietaire: { name: 'Diallo Seydou',  email: 'diallo@plateauxinvest.ci'}, lastActivity: 'il y a 30min', lastActivityType: 'Paiement reçu',           createdAt: new Date('2023-08-05') },
    { id: 6, name: 'Abobo Logements',      plan: 'freemium', statut: 'rejeté',     stats: { employes: 3,  biens: 7,  locations: 2  }, proprietaire: { name: 'Traoré Aminata', email: 'traore@abobolog.ci'      }, lastActivity: 'il y a 7j',    lastActivityType: 'Dossier incomplet',       createdAt: new Date('2024-06-18') },
    { id: 7, name: 'Grand Bassam Villas',  plan: 'premium',  statut: 'en_attente', stats: { employes: 4,  biens: 9,  locations: 5  }, proprietaire: { name: 'Ouédraogo Jean', email: 'oued@gbvillas.ci'        }, lastActivity: 'il y a 4j',    lastActivityType: 'Documents envoyés',       createdAt: new Date('2024-07-01') },
    { id: 8, name: 'Yopougon Immobilier',  plan: 'freemium', statut: 'approuvé',   stats: { employes: 2,  biens: 4,  locations: 3  }, proprietaire: { name: 'Coulibaly Fanta', email: 'coul@yopoimmo.ci'       }, lastActivity: 'il y a 1j',    lastActivityType: 'Nouveau locataire',       createdAt: new Date('2024-04-22') },
  ];

  filteredStructures: StructureItem[] = [];

  ngOnInit(): void {
    this.applyFilters();
    this.updateKpis();
  }

  // ── Filtrage ─────────────────────────────────────────────────
  applyFilters(): void {
    let result = [...this.allStructures];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.proprietaire?.name.toLowerCase().includes(q) ||
        s.proprietaire?.email.toLowerCase().includes(q)
      );
    }
    if (this.activePlan !== 'all')   result = result.filter(s => s.plan === this.activePlan);
    if (this.activeStatut !== 'all') result = result.filter(s => s.statut === this.activeStatut);
    this.filteredStructures = result;
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.activePlan = 'all';
    this.activeStatut = 'all';
    this.applyFilters();
  }

  // ── KPIs ─────────────────────────────────────────────────────
  updateKpis(): void {
    this.kpis[0].value = this.allStructures.length;
    this.kpis[1].value = this.allStructures.filter(s => s.statut === 'en_attente').length;
    this.kpis[2].value = this.allStructures.filter(s => s.plan === 'premium').length;
    this.kpis[3].value = this.allStructures.filter(s => s.statut === 'suspendu').length;
  }

  // ── Helpers ──────────────────────────────────────────────────
  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      'approuvé': 'Approuvée', 'rejeté': 'Rejetée',
      'en_attente': 'En attente', 'suspendu': 'Suspendue',
    };
    return map[statut] ?? statut;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  /** Score de santé basé sur biens + locations + employes */
  getHealthScore(s: StructureItem): number {
    if (s.statut === 'suspendu' || s.statut === 'rejeté') return 15;
    const score = Math.min(100, (s.stats.biens * 3) + (s.stats.locations * 2) + (s.stats.employes * 2));
    return Math.max(10, score);
  }

  getPlanCount(plan: string): number {
    if (plan === 'all') return this.allStructures.length;
    return this.allStructures.filter(s => s.plan === plan).length;
  }

  // ── Actions admin ─────────────────────────────────────────────
  changeStatut(s: StructureItem, newStatut: StatutType): void {
    const idx = this.allStructures.findIndex(x => x.id === s.id);
    if (idx > -1) this.allStructures[idx].statut = newStatut;
    this.applyFilters();
    this.updateKpis();
  }

  changePlan(s: StructureItem): void {
    const idx = this.allStructures.findIndex(x => x.id === s.id);
    if (idx > -1) {
      this.allStructures[idx].plan = s.plan === 'premium' ? 'freemium' : 'premium';
    }
    this.applyFilters();
    this.updateKpis();
  }

  openContact(s: StructureItem): void {
    this.contactTarget = s;
    this.contactSubject = `Concernant votre structure "${s.name}"`;
    this.contactMessage = '';
  }

  sendContact(): void {
    console.log('Envoyer message à', this.contactTarget?.proprietaire?.email);
    console.log('Sujet:', this.contactSubject);
    console.log('Message:', this.contactMessage);
    this.contactTarget = null;
  }

  confirmDelete(s: StructureItem): void {
    this.deleteTarget = s;
  }

  deleteStructure(): void {
    if (!this.deleteTarget) return;
    this.allStructures = this.allStructures.filter(s => s.id !== this.deleteTarget!.id);
    this.deleteTarget = null;
    this.applyFilters();
    this.updateKpis();
  }

  // ── Pagination ────────────────────────────────────────────────
  get totalPages(): number {
    return Math.ceil(this.filteredStructures.length / this.itemsPerPage);
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }
}