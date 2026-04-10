import { Component, Input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { getDocIconColor } from '../../../utils/property.utils';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { provideIcons } from '@ng-icons/core';
import { lucideFile, lucideDownload } from '@ng-icons/lucide';
import { PropertyModel } from '../../../models/property.model';
import { PropertyDocumentHelper } from '../../../utils/property-document.utils';

@Component({
  selector: 'app-document-tab',
  imports: [NgIcon, UpperCasePipe, DatePipe],
  templateUrl: './document-tab.html',
  styleUrl: './document-tab.css',
  viewProviders: [provideIcons({ lucideFile, lucideDownload })],
})
export class DocumentTab {
  @Input({ required: true }) bien!: PropertyModel;

  readonly getDocIconColor = getDocIconColor;
  readonly PropertyDocumentHelper = PropertyDocumentHelper;
}
