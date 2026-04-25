import { Component, computed, inject, input, OnInit, OnDestroy, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  lucideLayoutGrid,
  lucideLayers,
  lucideBanknote,
  lucideImage,
  lucidePencil,
  lucidePlus,
  lucideX,
  lucideSave,
  lucideCheckSquare,
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
import { PropertyTypeModel } from '../../../../models/propety-type.model';

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
      lucideImage,
      lucidePencil,
      lucidePlus,
      lucideX,
      lucideSave,
      lucideCheckSquare,
      lucideInfo
    })
  ]
})
export class UnitFormModal implements OnInit, OnDestroy {
  private propertyTypeService = inject(PropertyTypeService);
  private readonly destroy$ = new Subject<void>();

  // Inputs
  editingUnit = input<ILocationUnit | null>(null);
  propertyId = input<number>(0);

  // Outputs
  close = output<void>();
  saveUnit = output<CreateUnitPayload | UpdateUnitPayload>();

  readonly PropertyStatus = PropertyStatusEnum;

  // Signal interne pour le formulaire
  private _unitForm = signal<CreateUnitPayload | UpdateUnitPayload>(emptyUnitForm(0));
  isSaving = signal(false);
  propertyTypes = signal<PropertyTypeModel[]>([]);

  // Computed (lecture seule) pour le template HTML
  unitForm = this._unitForm.asReadonly();

  modalTitle = computed(() =>
    this.editingUnit() ? "Modifier l'unité" : "Ajouter une unité"
  );

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
    } else {
      this._unitForm.set(emptyUnitForm(this.propertyId()));
    }
  }
  
  updateForm(field: keyof CreateUnitPayload, value: CreateUnitPayload[keyof CreateUnitPayload]): void {
    this._unitForm.update(f => ({ ...f, [field]: value }));
  }

  onModel3dSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this._unitForm.update(f => ({ ...f, model_3d: file }));
  }

  closeModal(): void {
    this.close.emit();
  }

  save(): void {
    this.isSaving.set(true);
    this.saveUnit.emit(this._unitForm());
  }
}