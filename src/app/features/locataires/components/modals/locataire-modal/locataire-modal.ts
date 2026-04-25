import { Component, Input, OnInit, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideX,
  lucideSave,
  lucideUser,
  lucideMail,
  lucidePhone,
  lucideAlignLeft,
  lucideUpload,
  lucideLoader,
} from '@ng-icons/lucide';
import { Subject, takeUntil } from 'rxjs';
import { ILocataire } from '../../../models/locataire.model';
import { LocataireService } from '../../../services/locataire.service';
import {
  CreateLocatairePayload,
  emptyLocataireForm,
  locataireToUpdatePayload,
  UpdateLocatairePayload,
} from '../../../interfaces/locataire-payload.interface';
import { GenreEnum } from '../../../../../shared/enums/genre.enum';

@Component({
  selector: 'app-locataire-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  templateUrl: './locataire-modal.html',
  viewProviders: [
    provideIcons({
      lucideX,
      lucideSave,
      lucideUser,
      lucideMail,
      lucidePhone,
      lucideAlignLeft,
      lucideUpload,
      lucideLoader,
    }),
  ],
})
export class LocataireModal implements OnInit {
  // null = création, ILocataire = modification
  @Input() locataire: ILocataire | null = null;

  // Emis après sauvegarde réussie — renvoie le locataire créé/modifié
  // Utile pour pré-sélectionner le locataire dans le formulaire de location
  readonly saved = output<ILocataire>();
  readonly cancel = output<void>();

  private readonly service = inject(LocataireService);
  private readonly destroy$ = new Subject<void>();

  // ── État ──────────────────────────────────────────────────────
  saving = signal(false);
  error = signal<string | null>(null);
  imagePreview = signal<string | null>(null);

  // ── Genre Enum ─────────────────────────────────────────────────
  genreOptions = [
    { value: GenreEnum.MALE, label: GenreEnum.MALE },
    { value: GenreEnum.FEMALE, label: GenreEnum.FEMALE },
  ];

  // ── Formulaire ────────────────────────────────────────────────
  form = signal<CreateLocatairePayload>(emptyLocataireForm());

  // ── Computed ──────────────────────────────────────────────────
  isEdit = computed(() => !!this.locataire);

  title = computed(() => (this.isEdit() ? 'Modifier le locataire' : 'Ajouter un locataire'));

  // Validation simple — champs obligatoires
  isValid = computed(() => {
    const f = this.form();
    return (
      (f.nom || '').trim() !== '' &&
      (f.prenom || '').trim() !== '' &&
      (f.sexe || '').trim() !== '' &&
      (f.telephone || '').trim() !== '' &&
      (f.email || '').trim() !== '' &&
      (this.isEdit() || (f.description || '').trim() !== '') // description requis seulement en création
    );
  });

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    // Réinitialiser l'état complètement
    this.saving.set(false);
    this.error.set(null);
    this.imagePreview.set(null);
    this.form.set(emptyLocataireForm());

    if (this.locataire) {
      // Mode édition — pré-remplir le formulaire
      const payload = locataireToUpdatePayload(this.locataire);
      this.form.set({
        nom: payload.nom || '',
        prenom: payload.prenom || '',
        sexe: payload.sexe || '',
        telephone: payload.telephone || '',
        email: payload.email || '',
        description: payload.description || '',
        image: undefined,
      });

      // Afficher l'image actuelle
      if (this.locataire.image) {
        this.imagePreview.set(this.locataire.image);
      }
    }
  }

  // ── Actions ───────────────────────────────────────────────────
  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Preview immédiat
    const reader = new FileReader();
    reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);

    // Stocker le fichier dans le formulaire
    this.form.update((f) => ({ ...f, image: file }));
  }

  save(): void {
    if (!this.isValid() || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);

    const obs$ = this.locataire
      ? this.service.update({ id: this.locataire.id, ...this.form() } as UpdateLocatairePayload)
      : this.service.create(this.form());

    obs$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.saving.set(false);
        this.saved.emit(response.data);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(
          err?.error?.message ??
            (this.isEdit() ? 'Erreur lors de la modification.' : 'Erreur lors de la création.'),
        );
      },
    });
  }

  close(): void {
    this.cancel.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Helper pour les initiales dans l'avatar placeholder
  get initials(): string {
    const f = this.form();
    return `${f.prenom?.[0] ?? ''}${f.nom?.[0] ?? ''}`.toUpperCase() || '?';
  }
}
