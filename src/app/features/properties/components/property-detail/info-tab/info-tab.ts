import { DatePipe, DecimalPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHome, lucideRuler, lucideLayers, lucideLayoutGrid, lucideCalendar, lucideMapPin } from '@ng-icons/lucide';
import { PropertyModel } from '../../../models/property.model';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-tab',
  imports: [NgIcon, DecimalPipe, DatePipe],
  templateUrl: './info-tab.html',
  styleUrl: './info-tab.css',
  viewProviders: [provideIcons({ lucideHome, lucideRuler, lucideLayers, lucideLayoutGrid, lucideCalendar, lucideMapPin })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoTab {
  @Input({ required: true }) bien!: PropertyModel;
  @Input({ required: true }) tauxOccupation: number = 0;
  @Input({ required: true }) rentedUnits: number = 0;
  @Input({ required: true }) unitsCount: number = 0;
}
