import { Component, inject, Input, OnDestroy, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideBuilding,
  lucideUsers,
  lucideKey,
  lucideCrown,
  lucideSearch,
  lucideSearchX,
  lucideDownload,
  lucidePlus,
  lucideLayoutGrid,
  lucideList,
  lucideClock,
  lucideCheckCircle,
  lucideCheck,
  lucidePause,
  lucidePlay,
  lucideMail,
  lucideEye,
  lucideTrash2,
  lucideX,
  lucideSend,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { StructureModel } from '../../../models/structure.model';
import { RouterLink } from '@angular/router';
import { StructureStatus } from '../../../enums/structure-status.enum';
import { Subscription } from 'rxjs';
import { StructureService } from '../../../services/structure.service';

@Component({
  selector: 'app-structure-grid-view',
  imports: [NgIcon, RouterLink],
  templateUrl: './structure-grid-view.html',
  styleUrl: './structure-grid-view.css',
  viewProviders: [
    provideIcons({
      lucideBuilding2,
      lucideBuilding,
      lucideUsers,
      lucideKey,
      lucideCrown,
      lucideSearch,
      lucideSearchX,
      lucideDownload,
      lucidePlus,
      lucideLayoutGrid,
      lucideList,
      lucideClock,
      lucideCheckCircle,
      lucideCheck,
      lucidePause,
      lucidePlay,
      lucideMail,
      lucideEye,
      lucideTrash2,
      lucideX,
      lucideSend,
      lucideTriangleAlert,
    }),
  ],
})
export class StructureGridView implements OnDestroy {
  @Input({ required: true }) structures!: StructureModel[];
  StructureStatus = StructureStatus;
  structureService = inject(StructureService);
  changeStatus = output<{ id: number; status: StructureStatus }>();

  // subscription
  sub: Subscription = new Subscription();

  onStatusChange(s: StructureModel, status: StructureStatus) {
    this.changeStatus.emit({ id: s.id, status: status });
  }

  getHealthScore(s: StructureModel): number {
    return this.structureService.getHealthScore(s);
  }

  getOwnerName(nom?: string, prenom?: string){
    return `${prenom} ${nom}`;
  }

  getInitials(name: string): string {
    return this.structureService.getInitials(name);
  }
  getStatutLabel(status: string): string {
    return this.structureService.getStatutLabel(status);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
