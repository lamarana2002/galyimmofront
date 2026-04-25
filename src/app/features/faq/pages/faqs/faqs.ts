import { Component, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideHelpCircle,
  lucideSearch,
  lucidePlus,
  lucidePencil,
  lucideTrash2,
  lucideTriangleAlert,
  lucideRefreshCw,
  lucideEye,
  lucideEyeOff,
} from '@ng-icons/lucide';
import { Subject, takeUntil } from 'rxjs';

import { FaqModel } from '../../models/faq.model';
import { FaqService } from '../../services/faq.service';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { LoadingComponent } from '../../../../shared/components/loading/loading';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { ToastService } from '../../../../shared/services/toast.service';
import { FaqModal } from '../../components/modals/faq-modal/faq-modal';

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    Pagination,
    LoadingComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    FaqModal,
  ],
  templateUrl: './faqs.html',
  styleUrl: './faqs.css',
  viewProviders: [
    provideIcons({
      lucideHelpCircle,
      lucideSearch,
      lucidePlus,
      lucidePencil,
      lucideTrash2,
      lucideTriangleAlert,
      lucideRefreshCw,
      lucideEye,
      lucideEyeOff,
    }),
  ],
})
export class Faqs implements OnInit, OnDestroy {
  private readonly service = inject(FaqService);
  private readonly toast = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  loading = signal(true);
  error = signal<string | null>(null);

  allFaqs = signal<FaqModel[]>([]);
  filteredFaqs = signal<FaqModel[]>([]);

  currentPage = signal(1);
  itemsPerPage = signal(12);
  totalItems = signal(0);

  searchQuery = signal('');

  showModal = signal(false);
  editingFaq = signal<FaqModel | null>(null);
  deleteTarget = signal<FaqModel | null>(null);
  deleteLoading = signal(false);

  deleteMessage = computed(() => {
    const target = this.deleteTarget();
    return target
      ? `La FAQ « ${target.question.substring(0, 50)}${target.question.length > 50 ? '...' : ''} » sera définitivement supprimée.`
      : '';
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
          this.loading.set(false);
          this.allFaqs.set(response.data || []);
          this.filteredFaqs.set(response.data || []);
          this.totalItems.set(response.total || 0);
          this.currentPage.set(response.current_page || 1);
          this.itemsPerPage.set(response.per_page || 12);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.message ?? 'Erreur lors du chargement des FAQs.');
        },
      });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.filterFaqs();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadAll(page);
  }

  filterFaqs(): void {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      this.filteredFaqs.set(this.allFaqs());
      return;
    }

    const filtered = this.allFaqs().filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query),
    );
    this.filteredFaqs.set(filtered);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filteredFaqs.set(this.allFaqs());
  }

  openAdd(): void {
    this.editingFaq.set(null);
    this.showModal.set(true);
  }

  openEdit(faq: FaqModel): void {
    this.editingFaq.set(faq);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingFaq.set(null);
  }

  onSaved(faq: FaqModel): void {
    this.closeModal();
    this.toast.success('FAQ enregistrée avec succès.');
    this.loadAll(this.currentPage());
  }

  confirmDelete(faq: FaqModel): void {
    this.deleteTarget.set(faq);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
    this.deleteLoading.set(false);
  }

  deleteFaq(): void {
    const faq = this.deleteTarget();
    if (!faq) return;

    this.deleteLoading.set(true);
    this.service
      .delete(faq.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('FAQ supprimée avec succès.');
          this.cancelDelete();
          this.loadAll(this.currentPage());
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Erreur lors de la suppression.');
          this.cancelDelete();
        },
      });
  }
}
