import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
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
export class UnitFormModal implements OnInit {
  // Inputs modernes
  editingUnit = input<ILocationUnit | null>(null);
  propertyId = input<number>(0);
  
  // Outputs
  close = output<void>();
  saveUnit = output<CreateUnitPayload | UpdateUnitPayload>();
  
  readonly PropertyStatus = PropertyStatusEnum;
  
  // Signal interne pour le formulaire
  private _unitForm = signal<CreateUnitPayload | UpdateUnitPayload>(emptyUnitForm(0));
  isSaving = signal(false);
  
  // Computed (lecture seule) pour le template HTML
  unitForm = this._unitForm.asReadonly();
  
  modalTitle = computed(() => 
    this.editingUnit() ? "Modifier l'unité" : "Ajouter une unité"
  );
  
  ngOnInit(): void {    
    const editData = this.editingUnit();
    if (editData) {
      this._unitForm.set(unitToUpdatePayload(editData));
    } else {
      this._unitForm.set(emptyUnitForm(this.propertyId()));
    }
  }
  
  updateForm(field: keyof CreateUnitPayload, value: any): void {
    this._unitForm.update(f => ({ ...f, [field]: value }));
  }
  
  closeModal(): void {
    this.close.emit();
  }
  
  save(): void {
    this.isSaving.set(true);
    this.saveUnit.emit(this._unitForm());
  }
}