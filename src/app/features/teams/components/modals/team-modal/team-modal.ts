import { Component, Input, OnInit, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideX, lucideSave, lucideUpload, lucideLoader } from '@ng-icons/lucide';
import { TeamModel } from '../../../models/team.model';
import { TeamService } from '../../../services/team.service';
import {
  CreateTeamPayload,
  UpdateTeamPayload,
  emptyTeamForm,
  teamToUpdatePayload,
} from '../../../interfaces/team-payload.interface';

@Component({
  selector: 'app-team-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  templateUrl: './team-modal.html',
  styleUrl: './team-modal.css',
  viewProviders: [provideIcons({ lucideX, lucideSave, lucideUpload, lucideLoader })],
})
export class TeamModal implements OnInit {
  @Input() team: TeamModel | null = null;

  readonly saved = output<TeamModel>();
  readonly cancel = output<void>();

  private readonly service = inject(TeamService);

  saving = signal(false);
  error = signal<string | null>(null);
  imagePreview = signal<string | null>(null);
  form = signal<CreateTeamPayload>(emptyTeamForm());

  isEdit = computed(() => !!this.team);
  title = computed(() => (this.isEdit() ? 'Modifier le membre' : 'Ajouter un membre'));
  isValid = computed(() => {
    const form = this.form();
    return form && (form.name || '').trim() !== '';
  });

  ngOnInit(): void {
    this.error.set(null);
    this.saving.set(false);
    this.imagePreview.set(null);

    // Toujours initialiser avec un formulaire vide valide
    const initialForm = emptyTeamForm();
    this.form.set({
      name: initialForm.name || '',
      role: initialForm.role || '',
      description: initialForm.description || '',
      image: initialForm.image,
      is_public: initialForm.is_public ?? true,
      sort_order: initialForm.sort_order ?? 0,
    });

    if (this.team) {
      const payload = teamToUpdatePayload(this.team);
      this.form.set({
        name: payload.name || '',
        role: payload.role || '',
        description: payload.description || '',
        image: undefined,
        is_public: payload.is_public ?? true,
        sort_order: payload.sort_order ?? 0,
      });

      if (this.team.image) {
        this.imagePreview.set(this.team.image);
      }
    }
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);

    this.form.update((form) => ({ ...form, image: file }));
  }

  save(): void {
    if (!this.isValid() || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);

    const observable = this.team
      ? this.service.update({ id: this.team.id, ...this.form() } as UpdateTeamPayload)
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

  get imageLabel(): string {
    return this.imagePreview() ? 'Modifier l’image' : 'Ajouter une image';
  }
}
