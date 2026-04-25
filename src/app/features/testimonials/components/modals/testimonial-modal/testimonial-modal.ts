import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideX, lucideSave, lucideLoader, lucideStar, lucideImage } from '@ng-icons/lucide';
import { Subject, takeUntil } from 'rxjs';
import { TestimonialModel } from '../../../models/testimonial.model';
import { TestimonialService } from '../../../services/testimonial.service';
import {
  CreateTestimonialPayload,
  UpdateTestimonialPayload,
  emptyTestimonialForm,
  testimonialToUpdatePayload,
} from '../../../interfaces/testimonial-payload.interface';

@Component({
  selector: 'app-testimonial-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  templateUrl: './testimonial-modal.html',
  styleUrl: './testimonial-modal.css',
  viewProviders: [provideIcons({ lucideX, lucideSave, lucideLoader, lucideStar, lucideImage })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialModal implements OnInit, OnDestroy {
  testimonial = input<TestimonialModel | null>(null);

  readonly saved = output<TestimonialModel>();
  readonly cancel = output<void>();

  private readonly service = inject(TestimonialService);
  private readonly destroy$ = new Subject<void>();

  saving = signal(false);
  error = signal<string | null>(null);
  form = signal<CreateTestimonialPayload>(emptyTestimonialForm());
  imagePreview = signal<string | null>(null);

  get isEdit(): boolean {
    return !!this.testimonial();
  }
  
  get title(): string {
    return this.isEdit ? 'Modifier le Témoignage' : 'Ajouter un Témoignage';
  }
  
  isValid = computed(() => {
    const form = this.form();
    return form && (form.name || '').trim() !== '' && (form.content || '').trim() !== '';
  });

  ngOnInit(): void {
    this.error.set(null);
    this.saving.set(false);

    const initialForm = emptyTestimonialForm();
    this.form.set({
      name: initialForm.name || '',
      role: initialForm.role || '',
      content: initialForm.content || '',
      note: initialForm.note ?? 5,
      image: null,
      is_visible: initialForm.is_visible ?? true,
      position: initialForm.position ?? 0,
    });
    this.imagePreview.set(null);

    if (this.testimonial()) {
      const payload = testimonialToUpdatePayload(this.testimonial()!);
      this.form.set({
        name: payload.name || '',
        role: payload.role || '',
        content: payload.content || '',
        note: payload.note ?? 5,
        image: null, // On garde null pour ne pas renvoyer l'URL si on ne change pas l'image
        is_visible: payload.is_visible ?? true,
        position: payload.position ?? 0,
      });
      this.imagePreview.set(this.testimonial()?.image || null);
    }
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.update((f) => ({ ...f, image: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  save(): void {
    if (!this.isValid() || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);

    const observable = this.testimonial()
      ? this.service.update({ id: this.testimonial()!.id, ...this.form() } as UpdateTestimonialPayload)
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
