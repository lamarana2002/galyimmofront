import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnInit,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  lucideLayoutGrid,
  lucideLayers,
  lucideBanknote,
  lucideBox,
  lucidePencil,
  lucidePlus,
  lucideX,
  lucideSave,
  lucideCheckSquare,
  lucideChevronDown,
  lucideInfo
} from '@ng-icons/lucide';
import {
  CreateUnitPayload,
  emptyUnitForm,
  unitToUpdatePayload,
  UpdateUnitPayload,
} from '../../../../interfaces/unit-payload.interface';
import { PropertyStatusEnum } from '../../../../enums/property-status.enum';
import { ILocationUnit } from '../../../../models/location-unit.model';
import { PropertyTypeService } from '../../../../services/property-type.service';
import { PropertyTypeModel } from '../../../../models/property-type.model';

// Miroir de la règle backend : 'model_3d' => 'file|nullable|mimes:glb,gltf|max:51200'
const MODEL_3D_EXTENSIONS = ['glb', 'gltf'];
const MODEL_3D_MAX_BYTES = 51200 * 1024;

const ALL_STATUSES = [
  { value: PropertyStatusEnum.AVAILABLE, label: 'Disponible' },
  { value: PropertyStatusEnum.RENTED, label: 'Loué' },
  { value: PropertyStatusEnum.UNDER_RENOVATION, label: 'En travaux' },
  { value: PropertyStatusEnum.FOR_SALE, label: 'En vente' },
  { value: PropertyStatusEnum.SOLD, label: 'Vendu' },
];

// « Loué » et « Vendu » résultent d'un contrat / d'une vente : pas choisissables à la création
const CREATABLE_STATUSES = new Set([
  PropertyStatusEnum.AVAILABLE,
  PropertyStatusEnum.UNDER_RENOVATION,
  PropertyStatusEnum.FOR_SALE,
]);

@Component({
  selector: 'app-unit-form-modal',
  imports: [NgIcon, FormsModule],
  templateUrl: './unit-form-modal.html',
  styleUrl: './unit-form-modal.css',
  viewProviders: [
    provideIcons({
      lucideLayoutGrid,
      lucideLayers,
      lucideBanknote,
      lucideBox,
      lucidePencil,
      lucidePlus,
      lucideX,
      lucideSave,
      lucideCheckSquare,
      lucideChevronDown,
      lucideInfo
    })
  ]
})
export class UnitFormModal implements OnInit, OnDestroy {
  private propertyTypeService = inject(PropertyTypeService);
  private readonly destroy$ = new Subject<void>();
  private readonly numberInput = viewChild<ElementRef<HTMLInputElement>>('numberInput');

  // Inputs
  editingUnit = input<ILocationUnit | null>(null);
  propertyId = input<number>(0);
  isSaving = input<boolean>(false);

  // Outputs
  close = output<void>();
  saveUnit = output<CreateUnitPayload | UpdateUnitPayload>();

  // Signal interne pour le formulaire
  private _unitForm = signal<CreateUnitPayload | UpdateUnitPayload>(emptyUnitForm(0));
  propertyTypes = signal<PropertyTypeModel[]>([]);
  submitted = signal(false);
  showDetails = signal(false);
  model3dError = signal<string | null>(null);

  // Types utilisables pour une unité (ne peuvent pas eux-mêmes contenir des unités)
  unitTypeOptions = computed(() => this.propertyTypes().filter(t => !t.can_have_units));

  statusOptions = computed(() =>
    this.editingUnit() ? ALL_STATUSES : ALL_STATUSES.filter(s => CREATABLE_STATUSES.has(s.value))
  );

  // Computed (lecture seule) pour le template HTML
  unitForm = this._unitForm.asReadonly();

  modalTitle = computed(() =>
    this.editingUnit() ? "Modifier l'unité" : "Ajouter une unité"
  );

  // Le numéro n'est exigé qu'à la création (une unité auto-créée peut ne pas en avoir)
  isValid = computed(() => !!this.editingUnit() || !!this.unitForm().unit_number?.trim());
  unitNumberError = computed(() => this.submitted() && !this.isValid());

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.propertyTypeService.findAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => this.propertyTypes.set(res.data),
    });
    const editData = this.editingUnit();
    if (editData) {
      this._unitForm.set(unitToUpdatePayload(editData));
      this.showDetails.set(true);
    } else {
      this._unitForm.set(emptyUnitForm(this.propertyId()));
    }
  }

  updateForm(field: keyof CreateUnitPayload, value: CreateUnitPayload[keyof CreateUnitPayload]): void {
    this._unitForm.update(f => ({ ...f, [field]: value }));
  }

  // Champ numérique vidé → null (et non 0, qui serait une vraie valeur : étage 0, prix 0...)
  updateNumber(field: keyof CreateUnitPayload, value: number | string | null): void {
    this.updateForm(field, value === null || value === '' ? null : Number(value));
  }

  onModel3dSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.model3dError.set(null);

    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!MODEL_3D_EXTENSIONS.includes(extension)) {
        this.rejectModel3d(input, 'Format invalide : seuls les fichiers .glb et .gltf sont acceptés.');
        return;
      }
      if (file.size > MODEL_3D_MAX_BYTES) {
        this.rejectModel3d(input, 'Le fichier dépasse la taille maximale de 50 Mo.');
        return;
      }
    }

    this._unitForm.update(f => ({ ...f, model_3d: file }));
  }

  clearModel3d(input: HTMLInputElement): void {
    input.value = '';
    this.model3dError.set(null);
    this._unitForm.update(f => ({ ...f, model_3d: null }));
  }

  private rejectModel3d(input: HTMLInputElement, message: string): void {
    input.value = '';
    this.model3dError.set(message);
    this._unitForm.update(f => ({ ...f, model_3d: null }));
  }

  closeModal(): void {
    if (this.isSaving()) return;
    this.close.emit();
  }

  save(): void {
    this.submitted.set(true);
    if (!this.isValid()) {
      this.numberInput()?.nativeElement.focus();
      return;
    }
    if (this.isSaving()) return;

    const form = this._unitForm();
    this.saveUnit.emit({ ...form, unit_number: form.unit_number?.trim() || null });
  }
}
