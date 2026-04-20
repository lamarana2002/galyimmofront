import { Component, Input, output, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { provideIcons } from '@ng-icons/core';
import {
  lucideUpload, lucideImage, lucideZoomIn, lucideTrash2,
  lucideX, lucideChevronLeft, lucideChevronRight, lucideBox
} from '@ng-icons/lucide';

import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state';

export interface IGalleryItem {
  id: number;
  image: string;
}

@Component({
  selector: 'app-gallery-tab',
  imports: [NgIcon, EmptyStateComponent],
  templateUrl: './gallery-tab.html',
  styleUrl: './gallery-tab.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  viewProviders: [provideIcons({
    lucideUpload, lucideImage, lucideZoomIn, lucideTrash2,
    lucideX, lucideChevronLeft, lucideChevronRight, lucideBox
  })]
})
export class GalleryTab {
  // ── Image events ──────────────────────────────────────────────
  onConfirmDelete = output<number>();
  onUploadImage   = output<void>();
  onCancelUpload  = output<void>();
  onFileSelected  = output<Event>();

  // ── 3D model events ───────────────────────────────────────────
  onModel3dSelected  = output<Event>();
  onUploadModel3d    = output<void>();
  onCancelModel3d    = output<void>();
  onDeleteModel3d    = output<void>();

  // ── Inputs ────────────────────────────────────────────────────
  @Input({ required: true }) gallery!: IGalleryItem[] | undefined | null;
  @Input() previewUrl:     string | null = null;
  @Input() model3dUrl:     string | null = null;
  @Input() model3dPreview: string | null = null; // filename after file selected

  // ── Lightbox state ────────────────────────────────────────────
  showLightbox  = signal(false);
  lightboxIndex = signal(0);

  confirmDeleteImage(id: number) { this.onConfirmDelete.emit(id); }
  uploadImage()                  { this.onUploadImage.emit(); }
  cancelUpload()                 { this.onCancelUpload.emit(); }
  fileSelected(e: Event)         { this.onFileSelected.emit(e); }
  model3dSelected(e: Event)      { this.onModel3dSelected.emit(e); }
  uploadModel3d()                { this.onUploadModel3d.emit(); }
  cancelModel3d()                { this.onCancelModel3d.emit(); }
  deleteModel3d()                { this.onDeleteModel3d.emit(); }

  openLightbox(index: number) {
    this.lightboxIndex.set(index);
    this.showLightbox.set(true);
  }

  closeLightbox() { this.showLightbox.set(false); }

  previousImage() {
    const len = this.gallery?.length ?? 0;
    if (len > 0) this.lightboxIndex.update((i) => (i - 1 + len) % len);
  }

  nextImage() {
    const len = this.gallery?.length ?? 0;
    if (len > 0) this.lightboxIndex.update((i) => (i + 1) % len);
  }

  get currentLightboxImage(): IGalleryItem | undefined {
    return this.gallery?.[this.lightboxIndex()];
  }
}
