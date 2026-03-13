import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideBuilding,
  lucideUsers,
  lucideKey,
  lucideCrown,
  lucideSearch,
  lucideSearchX,
  lucideDownload,
  lucidePlus,
  lucideLayoutGrid,
  lucideList,
  lucideClock,
  lucideCheckCircle,
  lucideCheck,
  lucidePause,
  lucidePlay,
  lucideMail,
  lucideEye,
  lucideTrash2,
  lucideX,
  lucideSend,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { Subscription } from 'rxjs';

import { StructureModel } from '../../models/structure.model';
import { StructurePlanType } from '../../enums/structure-plan-type.enum';
import { StructureStatus } from '../../enums/structure-status.enum';
import { StructureService } from '../../services/structure.service';
import { FilterStructure } from '../../interfaces/filter-structure.interface';
import { StructureGridView } from '../../components/structures/structure-grid-view/structure-grid-view';
import { StructureListView } from '../../components/structures/structure-list-view/structure-list-view';
import { IQueryParam } from '../../../../shared/interfaces/query-parms.interface';
import { StructureStats } from '../../models/structure-stats.model';

@Component({
  selector: 'app-structures',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, StructureGridView, StructureListView],
  templateUrl: './structures.html',
  viewProviders: [
    provideIcons({
      lucideBuilding2,
      lucideBuilding,
      lucideUsers,
      lucideKey,
      lucideCrown,
      lucideSearch,
      lucideSearchX,
      lucideDownload,
      lucidePlus,
      lucideLayoutGrid,
      lucideList,
      lucideClock,
      lucideCheckCircle,
      lucideCheck,
      lucidePause,
      lucidePlay,
      lucideMail,
      lucideEye,
      lucideTrash2,
      lucideX,
      lucideSend,
      lucideTriangleAlert,
    }),
  ],
})
export class Structures implements OnInit, OnDestroy {
  private sub?: Subscription;
  service = inject(StructureService);

  // Enums exposés au template
  StructureStatus = StructureStatus;
  StructurePlanType = StructurePlanType;

  // ── Données ───────────────────────────────────────────────────
  allStructures: StructureModel[] = [];
  filteredStructures: StructureModel[] = [];
  stats: StructureStats = {
    total: 0,
    suspended: 0,
    rejected: 0,
    premium: 0,
    freemium: 0,
    active: 0,
    pending: 0,
  };

  // ── UI ────────────────────────────────────────────────────────
  viewMode: 'grid' | 'table' = 'grid';
  searchQuery = '';
  activePlan = 'all';
  activeStatut = 'all';
  // Pagination
  currentPage = 1;
  itemsPerPage = 8;
  totalItems = 0;
  hasNext = false;
  hasPrev = false;
  // State
  loading = true;
  error: string | null = null;

  // ── Modals ────────────────────────────────────────────────────
  contactTarget: StructureModel | null = null;
  contactSubject = '';
  contactMessage = '';
  deleteTarget: StructureModel | null = null;

  // ── Filtres ───────────────────────────────────────────────────
  planFilters = [
    { label: 'Tous', value: 'all' },
    { label: 'Freemium', value: 'freemium' },
    { label: 'Premium', value: 'premium' },
  ];
  statutFilters = [
    { label: 'Tous', value: 'all' },
    { label: 'En attente', value: StructureStatus.PENDING },
    { label: 'Approuvés', value: StructureStatus.APPROUVED },
    { label: 'Suspendus', value: StructureStatus.SUSPENDED },
    { label: 'Rejetés', value: StructureStatus.REJECTED },
  ];

  private cdr = inject(ChangeDetectorRef);

  // ── KPIs ──────────────────────────────────────────────────────
  kpis = [
    {
      label: 'Total structures',
      value: 0,
      icon: 'lucideBuilding2',
      bgClass: 'bg-primary-100',
      iconClass: 'text-primary-700',
      trend: 0,
    },
    {
      label: 'En attente',
      value: 0,
      icon: 'lucideClock',
      bgClass: 'bg-amber-100',
      iconClass: 'text-amber-600',
      trend: 0,
    },
    {
      label: 'Premium',
      value: 0,
      icon: 'lucideCrown',
      bgClass: 'bg-secondary-100',
      iconClass: 'text-secondary-500',
      trend: 0,
    },
    {
      label: 'Suspendues',
      value: 0,
      icon: 'lucidePause',
      bgClass: 'bg-orange-100',
      iconClass: 'text-orange-600',
      trend: 0,
    },
  ];

  // ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadStructures(this.buildQueryParams(this.currentPage));
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // ── Chargement API ────────────────────────────────────────────
  loadStructures(queryParams?: IQueryParam): void {
    this.loading = true;
    this.error = null;

    this.sub = this.service.findAll(queryParams).subscribe({
      next: (response) => {
        console.log(response);

        // Normaliser : ajouter stats par défaut si absent (backend pas encore implémenté)
        this.allStructures = (response.data);
        this.applyFilters(this.buildFilterData());
        this.loading = false;

        this.currentPage = response.current_page;
        this.itemsPerPage = response.per_page;
        this.totalItems = response.total;
        this.hasNext = !!response.next_page_url;
        this.hasPrev = !!response.prev_page_url;

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Erreur lors du chargement des structures.';
        this.loading = false;
      },
    });
  }
  loadStats() {
    this.loading = true;
    this.error = null;

    this.sub = this.service.getStats().subscribe({
      next: (response) => {
        console.log(response);

        // Normaliser : ajouter stats par défaut si absent (backend pas encore implémenté)
        this.stats = response;
        this.updateKpis(this.stats);
        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Erreur lors du chargement des stats des structures.';
        this.loading = false;
      },
    });
  }

  // ── Normalisation — adapte la réponse API au modèle Angular ───
  // private normalize(raw: any): StructureModel {
  //   return {
  //     ...raw,

  //     // ── Propriétaire ────────────────────────────────────────────
  //     // Backend retourne users[] avec pivot.role
  //     // On extrait le user ayant le rôle 'owner' ou 'admin'
  //     proprietaire: this.extractOwner(raw.users),

  //     // ── Stats ───────────────────────────────────────────────────
  //     // Sera enrichi par le backend (withCount) — fallback 0 en attendant
  //     stats: raw.stats ?? {
  //       employes: raw.users_count ?? raw.users?.length ?? 0,
  //       biens: raw.biens_count ?? 0,
  //       locations: raw.locations_count ?? 0,
  //     },

  //     // ── Activité ─────────────────────────────────────────────────
  //     lastActivity: raw.lastActivity ?? this.timeAgo(raw.updated_at),
  //     lastActivityType: raw.lastActivityType ?? 'Mise à jour',
  //   };
  // }

  // Extrait le propriétaire depuis users[]
  // La migration users a structure_id direct (pas de pivot)
  // Le rôle peut venir :
  //   1. d'une table roles/user_roles (eager loaded)
  //   2. d'un champ role directement sur le user
  //   3. fallback → premier user du tableau
  // private extractOwner(users: any[]): StructureModel['owner'] {
  //   if (!users?.length) return undefined;

  //   const owner =
  //     users.find(
  //       (u) =>
  //         u.role === 'owner' ||
  //         u.role === 'admin' ||
  //         u.roles?.some((r: any) => r.name === 'owner' || r.name === 'admin'),
  //     ) ?? users[0];

  //   return {
  //     id: owner.id,
  //     nom: owner.nom ?? '',
  //     prenom: owner.prenom ?? '',
  //     email: owner.email ?? '',
  //     telephone: owner.telephone ?? null,
  //     avatar: owner.avatar ?? 'avatar.png',
  //   };
  // }

  // ── Filtrage ──────────────────────────────────────────────────
  applyFilters(filter?: FilterStructure): void {
    if (!this.allStructures.length) {
      this.filteredStructures = [];
      return;
    }

    let result = [...this.allStructures];

    if (filter?.search?.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.owner?.nom?.toLowerCase().includes(q) ||
          s.owner?.prenom?.toLowerCase().includes(q) ||
          s.owner?.email?.toLowerCase().includes(q),
      );
    }
    if (filter?.plan && filter.plan !== 'all') {
      result = result.filter((s) => s.plan === filter.plan);
    }
    if (filter?.status && filter.status !== 'all') {
      result = result.filter((s) => s.status === filter.status);
    }

    this.filteredStructures = result;
    this.currentPage = 1;
  }

  buildFilterData(): FilterStructure {
    return {
      search: this.searchQuery,
      plan: this.activePlan,
      status: this.activeStatut,
    };
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.activePlan = 'all';
    this.activeStatut = 'all';
    this.applyFilters(this.buildFilterData());
  }

  // ── KPIs ──────────────────────────────────────────────────────
  updateKpis(stats: StructureStats): void {
    const all = this.allStructures;
    this.kpis[0].value = stats.total;
    this.kpis[1].value = stats.pending;
    this.kpis[2].value = stats.premium;
    this.kpis[3].value = stats.suspended;
  }

  // ── Helpers ───────────────────────────────────────────────────
  getStatutLabel(status: string): string {
    return this.service.getStatutLabel(status);
  }

  getOwnerName(nom?: string, prenom?: string){
    return `${prenom} ${nom}`;
  }

  getInitials(name: string): string {
    return this.service.getInitials(name);
  }

  getHealthScore(s: StructureModel): number {
    return this.service.getHealthScore(s);
  }

  getPlanCount(plan: string): number {
    if (plan === 'all') return this.allStructures.length;
    return this.allStructures.filter((s) => s.plan === plan).length;
  }

  // Formate updated_at en "il y a X"
  private timeAgo(iso: string): string {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    const h = Math.floor(min / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `il y a ${d}j`;
    if (h > 0) return `il y a ${h}h`;
    if (min > 0) return `il y a ${min}min`;
    return "à l'instant";
  }

  // ── Actions admin ─────────────────────────────────────────────
  onStatusChanged(data: { id: number; status: StructureStatus }) {
    this.sub = this.service.changeStatus(data.id, data.status).subscribe({
      next: (response) => {
        console.log(response);
        this.loadStructures();
        this.loadStats();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  onPlanChange(id: number): void {
    this.sub = this.service.changePlan(id).subscribe({
      next: (response) => {
        console.log(response);

        this.loadStructures();
        this.loadStats();
      },
      error: (error) => {
        console.log(error);
      },
    });
    this.loadStats();
  }

  openContact(s: StructureModel): void {
    this.contactTarget = s;
    this.contactSubject = `Concernant votre structure "${s.name}"`;
    this.contactMessage = '';
  }

  sendContact(): void {
    // TODO: this.service.sendContact(...).subscribe(...)
    console.log('Contact →', this.contactTarget?.owner?.email);
    this.contactTarget = null;
  }

  confirmDelete(s: StructureModel): void {
    this.deleteTarget = s;
  }

  deleteStructure(): void {
    if (!this.deleteTarget) return;
    // TODO: this.service.delete(this.deleteTarget.id).subscribe(...)
    this.allStructures = this.allStructures.filter((s) => s.id !== this.deleteTarget!.id);
    this.deleteTarget = null;
    this.applyFilters(this.buildFilterData());
    this.loadStats();
  }

  buildQueryParams(p: number): IQueryParam {
    return {
      page: p,
      perPage: this.itemsPerPage,
    };
  }

  onPageChange(p: number) {
    this.loadStructures(this.buildQueryParams(p));
  }
}
