import { Component, inject, Input } from '@angular/core';
import { StructureDetail } from '../../../pages/structure-details/structure-details';
import { StructureService } from '../../../services/structure.service';

@Component({
  selector: 'app-audit-tab',
  imports: [],
  templateUrl: './audit-tab.html',
  styleUrl: './audit-tab.css',
})
export class AuditTab {
  @Input({required: true}) structure!: StructureDetail;
  structureService = inject(StructureService);

  getInitials(name: string){
    return this.structureService.getInitials(name);
  }
}
