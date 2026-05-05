import { Component, inject, signal, computed, effect, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideUser, 
  lucideMail, 
  lucidePhone, 
  lucideMapPin, 
  lucideCamera, 
  lucideShieldCheck, 
  lucideLock,
  lucideEye,
  lucideEyeOff,
  lucideCheckCircle,
  lucideSave,
  lucideGlobe,
  lucideBuilding
} from '@ng-icons/lucide';

import { Subject, takeUntil } from 'rxjs';
import { ProfileService } from '../../../../core/auth/services/profile.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthUser } from '../../../../core/auth/interfaces/auth-user.interface';
import { UpdateProfilePayload } from '../../../../core/auth/interfaces/update-profile-payload.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  viewProviders: [
    provideIcons({
      lucideUser,
      lucideMail,
      lucidePhone,
      lucideMapPin,
      lucideCamera,
      lucideShieldCheck,
      lucideLock,
      lucideEye,
      lucideEyeOff,
      lucideCheckCircle,
      lucideSave,
      lucideGlobe,
      lucideBuilding
    }),
  ],
})
export class ProfileComponent implements OnInit, OnDestroy {
  private profileService = inject(ProfileService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  // ── Signals ─────────────────────────────────────────────────────
  currentUser = this.profileService.currentUser;
  activeTab = signal<'infos' | 'security'>('infos');
  isLoading = signal(false);
  isPasswordLoading = signal(false);

  // Profile Form state
  profileForm = signal({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    genre: 'Masculin' as 'Masculin' | 'Feminin',
    adresse: '',
    ville: '',
    pays: '',
    description: '',
  });

  // Password Form state
  passwordForm = signal({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  showPasswords = signal({
    current: false,
    new: false,
    confirm: false
  });

  // Avatar
  selectedAvatarFile = signal<File | null>(null);
  avatarPreview = signal<string | null>(null);

  constructor() {
    // Initialize form with current user data when available
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.profileForm.set({
          prenom: user.prenom || '',
          nom: user.nom || '',
          email: user.email || '',
          telephone: user.telephone || '',
          genre: user.genre || 'Masculin',
          adresse: user.adresse || '',
          ville: user.ville || '',
          pays: user.pays || '',
          description: user.description || '',
        });
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['tab']) {
        this.activeTab.set(params['tab'] as 'infos' | 'security');
      }
    });
  }

  setActiveTab(tab: 'infos' | 'security'): void {
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  // ── Handlers ──────────────────────────────────────────────────
  onAvatarSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toast.error('Le fichier doit être une image');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.toast.error('L\'image ne doit pas dépasser 2 Mo');
        return;
      }

      this.selectedAvatarFile.set(file);
      const reader = new FileReader();
      reader.onload = (e) => this.avatarPreview.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  updateProfile() {
    const payload: UpdateProfilePayload = {
      ...this.profileForm(),
      avatar: this.selectedAvatarFile()
    };

    this.isLoading.set(true);
    this.profileService.update(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.toast.success('Profil mis à jour avec succès');
          this.selectedAvatarFile.set(null);
          this.avatarPreview.set(null);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toast.error(err?.error?.message || 'Erreur lors de la mise à jour du profil');
      }
    });
  }

  updatePassword() {
    const form = this.passwordForm();
    if (form.password !== form.password_confirmation) {
      this.toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (form.password.length < 8) {
      this.toast.error('Le nouveau mot de passe doit faire au moins 8 caractères');
      return;
    }

    this.isPasswordLoading.set(true);
    this.profileService.updatePassword(form).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.isPasswordLoading.set(false);
        if (res.success) {
          this.toast.success('Mot de passe mis à jour avec succès');
          this.resetPasswordForm();
        }
      },
      error: (err) => {
        this.isPasswordLoading.set(false);
        this.toast.error(err?.error?.message || 'Le mot de passe actuel est incorrect');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  resetPasswordForm() {
    this.passwordForm.set({
      current_password: '',
      password: '',
      password_confirmation: '',
    });
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    this.showPasswords.update(s => ({ ...s, [field]: !s[field] }));
  }

  getAvatarUrl(): string {
    if (this.avatarPreview()) return this.avatarPreview()!;
    const avatar = this.currentUser()?.avatar;
    if (!avatar) return 'https://flowbite.com/docs/images/people/profile-picture-5.jpg';
    if (avatar.startsWith('http')) return avatar;
    return `/storage/${avatar}`;
  }
}
