import { Component, computed, effect, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { FormsModule, NgModel } from '@angular/forms';
import {
  CreateUnitPayload,
  emptyUnitForm,
  unitToUpdatePayload,
  UpdateUnitPayload,
} from '../../../../interfaces/unit-payload.interface';
import { PropertyStatusEnum } from '../../../../enums/property-status.enum';
import { PropertyTypeService } from '../../../../services/property-type.service';
import { LocationUnitService } from '../../../../services/location-unit.service';
import { Subject } from 'rxjs';
import { ILocationUnit } from '../../../../models/location-unit.model';

@Component({
  selector: 'app-unit-form-modal',
  imports: [NgIcon, FormsModule],
  templateUrl: './unit-form-modal.html',
  styleUrl: './unit-form-modal.css',
})
export class UnitFormModal {
  // Inputs standards (pas des signaux directement)
  @Input() editingUnit: ILocationUnit | null = null;
  @Input() propertyId = 0;
  @Input() isOpen = 0;
  
  // Outputs
  @Output() close = new EventEmitter<void>();
  @Output() saveUnit = new EventEmitter<CreateUnitPayload | UpdateUnitPayload>();
  
  readonly PropertyStatus = PropertyStatusEnum;
  
  // Signaux internes
  private _unitForm = signal<CreateUnitPayload | UpdateUnitPayload>(emptyUnitForm(0));
  isSaving = signal(false);
  
  // Computed pour le formulaire (lecture seule)
  unitForm = this._unitForm.asReadonly();
  
  // Titre calculé
  modalTitle = computed(() => 
    this.editingUnit ? "Modifier l'unité" : 'Ajouter une unité'
  );
  
  constructor() {
    // Réinitialiser le formulaire quand le modal s'ouvre ou quand editingUnit change
    effect(() => {
      if (this.isOpen) {
        if (this.editingUnit) {
          this._unitForm.set(unitToUpdatePayload(this.editingUnit));
        } else {
          this._unitForm.set(emptyUnitForm(this.propertyId));
        }
      }
    });
  }
  
  updateForm(field: string, value: any): void {
    this._unitForm.update(f => ({ ...f, [field]: value }));
  }
  
  closeModal(): void {
    this.close.emit();
  }
  
  save(): void {
    // if (!this._unitForm().unit_code?.trim()) {
    //   return;
    // }
    
    this.isSaving.set(true);
    this.saveUnit.emit(this._unitForm());
    this.isSaving.set(false);
  }
}