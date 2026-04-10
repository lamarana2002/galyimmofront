import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, RegisterFiles } from '../../services/auth.service';
import { RegisterPayload, StructurePayload, UserPayload } from '../../interfaces/register-payload.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
})
export class RegisterComponent {
  sub: Subscription = new Subscription()
  currentStep = 1;
  submitted = false;
  loading = false;
  errorMessage = '';

  // ── Étape 1 : Infos perso + localisation ──────────────────────
  step1 = {
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    login: '',
    genre: '',
    description: '',
    pays: 'Guinée',
    ville: '',
    adresse: '',
  };

  // ── Étape 2 : Structure ───────────────────────────────────────
  step2 = {
    structure_name: '',
    plan: 'freemium' as 'freemium' | 'premium',
    web_site: '',
    facebook: '',
    structure_description: '',
  };

  // ── Étape 3 : Sécurité ────────────────────────────────────────
  step3 = {
    password: '',
    password_confirmation: '',
    newsletter: false,
    accept_terms: false,
  };

  // ── Fichiers ──────────────────────────────────────────────────
  files: RegisterFiles = {};
  avatarPreview: string | null = null;
  coverPreview: string | null = null;

  // ── UI state ──────────────────────────────────────────────────
  showPassword = false;
  showConfirm = false;

  genres = ['Masculin', 'Feminin'];
  pays = [
    'Guinée',
    "Côte d'Ivoire",
    'Sénégal',
    'Mali',
    'Burkina Faso',
    'Cameroun',
    'Maroc',
    'France',
  ];

  constructor(private authService: AuthService) {}

  // ── Navigation ────────────────────────────────────────────────
  nextStep(): void {
    this.submitted = true;
    if (!this.isCurrentStepValid()) return;
    this.submitted = false;
    this.errorMessage = '';
    this.currentStep++;
  }

  prevStep(): void {
    this.submitted = false;
    this.errorMessage = '';
    this.currentStep--;
  }

  // ── Validation par étape ──────────────────────────────────────
  isCurrentStepValid(): boolean {
    if (this.currentStep === 1) {
      return !!(
        this.step1.prenom &&
        this.step1.nom &&
        this.step1.email &&
        this.step1.telephone &&
        this.step1.login &&
        this.step1.genre &&
        this.step1.pays &&
        this.step1.ville &&
        this.step1.adresse
      );
    }
    if (this.currentStep === 2) {
      return !!(this.step2.structure_name && this.step2.plan);
    }
    if (this.currentStep === 3) {
      return !!(this.step3.password && this.passwordMatch && this.step3.accept_terms);
    }
    return true;
  }

  isStepDone(step: number): boolean {
    return this.currentStep > step;
  }

  // ── Computed ──────────────────────────────────────────────────
  get passwordMatch(): boolean {
    return this.step3.password === this.step3.password_confirmation;
  }

  get passwordStrength(): 'weak' | 'medium' | 'strong' {
    const p = this.step3.password;
    if (!p || p.length < 6) return 'weak';
    if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p)) return 'medium';
    return 'strong';
  }

  get strengthLabel(): string {
    return { weak: 'Faible', medium: 'Moyen', strong: 'Fort' }[this.passwordStrength];
  }

  get strengthClass(): string {
    return { weak: 'text-red-500', medium: 'text-amber-600', strong: 'text-green-600' }[
      this.passwordStrength
    ];
  }

  // ── Upload fichiers ───────────────────────────────────────────
  onAvatarSelected(e: Event): void {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.files.avatar = f;
    const r = new FileReader();
    r.onload = (ev) => (this.avatarPreview = ev.target?.result as string);
    r.readAsDataURL(f);
  }

  onCoverSelected(e: Event): void {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.files.cover = f;
    const r = new FileReader();
    r.onload = (ev) => (this.coverPreview = ev.target?.result as string);
    r.readAsDataURL(f);
  }

  buildStructurePaload(): StructurePayload {
    return {
      name: this.step2.structure_name,
      cover:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOsOqPoXPjcj2uSzRZi3PnczyYCp3Wen5NNA&s',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyjTZDxx36w2M0mFU9R6xXEhTnSDC0VrijSw&s',
      plan: this.step2.plan,
      web_site: this.step2.web_site,
      facebook: this.step2.facebook,
      description: this.step2.structure_description,
    };
  }
  buildUserPayload(): UserPayload{
    return {
      ...this.step1,
      password: this.step3.password,
      password_confirmation: this.step3.password_confirmation
    }
  }

  // ── Submit final ──────────────────────────────────────────────
  submit(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (!this.isCurrentStepValid()) return;

    const payload: RegisterPayload = {
      structure: this.buildStructurePaload(),
      user: this.buildUserPayload(),
    };

    this.loading = true;
    this.sub = this.authService.register(payload, this.files).subscribe({
      error: (err) => {
        this.loading = false;
        const errors = err?.error?.errors;
        if (errors) {
          const firstKey = Object.keys(errors)[0];
          this.errorMessage = errors[firstKey][0];
        } else {
          this.errorMessage = err?.error?.message ?? 'Une erreur est survenue.';
        }
      },
    });
  }
}
