import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsLeft,
  lucideChevronsRight,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideChevronLeft,
      lucideChevronRight,
      lucideChevronsLeft,
      lucideChevronsRight,
    }),
  ],
  templateUrl: './pagination.html',
})
export class Pagination {
  /** Page courante (1-based). */
  currentPage = input.required<number>();
  /** Nombre total d'éléments. */
  totalItems = input.required<number>();
  /** Éléments par page. */
  perPage = input<number>(10);

  /** Émis quand l'utilisateur change de page. */
  pageChange = output<number>();

  // ── Computed ─────────────────────────────────────────────
  totalPages = computed(() => {
    const total = Number(this.totalItems()) || 0;
    const perPage = Number(this.perPage()) || 10;
    return Math.max(1, Math.ceil(total / perPage));
  });

  hasPrev = computed(() => (Number(this.currentPage()) || 1) > 1);
  hasNext = computed(() => (Number(this.currentPage()) || 1) < this.totalPages());

  /** Tableau de numéros de pages à afficher (avec ellipsis sous forme de -1). */
  pages = computed<(number | -1)[]>(() => {
    const total = this.totalPages();
    const current = Number(this.currentPage()) || 1;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | -1)[] = [1];

    if (current > 3) pages.push(-1); // ellipsis gauche
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push(-1); // ellipsis droit
    pages.push(total);

    return pages;
  });

  /** Texte d'info "X–Y sur Z". */
  rangeText = computed(() => {
    const currentPage = Number(this.currentPage()) || 1;
    const perPage = Number(this.perPage()) || 10;
    const totalItems = Number(this.totalItems()) || 0;

    const from = (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, totalItems);
    return `${from}–${to} sur ${totalItems}`;
  });

  // ── Actions ──────────────────────────────────────────────
  go(page: number | -1): void {
    if (page === -1) return;
    if (page < 1 || page > this.totalPages()) return;
    if (page === this.currentPage()) return;
    this.pageChange.emit(page);
  }

  prev(): void {
    this.go(this.currentPage() - 1);
  }
  next(): void {
    this.go(this.currentPage() + 1);
  }
  first(): void {
    this.go(1);
  }
  last(): void {
    this.go(this.totalPages());
  }
}
