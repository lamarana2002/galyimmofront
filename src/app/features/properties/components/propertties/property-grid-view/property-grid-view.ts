import { Component, Input, output } from '@angular/core';
import { PropertyModel } from '../../../models/property.model';
import { NgIcon } from '@ng-icons/core';
import * as propertyUtils from '../../../utils/property.utils';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-property-grid-view',
  imports: [NgIcon, RouterLink],
  templateUrl: './property-grid-view.html',
  styleUrl: './property-grid-view.css',
})
export class PropertyGridView {
  @Input({ required: true }) filteredProperties!: PropertyModel[];
  propertyUtils = propertyUtils;
  onDelete = output<PropertyModel>();
  onEdit = output<number>();

  editPropertty(id: number) {
    this.onEdit.emit(id);
  }
  confirmDelete(property: PropertyModel) {
    this.onDelete.emit(property);
  }
}
