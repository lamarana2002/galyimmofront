import { Component, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideMessageSquare,
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

import { TestimonialModel } from '../../models/testimonial.model';
import { TestimonialService } from '../../services/testimonial.service';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { LoadingComponent } from '../../../../shared/components/loading/loading';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { ToastService } from '../../../../shared/services/toast.service';
import { TestimonialModal } from '../../components/modals/testimonial-modal/testimonial-modal';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    Pagination,
    LoadingComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    TestimonialModal,
  ],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css',
  viewProviders: [
    provideIcons({
      lucideMessageSquare,
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
export class Testimonials implements OnInit, OnDestroy {
  private readonly service = inject(TestimonialService);
  private readonly toast = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  loading = signal(true);
  error = signal<string | null>(null);

  allTestimonials = signal<TestimonialModel[]>([]);
  filteredTestimonials = signal<TestimonialModel[]>([]);

  currentPage = signal(1);
  itemsPerPage = signal(12);
  totalItems = signal(0);

  searchQuery = signal('');

  showModal = signal(false);
  editingTestimonial = signal<TestimonialModel | null>(null);
  deleteTarget = signal<TestimonialModel | null>(null);
  deleteLoading = signal(false);

  deleteMessage = computed(() => {
    const target = this.deleteTarget();
    return target
      ? `Le témoignage de « ${target.name} » sera définitivement supprimé.`
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
          this.allTestimonials.set(response.data || []);
          this.filteredTestimonials.set(response.data || []);
          this.totalItems.set(response.total || 0);
          this.currentPage.set(response.current_page || 1);
          this.itemsPerPage.set(response.per_page || 12);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.message ?? 'Erreur lors du chargement des témoignages.');
        },
      });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.filterTestimonials();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadAll(page);
  }

  filterTestimonials(): void {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      this.filteredTestimonials.set(this.allTestimonials());
      return;
    }

    const filtered = this.allTestimonials().filter(
      (testimonial) =>
        testimonial.name.toLowerCase().includes(query) || testimonial.content.toLowerCase().includes(query) || (testimonial.role && testimonial.role.toLowerCase().includes(query)),
    );
    this.filteredTestimonials.set(filtered);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filteredTestimonials.set(this.allTestimonials());
  }

  openAdd(): void {
    this.editingTestimonial.set(null);
    this.showModal.set(true);
  }

  openEdit(testimonial: TestimonialModel): void {
    this.editingTestimonial.set(testimonial);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingTestimonial.set(null);
  }

  onSaved(testimonial: TestimonialModel): void {
    this.closeModal();
    this.toast.success('Témoignage enregistré avec succès.');
    this.loadAll(this.currentPage());
  }

  confirmDelete(testimonial: TestimonialModel): void {
    this.deleteTarget.set(testimonial);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
    this.deleteLoading.set(false);
  }

  deleteTestimonial(): void {
    const testimonial = this.deleteTarget();
    if (!testimonial) return;

    this.deleteLoading.set(true);
    this.service
      .delete(testimonial.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Témoignage supprimé avec succès.');
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
