import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  output,
  signal,
  computed,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideX,
  lucideSave,
  lucideUser,
  lucideMail,
  lucidePhone,
  lucideShield,
  lucideUpload,
  lucideLoader,
  lucideEye,
  lucideEyeOff,
  lucideMapPin,
  lucideAlignLeft,
} from '@ng-icons/lucide';
import { Subject, takeUntil } from 'rxjs';

import { UserModel } from '../../../models/user.model';
import { IRole, IPermission } from '../../../models/role.model';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';
import { CreateUserPayload, UpdateUserPayload } from '../../../interfaces/user-payload.interface';
import { GenreEnum } from '../../../../../shared/enums/genre.enum';

interface UserForm {
  prenom: string;
  nom: string;
  login: string;
  email: string;
  telephone: string;
  genre: string;
  pays: string;
  ville: string;
  adresse: string;
  description: string;
  password: string;
  password_confirmation: string;
  avatar?: File;
  selectedRoles: number[];
}

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  templateUrl: './user-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideX,
      lucideSave,
      lucideUser,
      lucideMail,
      lucidePhone,
      lucideShield,
      lucideUpload,
      lucideLoader,
      lucideEye,
      lucideEyeOff,
      lucideMapPin,
      lucideAlignLeft,
    }),
  ],
})
export class UserModal implements OnInit, OnDestroy {
  user = input<UserModel | null>(null);

  readonly saved = output<UserModel>();
  readonly cancel = output<void>();

  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly destroy$ = new Subject<void>();

  // ── État ──────────────────────────────────────────────────────
  saving = signal(false);
  error = signal<string | null>(null);
  availableRoles = signal<IRole[]>([]);
  avatarPreview = signal<string | null>(null);
  showPassword = signal(false);

  // ── Formulaire ────────────────────────────────────────────────
  form = signal<UserForm>({
    prenom: '',
    nom: '',
    login: '',
    email: '',
    telephone: '',
    genre: '',
    pays: '',
    ville: '',
    adresse: '',
    description: '',
    password: '',
    password_confirmation: '',
    selectedRoles: [],
  });

  // ── Options ───────────────────────────────────────────────────
  readonly genreOptions = [
    { value: GenreEnum.MALE, label: 'Homme' },
    { value: GenreEnum.FEMALE, label: 'Femme' },
  ];

  // ── Computed ──────────────────────────────────────────────────
  isEdit = computed(() => !!this.user());
  title = computed(() => (this.isEdit() ? "Modifier l'utilisateur" : 'Nouvel utilisateur'));

  readonly selectedPermissions = computed(() => {
    const selectedRoleIds = new Set(this.form().selectedRoles);
    const permissions = new Map<number, IPermission>();

    this.availableRoles().forEach((role) => {
      if (!selectedRoleIds.has(role.id)) {
        return;
      }
      role.permissions?.forEach((permission) => {
        permissions.set(permission.id, permission);
      });
    });

    return Array.from(permissions.values());
  });

  isValid = computed(() => {
    const f = this.form();
    const hasRequiredFields = !!(
      f.prenom.trim() &&
      f.nom.trim() &&
      f.login.trim() &&
      f.email.trim() &&
      f.telephone.trim()
    );
    const passwordOk = this.isEdit()
      ? !f.password || (f.password.length >= 6 && f.password === f.password_confirmation)
      : f.password.length >= 6 && f.password === f.password_confirmation;
    return hasRequiredFields && passwordOk;
  });

  get initials(): string {
    const f = this.form();
    return `${f.prenom?.[0] ?? ''}${f.nom?.[0] ?? ''}`.toUpperCase() || '?';
  }

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadRoles();
    const u = this.user();
    if (u) {
      this.form.set({
        prenom: u.prenom ?? '',
        nom: u.nom ?? '',
        login: u.login ?? '',
        email: u.email ?? '',
        telephone: u.telephone ?? '',
        genre: u.genre ?? '',
        pays: u.pays ?? '',
        ville: u.ville ?? '',
        adresse: u.adresse ?? '',
        description: u.description ?? '',
        password: '',
        password_confirmation: '',
        selectedRoles: (u as UserModel & { roles?: IRole[] }).roles?.map((r: IRole) => r.id) ?? [],
      });
      if (u.avatar) this.avatarPreview.set(u.avatar);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement rôles ──────────────────────────────────────────
  loadRoles(): void {
    this.roleService
      .findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (r) => {
          // Filtrer le rôle super-admin
          const filteredRoles = r.data.filter((role) => role.name !== 'super-admin');
          this.availableRoles.set(filteredRoles);
        },
        error: () => {},
      });
  }

  // ── Avatar ────────────────────────────────────────────────────
  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
    this.form.update((f) => ({ ...f, avatar: file }));
  }

  // ── Rôles ─────────────────────────────────────────────────────
  toggleRole(roleId: number): void {
    this.form.update((f) => {
      const roles = f.selectedRoles.includes(roleId)
        ? f.selectedRoles.filter((r) => r !== roleId)
        : [...f.selectedRoles, roleId];
      return { ...f, selectedRoles: roles };
    });
  }

  // ── Setters ngModel ───────────────────────────────────────────
  set(field: keyof UserForm, value: UserForm[keyof UserForm]): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  // ── Sauvegarde ────────────────────────────────────────────────
  save(): void {
    if (!this.isValid() || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);

    const f = this.form();

    const u = this.user();
    if (u) {
      const payload: UpdateUserPayload = {
        id: u.id,
        prenom: f.prenom,
        nom: f.nom,
        login: f.login,
        email: f.email,
        telephone: f.telephone,
        genre: f.genre,
        pays: f.pays,
        ville: f.ville,
        adresse: f.adresse,
        description: f.description,
        roles: f.selectedRoles,
      };
      if (f.password) {
        payload.password = f.password;
        payload.password_confirmation = f.password_confirmation;
      }
      if (f.avatar instanceof File) payload.avatar = f.avatar;

      this.userService
        .update(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.saving.set(false);
            this.saved.emit(res.data);
          },
          error: (err) => {
            this.saving.set(false);
            this.error.set(err?.error?.message ?? 'Erreur lors de la mise à jour.');
          },
        });
    } else {
      const payload: CreateUserPayload = {
        prenom: f.prenom,
        nom: f.nom,
        login: f.login,
        email: f.email,
        telephone: f.telephone,
        genre: f.genre,
        pays: f.pays,
        ville: f.ville,
        adresse: f.adresse,
        description: f.description,
        password: f.password,
        password_confirmation: f.password_confirmation,
        roles: f.selectedRoles,
      };
      if (f.avatar instanceof File) payload.avatar = f.avatar;

      this.userService
        .create(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.saving.set(false);
            this.saved.emit(res.data);
          },
          error: (err) => {
            this.saving.set(false);
            this.error.set(err?.error?.message ?? 'Erreur lors de la création.');
          },
        });
    }
  }

  close(): void {
    this.cancel.emit();
  }
}
