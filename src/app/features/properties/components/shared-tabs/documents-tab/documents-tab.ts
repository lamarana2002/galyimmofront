import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideFile,
  lucideDownload,
  lucideTrash2,
  lucideUpload,
  lucideX,
  lucidePlus,
  lucideCalendar,
  lucideHash,
  lucideCheckSquare,
  lucideInfo,
  lucideEye
} from '@ng-icons/lucide';

import { PropertyDocument } from '../../../models/property-document.model';
import { PropertyDocumentTypeEnum, PropertyDocumentTypeLabels, hasExpiryDate } from '../../../enums/property-document-type.enum';
import { PropertyDocumentHelper } from '../../../utils/property-document.utils';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state';
import { ToastService } from '../../../../../shared/services/toast.service';
import { UploadPropertyDocumentPayload } from '../../../interfaces/upload-property-document-payload.interface';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-documents-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, EmptyStateComponent, DatePipe, ConfirmDialogComponent],
  templateUrl: './documents-tab.html',
  styleUrl: './documents-tab.css',
  viewProviders: [
    provideIcons({
      lucideFile,
      lucideDownload,
      lucideTrash2,
      lucideUpload,
      lucideX,
      lucidePlus,
      lucideCalendar,
      lucideHash,
      lucideCheckSquare,
      lucideInfo,
      lucideEye
    }),
  ],
})
export class DocumentsTab {
  private toast = inject(ToastService);

  // ── Inputs ────────────────────────────────────────────────────
  documents = input.required<PropertyDocument[] | undefined | null>();
  ownerId   = input.required<number>();
  ownerType = input.required<'properties' | 'structures'>();

  // ── Outputs ───────────────────────────────────────────────────
  onUpload   = output<UploadPropertyDocumentPayload>();
  onDelete   = output<number>();
  onDownload = output<number>();

  // ── Types ─────────────────────────────────────────────────────
  readonly docTypes = Object.entries(PropertyDocumentTypeLabels).map(([value, label]) => ({
    value: value as PropertyDocumentTypeEnum,
    label
  }));

  readonly PropertyDocumentHelper = PropertyDocumentHelper;
  readonly hasExpiryDate = hasExpiryDate;

  // ── State ─────────────────────────────────────────────────────
  showUploadForm  = signal(false);
  isUploading     = signal(false);
  showDeleteModal = signal(false);
  documentToDelete = signal<PropertyDocument | null>(null);
  
  // Local form state
  form = signal({
    title: '',
    type: PropertyDocumentTypeEnum.OTHER,
    description: '',
    reference_number: '',
    issue_date: '',
    expiry_date: '',
    is_public: false,
    file: null as File | null
  });

  // ── Handlers ──────────────────────────────────────────────────
  toggleUploadForm() {
    this.showUploadForm.update(v => !v);
    if (!this.showUploadForm()) this.resetForm();
  }

  fileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.toast.error('Le fichier ne doit pas dépasser 10 Mo');
        return;
      }
      this.form.update(f => ({ ...f, file }));
      // Generate default title if empty
      if (!this.form().title) {
        this.form.update(f => ({ ...f, title: file.name.split('.')[0] }));
      }
    }
  }

  resetForm() {
    this.form.set({
      title: '',
      type: PropertyDocumentTypeEnum.OTHER,
      description: '',
      reference_number: '',
      issue_date: '',
      expiry_date: '',
      is_public: false,
      file: null
    });
  }

  submitUpload() {
    const f = this.form();
    if (!f.file || !f.title || !f.type) {
      this.toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const payload: UploadPropertyDocumentPayload = {
      type: f.type,
      title: f.title,
      file: f.file,
      description: f.description,
      reference_number: f.reference_number,
      issue_date: f.issue_date,
      expiry_date: f.expiry_date,
      is_public: f.is_public
    };

    if (this.ownerType() === 'properties') {
      payload.property_id = this.ownerId();
    } else {
      payload.structure_id = this.ownerId();
    }

    this.onUpload.emit(payload);
  }

  requestDelete(doc: PropertyDocument) {
    this.documentToDelete.set(doc);
    this.showDeleteModal.set(true);
  }

  confirmDelete() {
    const doc = this.documentToDelete();
    if (doc) {
      this.onDelete.emit(doc.id);
      this.showDeleteModal.set(false);
      this.documentToDelete.set(null);
    }
  }

  downloadDocument(id: number) {
    this.onDownload.emit(id);
  }

  getDocIcon(mimeType: string | undefined | null): string {
    if (!mimeType) return 'lucideFile';
    if (mimeType.includes('pdf')) return 'lucideFile';
    if (mimeType.startsWith('image/')) return 'lucideEye';
    return 'lucideInfo';
  }

  getDocIconColor(mimeType: string | undefined | null): string {
    if (!mimeType) return 'text-primary-500 bg-primary-50';
    if (mimeType.includes('pdf')) return 'text-red-500 bg-red-50';
    if (mimeType.startsWith('image/')) return 'text-blue-500 bg-blue-50';
    return 'text-primary-500 bg-primary-50';
  }
}
