import { Component, inject, Input } from '@angular/core';
import { PlanType, StructureDetail } from '../../../pages/structure-details/structure-details';
import { StructureService } from '../../../services/structure.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDownload, lucideFile } from '@ng-icons/lucide';
import { DatePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-documents-tab',
  imports: [NgIcon, UpperCasePipe, DatePipe],
  templateUrl: './documents-tab.html',
  styleUrl: './documents-tab.css',
  viewProviders: [provideIcons({
    lucideFile,lucideDownload
  })]
})
export class DocumentsTab {
  @Input({required: true}) structure!: StructureDetail;
  structureService = inject(StructureService);
  // ── UI states ─────────────────────────────────────────────────
    showContactModal  = false;
    showDeleteConfirm = false;
    showPlanModal     = false;
    contactMessage    = '';
    contactSubject    = '';
    selectedPlan: PlanType = 'premium';
    
  getDocIconColor(ext: string): string {
    const m: Record<string, string> = {
      pdf: 'text-red-600 bg-red-100', doc: 'text-blue-600 bg-blue-100',
      docx: 'text-blue-600 bg-blue-100', xls: 'text-green-600 bg-green-100',
      xlsx: 'text-green-600 bg-green-100', jpg: 'text-purple-600 bg-purple-100',
      png: 'text-purple-600 bg-purple-100',
    };
    return m[ext] ?? 'text-gray-500 bg-gray-100';
  }
}
