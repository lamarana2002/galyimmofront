import { Component, Input, OnInit, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideX, lucideSave, lucideLoader, lucideStar } from '@ng-icons/lucide';
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
  viewProviders: [provideIcons({ lucideX, lucideSave, lucideLoader, lucideStar })],
})
export class TestimonialModal implements OnInit {
  @Input() testimonial: TestimonialModel | null = null;

  readonly saved = output<TestimonialModel>();
  readonly cancel = output<void>();

  private readonly service = inject(TestimonialService);

  saving = signal(false);
  error = signal<string | null>(null);
  form = signal<CreateTestimonialPayload>(emptyTestimonialForm());

  get isEdit(): boolean {
    return !!this.testimonial;
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
      image: initialForm.image || '',
      is_visible: initialForm.is_visible ?? true,
      position: initialForm.position ?? 0,
    });

    if (this.testimonial) {
      const payload = testimonialToUpdatePayload(this.testimonial);
      this.form.set({
        name: payload.name || '',
        role: payload.role || '',
        content: payload.content || '',
        note: payload.note ?? 5,
        image: payload.image || '',
        is_visible: payload.is_visible ?? true,
        position: payload.position ?? 0,
      });
    }
  }

  save(): void {
    if (!this.isValid() || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);

    const observable = this.testimonial
      ? this.service.update({ id: this.testimonial.id, ...this.form() } as UpdateTestimonialPayload)
      : this.service.create(this.form());

    observable.subscribe({
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

  close(): void {
    this.cancel.emit();
  }
}
