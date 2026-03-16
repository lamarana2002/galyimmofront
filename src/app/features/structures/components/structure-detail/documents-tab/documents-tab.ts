import { Component, Input, OnInit } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideDownload, lucideFile, lucideFileX } from '@ng-icons/lucide';
import { DatePipe, UpperCasePipe } from '@angular/common';

import { StructureModel } from '../../../models/structure.model';

// ── Interface temporaire ───────────────────────────────────────
// À déplacer dans document.model.ts quand l'endpoint sera prêt
export interface StructureDocument {
  id:   number;
  nom:  string;
  ext:  string;
  date: string;   // ISO string
  url?: string;   // URL de téléchargement
}

@Component({
  selector: 'app-documents-tab',
  standalone: true,
  imports: [NgIconComponent, UpperCasePipe, DatePipe],
  templateUrl: './documents-tab.html',
  viewProviders: [provideIcons({ lucideFile, lucideDownload, lucideFileX })],
})
export class DocumentsTab implements OnInit {

  @Input({ required: true }) structure!: StructureModel;

  // État
  loading = false;
  error: string | null = null;

  // TODO: Remplacer par un vrai appel API
  // GET /structures/{id}/documents
  documents: StructureDocument[] = [];

  ngOnInit(): void {
    // TODO: this.loadDocuments();
  }

  // TODO: décommenter quand l'endpoint existe
  // private loadDocuments(): void {
  //   this.loading = true;
  //   this.documentService.findByStructure(this.structure.id)
  //     .subscribe({
  //       next: (res) => { this.documents = res.data; this.loading = false; },
  //       error: (err) => { this.error = err?.error?.message ?? 'Erreur'; this.loading = false; },
  //     });
  // }

  getDocIconColor(ext: string): string {
    const map: Record<string, string> = {
      pdf:  'text-red-600 bg-red-100',
      doc:  'text-blue-600 bg-blue-100',
      docx: 'text-blue-600 bg-blue-100',
      xls:  'text-green-600 bg-green-100',
      xlsx: 'text-green-600 bg-green-100',
      jpg:  'text-purple-600 bg-purple-100',
      png:  'text-purple-600 bg-purple-100',
    };
    return map[ext] ?? 'text-gray-500 bg-gray-100';
  }
}