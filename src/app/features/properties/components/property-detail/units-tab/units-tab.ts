import { Component, Input, output, ChangeDetectionStrategy } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import {
  getUnitStatusBadgeClass,
  getUnitStatusDotClass,
  getUnitStatusLabel,
} from '../../../utils/property.utils';
import { PropertyModel } from '../../../models/property.model';
import { ILocationUnit } from '../../../models/location-unit.model';

@Component({
  selector: 'app-units-tab',
  imports: [NgIcon, RouterLink, DecimalPipe],
  templateUrl: './units-tab.html',
  styleUrl: './units-tab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitsTab {
  addUnit = output<void>();
  editUnit = output<ILocationUnit>();
  deleteUnit = output<ILocationUnit>();
  @Input({ required: true }) bien!: PropertyModel;
  openAddUnit() {
    this.addUnit.emit();
  }
  openEditUnit(unit: ILocationUnit) {
    this.editUnit.emit(unit);
  }
  confirmDeleteUnit(unit: ILocationUnit) {
    this.deleteUnit.emit(unit);
  }

  readonly getUnitStatutLabel = getUnitStatusLabel;
  readonly getUnitStatutClass = getUnitStatusBadgeClass;
  readonly getUnitStatutDotClass = getUnitStatusDotClass;
}
