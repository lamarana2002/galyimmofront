import { Component, computed, inject, input, OnInit, OnDestroy, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import {
  lucideBuilding2,
  lucideInfo,
  lucideImage,
  lucideGlobe,
  lucideSave,
  lucideX,
  lucideCheckSquare,
  lucideFacebook,
  lucidePencil,
  lucidePlus,
  lucideUser
} from '@ng-icons/lucide';
import { StructureModel } from '../../../models/structure.model';
import { StructurePlanType } from '../../../enums/structure-plan-type.enum';
import { CreateStructurePayload } from '../../../interfaces/create-structure-payload.interface';
import { UpdateStructurePayload } from '../../../interfaces/update-structure-payload.interface';
import { ToastService } from '../../../../../shared/services/toast.service';
import { Subject, finalize, takeUntil } from 'rxjs';
import { StructureService } from '../../../services/structure.service';

@Component({
  selector: 'app-add-structure-modal',
  imports: [NgIcon, FormsModule],
  templateUrl: './add-structure-modal.html',
  styleUrl: './add-structure-modal.css',
  viewProviders: [
    provideIcons({
      lucideBuilding2,
      lucideInfo,
      lucideImage,
      lucideGlobe,
      lucideSave,
      lucideX,
      lucideCheckSquare,
      lucideFacebook,
      lucidePencil,
      lucidePlus,
      lucideUser
    }),
  ],
})
export class AddStructureModal implements OnInit, OnDestroy {
  private structureService = inject(StructureService);
  private toast = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  // Inputs
  editingStructure = input<StructureModel | null>(null);

  // Outputs
  closed = output<void>();
  saved = output<StructureModel>();

  // Enum
  readonly StructurePlanType = StructurePlanType;

  // Signaux
  isSaving = signal(false);
  errors: Record<string, string> = {};

  // Formulaire local
  form = signal<{
    name: string;
    plan: StructurePlanType;
    description: string;
    facebook: string;
    web_site: string;
    logo: File | null;
    logo_preview: string | null;
    cover: File | null;
    cover_preview: string | null;
  }>({
    name: '',
    plan: StructurePlanType.FREEMIUM,
    description: '',
    facebook: '',
    web_site: '',
    logo: null,
    logo_preview: null,
    cover: null,
    cover_preview: null,
  });

  modalTitle = computed(() =>
    this.editingStructure() ? 'Modifier la structure' : 'Créer une structure'
  );

  ngOnInit(): void {
    const editData = this.editingStructure();
    if (editData) {
      this.form.set({
        name: editData.name || '',
        plan: editData.plan || StructurePlanType.FREEMIUM,
        description: editData.description || '',
        facebook: editData.facebook || '',
        web_site: editData.web_site || '',
        logo: null,
        logo_preview: editData.logo,
        cover: null,
        cover_preview: editData.cover,
      });
    }
  }

  onFileSelected(event: Event, field: 'logo' | 'cover'): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.update((f) => ({ ...f, [field]: file }));

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.form.update((f) => ({
          ...f,
          [`${field}_preview`]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  validate(): boolean {
    this.errors = {};
    const f = this.form();

    if (!f.name?.trim()) {
      this.errors['name'] = 'Le nom de la structure est requis';
    }
    if (!f.plan) {
      this.errors['plan'] = 'Le type de plan est requis';
    }

    return Object.keys(this.errors).length === 0;
  }

  save(): void {
    if (!this.validate()) return;

    this.isSaving.set(true);
    const f = this.form();
    const isEdit = !!this.editingStructure();

    const payload: Partial<CreateStructurePayload> = {
      name: f.name,
      plan: f.plan,
      description: f.description,
      facebook: f.facebook,
      web_site: f.web_site,
    };

    if (f.logo instanceof File) payload.logo = f.logo;
    if (f.cover instanceof File) payload.cover = f.cover;

    const req$ = isEdit
      ? this.structureService.update({ id: this.editingStructure()!.id, ...payload } as UpdateStructurePayload)
      : this.structureService.create(payload as CreateStructurePayload);

    req$.pipe(takeUntil(this.destroy$), finalize(() => this.isSaving.set(false))).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success(
            isEdit ? 'Structure mise à jour avec succès.' : 'Structure créée avec succès.'
          );
          this.saved.emit(res.data!);
          this.closeModal();
        }
      },
      error: (err) => {
        if (err.error?.errors) {
          this.errors = err.error.errors;
        }
        this.toast.error(err?.error?.message ?? 'Erreur lors de la sauvegarde.');
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeModal(): void {
    this.closed.emit();
  }
}
