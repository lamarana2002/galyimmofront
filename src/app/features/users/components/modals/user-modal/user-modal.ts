import {
  Component, Input, OnInit, OnDestroy, output, signal, computed, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideX, lucideSave, lucideUser, lucideMail, lucidePhone,
  lucideShield, lucideUpload, lucideLoader, lucideEye, lucideEyeOff,
  lucideMapPin, lucideAlignLeft,
} from '@ng-icons/lucide';
import { Subject, switchMap, map, of, takeUntil } from 'rxjs';

import { UserModel }             from '../../../models/user.model';
import { IRole }                 from '../../../models/role.model';
import { UserService }           from '../../../services/user.service';
import { RoleService }           from '../../../services/role.service';
import { CreateUserPayload, UpdateUserPayload } from '../../../interfaces/user-payload.interface';
import { GenreEnum }             from '../../../../../shared/enums/genre.enum';

interface UserForm {
  prenom:                string;
  nom:                   string;
  login:                 string;
  email:                 string;
  telephone:             string;
  genre:                 string;
  pays:                  string;
  ville:                 string;
  adresse:               string;
  description:           string;
  password:              string;
  password_confirmation: string;
  avatar?:               File;
  selectedRoles:         string[];
}

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  templateUrl: './user-modal.html',
  viewProviders: [provideIcons({
    lucideX, lucideSave, lucideUser, lucideMail, lucidePhone,
    lucideShield, lucideUpload, lucideLoader, lucideEye, lucideEyeOff,
    lucideMapPin, lucideAlignLeft,
  })],
})
export class UserModal implements OnInit, OnDestroy {
  @Input() user: UserModel | null = null;

  readonly saved  = output<UserModel>();
  readonly cancel = output<void>();

  private readonly userService  = inject(UserService);
  private readonly roleService  = inject(RoleService);
  private readonly destroy$     = new Subject<void>();

  // ── État ──────────────────────────────────────────────────────
  saving         = signal(false);
  error          = signal<string | null>(null);
  availableRoles = signal<IRole[]>([]);
  avatarPreview  = signal<string | null>(null);
  showPassword   = signal(false);

  // ── Formulaire ────────────────────────────────────────────────
  form = signal<UserForm>({
    prenom: '', nom: '', login: '', email: '', telephone: '',
    genre: '', pays: '', ville: '', adresse: '', description: '',
    password: '', password_confirmation: '',
    selectedRoles: [],
  });

  // ── Options ───────────────────────────────────────────────────
  readonly genreOptions = [
    { value: GenreEnum.MALE,   label: 'Homme' },
    { value: GenreEnum.FEMALE, label: 'Femme' },
  ];

  // ── Computed ──────────────────────────────────────────────────
  isEdit = computed(() => !!this.user);
  title  = computed(() => this.isEdit() ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur');

  isValid = computed(() => {
    const f = this.form();
    const hasRequiredFields = !!(f.prenom.trim() && f.nom.trim() && f.login.trim() && f.email.trim() && f.telephone.trim());
    const passwordOk = this.isEdit()
      ? (!f.password || (f.password.length >= 6 && f.password === f.password_confirmation))
      : (f.password.length >= 6 && f.password === f.password_confirmation);
    return hasRequiredFields && passwordOk;
  });

  get initials(): string {
    const f = this.form();
    return `${f.prenom?.[0] ?? ''}${f.nom?.[0] ?? ''}`.toUpperCase() || '?';
  }

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadRoles();
    if (this.user) {
      this.form.set({
        prenom:       this.user.prenom ?? '',
        nom:          this.user.nom ?? '',
        login:        this.user.login ?? '',
        email:        this.user.email ?? '',
        telephone:    this.user.telephone ?? '',
        genre:        this.user.genre ?? '',
        pays:         this.user.pays ?? '',
        ville:        this.user.ville ?? '',
        adresse:      this.user.adresse ?? '',
        description:  this.user.description ?? '',
        password:     '',
        password_confirmation: '',
        selectedRoles: (this.user as any).roles?.map((r: IRole) => r.name) ?? [],
      });
      if (this.user.avatar) this.avatarPreview.set(this.user.avatar);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement rôles ──────────────────────────────────────────
  loadRoles(): void {
    this.roleService.findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => this.availableRoles.set(r.data), error: () => {} });
  }

  // ── Avatar ────────────────────────────────────────────────────
  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
    this.form.update(f => ({ ...f, avatar: file }));
  }

  // ── Rôles ─────────────────────────────────────────────────────
  toggleRole(name: string): void {
    this.form.update(f => {
      const roles = f.selectedRoles.includes(name)
        ? f.selectedRoles.filter(r => r !== name)
        : [...f.selectedRoles, name];
      return { ...f, selectedRoles: roles };
    });
  }

  // ── Setters ngModel ───────────────────────────────────────────
  set(field: keyof UserForm, value: any): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  // ── Sauvegarde ────────────────────────────────────────────────
  save(): void {
    if (!this.isValid() || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);

    const f = this.form();

    if (this.user) {
      const payload: UpdateUserPayload = {
        id:         this.user.id,
        prenom:     f.prenom, nom: f.nom,
        login:      f.login, email: f.email,
        telephone:  f.telephone, genre: f.genre,
        pays:       f.pays, ville: f.ville,
        adresse:    f.adresse, description: f.description,
      };
      if (f.password) {
        payload.password = f.password;
        payload.password_confirmation = f.password_confirmation;
      }
      if (f.avatar instanceof File) payload.avatar = f.avatar;

      this.userService.update(payload).pipe(
        switchMap(res =>
          this.userService.syncRoles(this.user!.id, { roles: f.selectedRoles }).pipe(
            map(() => res)
          )
        ),
        takeUntil(this.destroy$)
      ).subscribe({
        next:  res => { this.saving.set(false); this.saved.emit(res.data); },
        error: err => { this.saving.set(false); this.error.set(err?.error?.message ?? 'Erreur lors de la mise à jour.'); },
      });

    } else {
      const payload: CreateUserPayload = {
        prenom: f.prenom, nom: f.nom,
        login: f.login, email: f.email,
        telephone: f.telephone, genre: f.genre,
        pays: f.pays, ville: f.ville,
        adresse: f.adresse, description: f.description,
        password: f.password,
        password_confirmation: f.password_confirmation,
        roles: f.selectedRoles,
      };
      if (f.avatar instanceof File) payload.avatar = f.avatar;

      this.userService.create(payload).pipe(takeUntil(this.destroy$)).subscribe({
        next:  res => { this.saving.set(false); this.saved.emit(res.data); },
        error: err => { this.saving.set(false); this.error.set(err?.error?.message ?? 'Erreur lors de la création.'); },
      });
    }
  }

  close(): void { this.cancel.emit(); }
}
