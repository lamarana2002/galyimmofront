import {
  Component, inject, input, output, signal, computed, OnInit, OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideX, lucideSave, lucideUser, lucideSearch, lucidePlus,
  lucideLoader,
} from '@ng-icons/lucide';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { ILocationUnit } from '../../../models/location-unit.model';
import { ILocataire }    from '../../../../locataires/models/locataire.model';
import { LocationService } from '../../../services/location.service';
import { LocataireService } from '../../../../locataires/services/locataire.service';
import { LocataireModal }   from '../../../../locataires/components/modals/locataire-modal/locataire-modal';
import { CreateLocationPayload } from '../../../interfaces/create-location-payload.interface';

interface LocationForm {
  locataire:       ILocataire | null;
  interval:        number;
  montant:         number | null;
  methodePayement: string;
  date:            string;
  description:     string;
}

@Component({
  selector: 'app-create-location-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, LocataireModal],
  templateUrl: './create-location-modal.html',
  viewProviders: [
    provideIcons({
      lucideX, lucideSave, lucideUser, lucideSearch, lucidePlus,
      lucideLoader,
    }),
  ],
})
export class CreateLocationModal implements OnInit, OnDestroy {
  private readonly locationService  = inject(LocationService);
  private readonly locataireService = inject(LocataireService);
  private readonly destroy$         = new Subject<void>();
  private readonly search$          = new Subject<string>();

  // ── Inputs ────────────────────────────────────────────────────
  unit = input.required<ILocationUnit>();

  // ── Outputs ───────────────────────────────────────────────────
  readonly closed        = output<void>();
  readonly saved         = output<void>();
  readonly locationError = output<string>();

  // ── État ──────────────────────────────────────────────────────
  saving         = signal(false);
  loadingTenants = signal(false);
  tenants        = signal<ILocataire[]>([]);
  searchQuery    = signal('');
  showDropdown   = signal(false);
  showNewTenant  = signal(false);

  // ── Formulaire ────────────────────────────────────────────────
  form = signal<LocationForm>({
    locataire:       null,
    interval:        1,
    montant:         null,
    methodePayement: '',
    date:            new Date().toISOString().split('T')[0],
    description:     '',
  });

  // ── Options ───────────────────────────────────────────────────
  readonly intervalOptions = [
    { value: 1,  label: 'Mensuel (1 mois)'     },
    { value: 3,  label: 'Trimestriel (3 mois)' },
    { value: 6,  label: 'Semestriel (6 mois)'  },
    { value: 12, label: 'Annuel (12 mois)'      },
  ];

  readonly paymentOptions = [
    { value: 'especes',       label: 'Espèces'       },
    { value: 'virement',      label: 'Virement bancaire' },
    { value: 'orange_money',  label: 'Orange Money'  },
    { value: 'cheque',        label: 'Chèque'        },
    { value: 'mobile_money',  label: 'Mobile Money'  },
  ];

  // ── Validation ────────────────────────────────────────────────
  isValid = computed(() => {
    const f = this.form();
    return !!(
      f.locataire &&
      f.interval &&
      f.methodePayement &&
      f.date
    );
  });

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    // Pré-remplir le montant depuis l'unité
    this.form.update(f => ({
      ...f,
      montant: this.unit().rent_amount ?? null,
    }));

    // Debounce sur la recherche locataire
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(q => this.fetchTenants(q));

    // Charger la liste initiale
    this.fetchTenants('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Recherche locataires ──────────────────────────────────────
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.search$.next(value);
  }

  fetchTenants(search: string): void {
    this.loadingTenants.set(true);
    this.locataireService
      .findAll({ search, perPage: 20 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  r => { this.tenants.set(r.data); this.loadingTenants.set(false); },
        error: () => this.loadingTenants.set(false),
      });
  }

  selectTenant(t: ILocataire): void {
    this.form.update(f => ({ ...f, locataire: t }));
    this.showDropdown.set(false);
    this.searchQuery.set('');
  }

  clearTenant(): void {
    this.form.update(f => ({ ...f, locataire: null }));
  }

  getInitials(t: ILocataire): string {
    return `${t.prenom?.[0] ?? ''}${t.nom?.[0] ?? ''}`.toUpperCase();
  }

  // ── Nouveau locataire ─────────────────────────────────────────
  openNewTenant(): void {
    this.showDropdown.set(false);
    this.showNewTenant.set(true);
  }

  onTenantCreated(t: ILocataire): void {
    this.showNewTenant.set(false);
    this.selectTenant(t);
    // Rafraîchir la liste
    this.fetchTenants('');
  }


  // ── Patcheurs ngModel ─────────────────────────────────────────
  setInterval(v: string):        void { this.form.update(f => ({ ...f, interval: +v })); }
  setMontant(v: number):         void { this.form.update(f => ({ ...f, montant: v })); }
  setMethode(v: string):         void { this.form.update(f => ({ ...f, methodePayement: v })); }
  setDate(v: string):            void { this.form.update(f => ({ ...f, date: v })); }
  setDescription(v: string):     void { this.form.update(f => ({ ...f, description: v })); }

  // ── Soumission ────────────────────────────────────────────────
  submit(): void {
    if (!this.isValid() || this.saving()) return;

    const f = this.form();
    const u = this.unit();

    const payload: CreateLocationPayload = {
      locataire_id:       f.locataire!.id,
      unite_locations_id: u.id,
      interval:           f.interval,
      methode_payement:   f.methodePayement,
      date_location:      f.date,
      description:        f.description || undefined,
    };

    this.saving.set(true);
    this.locationService
      .create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  () => { this.saving.set(false); this.saved.emit(); },
        error: (err) => {
          this.saving.set(false);
          this.locationError.emit(err?.error?.message ?? 'Erreur lors de la création de la location.');
        },
      });
  }

  close(): void {
    this.closed.emit();
  }
}
