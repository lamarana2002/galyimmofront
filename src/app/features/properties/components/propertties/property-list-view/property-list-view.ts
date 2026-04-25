import { ChangeDetectionStrategy, Component, Input, output } from '@angular/core';
import { PropertyModel } from '../../../models/property.model';
import * as propertyUtils from '../../../utils/property.utils';
import { NgIcon } from '@ng-icons/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-property-list-view',
  imports: [NgIcon, RouterLink],
  templateUrl: './property-list-view.html',
  styleUrl: './property-list-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyListView {
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
