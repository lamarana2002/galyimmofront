import {
  Component, OnInit, OnDestroy, signal, inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2, lucideSave, lucideLoader, lucideUpload,
  lucideGlobe, lucideFacebook, lucideAlignLeft, lucideImage,
} from '@ng-icons/lucide';
import { Subject, takeUntil } from 'rxjs';

import { StructureService }         from '../../../../structures/services/structure.service';
import { StructureModel }           from '../../../../structures/models/structure.model';
import { ProfileService }           from '../../../../../core/auth/services/profile.service';
import { ToastService }             from '../../../../../shared/services/toast.service';
import { UpdateStructurePayload }   from '../../../../structures/interfaces/update-structure-payload.interface';

interface AgenceForm {
  name:        string;
  description: string;
  facebook:    string;
  web_site:    string;
  logo?:       File;
  cover?:      File;
}

@Component({
  selector: 'app-agence-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  templateUrl: './agence-tab.html',
  viewProviders: [provideIcons({
    lucideBuilding2, lucideSave, lucideLoader, lucideUpload,
    lucideGlobe, lucideFacebook, lucideAlignLeft, lucideImage,
  })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgenceTab implements OnInit, OnDestroy {
  private readonly structureService = inject(StructureService);
  private readonly profile          = inject(ProfileService);
  private readonly toast            = inject(ToastService);
  private readonly destroy$         = new Subject<void>();

  // ── État ──────────────────────────────────────────────────────
  loading   = signal(true);
  saving    = signal(false);
  structure = signal<StructureModel | null>(null);

  // ── Previews ──────────────────────────────────────────────────
  logoPreview  = signal<string | null>(null);
  coverPreview = signal<string | null>(null);

  // ── Formulaire ────────────────────────────────────────────────
  form = signal<AgenceForm>({
    name:        '',
    description: '',
    facebook:    '',
    web_site:    '',
  });

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    const structureId = this.profile.userStructure;
    if (!structureId) {
      this.loading.set(false);
      return;
    }
    this.structureService.findById(structureId).pipe(takeUntil(this.destroy$)).subscribe({
      next: r => {
        this.structure.set(r.data);
        this.form.set({
          name:        r.data.name ?? '',
          description: r.data.description ?? '',
          facebook:    r.data.facebook ?? '',
          web_site:    r.data.web_site ?? '',
        });
        this.logoPreview.set(r.data.logo ?? null);
        this.coverPreview.set(r.data.cover ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Fichiers ──────────────────────────────────────────────────
  onLogoSelected(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => this.logoPreview.set(ev.target?.result as string);
    reader.readAsDataURL(file);
    this.form.update(f => ({ ...f, logo: file }));
  }

  onCoverSelected(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => this.coverPreview.set(ev.target?.result as string);
    reader.readAsDataURL(file);
    this.form.update(f => ({ ...f, cover: file }));
  }

  // ── Setters ───────────────────────────────────────────────────
  set(field: keyof AgenceForm, value: AgenceForm[keyof AgenceForm]): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  // ── Sauvegarde ────────────────────────────────────────────────
  save(): void {
    const s = this.structure();
    if (!s || this.saving()) return;

    this.saving.set(true);
    const f = this.form();
    const payload: UpdateStructurePayload = {
      id:          s.id,
      name:        f.name,
      description: f.description,
      facebook:    f.facebook,
      web_site:    f.web_site,
    };
    if (f.logo instanceof File)  payload.logo  = f.logo;
    if (f.cover instanceof File) payload.cover = f.cover;

    this.structureService.update(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: r => {
        this.saving.set(false);
        this.structure.set(r.data);
        this.toast.success('Informations de l\'agence mises à jour.');
      },
      error: err => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Erreur lors de la mise à jour.');
      },
    });
  }
}
