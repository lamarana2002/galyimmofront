import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideX, lucideSave, lucideLoader } from '@ng-icons/lucide';
import { Subject, takeUntil } from 'rxjs';
import { FaqModel } from '../../../models/faq.model';
import { FaqService } from '../../../services/faq.service';
import {
  CreateFaqPayload,
  UpdateFaqPayload,
  emptyFaqForm,
  faqToUpdatePayload,
} from '../../../interfaces/faq-payload.interface';

@Component({
  selector: 'app-faq-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  templateUrl: './faq-modal.html',
  styleUrl: './faq-modal.css',
  viewProviders: [provideIcons({ lucideX, lucideSave, lucideLoader })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqModal implements OnInit, OnDestroy {
  faq = input<FaqModel | null>(null);

  readonly saved = output<FaqModel>();
  readonly cancel = output<void>();

  private readonly service = inject(FaqService);
  private readonly destroy$ = new Subject<void>();

  saving = signal(false);
  error = signal<string | null>(null);
  form = signal<CreateFaqPayload>(emptyFaqForm());

  isEdit = computed(() => !!this.faq());
  title = computed(() => (this.isEdit() ? 'Modifier la FAQ' : 'Ajouter une FAQ'));
  isValid = computed(() => {
    const form = this.form();
    return form && (form.question || '').trim() !== '' && (form.answer || '').trim() !== '';
  });

  ngOnInit(): void {
    this.error.set(null);
    this.saving.set(false);

    const initialForm = emptyFaqForm();
    this.form.set({
      question: initialForm.question || '',
      answer: initialForm.answer || '',
      is_visible: initialForm.is_visible ?? true,
      position: initialForm.position ?? 0,
    });

    if (this.faq()) {
      const payload = faqToUpdatePayload(this.faq()!);
      this.form.set({
        question: payload.question || '',
        answer: payload.answer || '',
        is_visible: payload.is_visible ?? true,
        position: payload.position ?? 0,
      });
    }
  }

  save(): void {
    if (!this.isValid() || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);

    const observable = this.faq()
      ? this.service.update({ id: this.faq()!.id, ...this.form() } as UpdateFaqPayload)
      : this.service.create(this.form());

    observable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.saving.set(false);
        this.saved.emit(response.data);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Erreur lors de l’enregistrement.');
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.cancel.emit();
  }
}
