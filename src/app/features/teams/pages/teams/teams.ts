import { Component, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUsers,
  lucideSearch,
  lucideSearchX,
  lucidePlus,
  lucideEye,
  lucidePencil,
  lucideTrash2,
  lucideTriangleAlert,
  lucideRefreshCw,
} from '@ng-icons/lucide';
import { Subject, takeUntil } from 'rxjs';

import { TeamModel } from '../../models/team.model';
import { TeamService } from '../../services/team.service';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { LoadingComponent } from '../../../../shared/components/loading/loading';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { ToastService } from '../../../../shared/services/toast.service';
import { TeamModal } from '../../components/modals/team-modal/team-modal';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    Pagination,
    LoadingComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    TeamModal,
  ],
  templateUrl: './teams.html',
  styleUrl: './teams.css',
  viewProviders: [
    provideIcons({
      lucideUsers,
      lucideSearch,
      lucideSearchX,
      lucidePlus,
      lucideEye,
      lucidePencil,
      lucideTrash2,
      lucideTriangleAlert,
      lucideRefreshCw,
    }),
  ],
})
export class Teams implements OnInit, OnDestroy {
  private readonly service = inject(TeamService);
  private readonly toast = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  loading = signal(true);
  error = signal<string | null>(null);

  allTeams = signal<TeamModel[]>([]);
  filteredTeams = signal<TeamModel[]>([]);

  currentPage = signal(1);
  itemsPerPage = signal(12);
  totalItems = signal(0);

  searchQuery = signal('');

  showModal = signal(false);
  editingTeam = signal<TeamModel | null>(null);
  deleteTarget = signal<TeamModel | null>(null);
  deleteLoading = signal(false);

  deleteMessage = computed(() => {
    const target = this.deleteTarget();
    return target ? `Le membre « ${target.name} » sera définitivement supprimé.` : '';
  });

  ngOnInit(): void {
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAll(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    this.service
      .findAll({ page, perPage: this.itemsPerPage() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.allTeams.set(response.data || []);
          this.applyFilters();
          this.currentPage.set(response.current_page || 1);
          this.itemsPerPage.set(response.per_page || 12);
          this.totalItems.set(response.total || 0);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Erreur lors du chargement des membres.');
          this.loading.set(false);
        },
      });
  }

  applyFilters(): void {
    const query = this.searchQuery().trim().toLowerCase();
    const teams = this.allTeams() || [];
    if (!query) {
      this.filteredTeams.set(teams);
      return;
    }

    this.filteredTeams.set(
      teams.filter(
        (team) =>
          team.name.toLowerCase().includes(query) ||
          (team.role ?? '').toLowerCase().includes(query) ||
          (team.description ?? '').toLowerCase().includes(query),
      ),
    );
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.applyFilters();
  }

  onPageChange(page: number): void {
    if (page < 1) return;
    this.loadAll(page);
  }

  openAdd(): void {
    this.editingTeam.set(null);
    this.showModal.set(true);
  }

  openEdit(team: TeamModel): void {
    this.editingTeam.set(team);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingTeam.set(null);
  }

  onSaved(team: TeamModel): void {
    this.closeModal();
    this.toast.success(`Le membre « ${team.name} » a bien été enregistré.`);
    this.loadAll(this.currentPage());
  }

  confirmDelete(team: TeamModel): void {
    this.deleteTarget.set(team);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  deleteTeam(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.deleteLoading.set(true);

    this.service
      .delete(target.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success(`Le membre « ${target.name} » a été supprimé.`);
          this.deleteTarget.set(null);
          this.deleteLoading.set(false);

          const nextPage =
            this.allTeams().length === 1 && this.currentPage() > 1
              ? this.currentPage() - 1
              : this.currentPage();
          this.loadAll(nextPage);
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors de la suppression.');
          this.deleteLoading.set(false);
        },
      });
  }
}
