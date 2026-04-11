import { Component, Input, output, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { provideIcons } from '@ng-icons/core';
import { lucideUpload, lucideImage, lucideZoomIn, lucideTrash2, lucideX, lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';

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
  viewProviders: [provideIcons({ lucideUpload, lucideImage, lucideZoomIn, lucideTrash2, lucideX, lucideChevronLeft, lucideChevronRight })]
})
export class GalleryTab {
  onConfirmDelete = output<number>();
  onUploadImage = output<void>();
  onCancelUpload = output<void>();
  onFileSelected = output<Event>();

  @Input({ required: true }) gallery!: IGalleryItem[] | undefined | null;
  @Input() previewUrl: string | null = null;

  // Lightbox state
  showLightbox = signal(false);
  lightboxIndex = signal(0);

  confirmDeleteImage(id: number) {
    this.onConfirmDelete.emit(id);
  }

  openLightbox(index: number) {
    this.lightboxIndex.set(index);
    this.showLightbox.set(true);
  }

  closeLightbox() {
    this.showLightbox.set(false);
  }

  previousImage() {
    const len = this.gallery?.length ?? 0;
    if (len > 0) {
      this.lightboxIndex.update((i) => (i - 1 + len) % len);
    }
  }

  nextImage() {
    const len = this.gallery?.length ?? 0;
    if (len > 0) {
      this.lightboxIndex.update((i) => (i + 1) % len);
    }
  }

  get currentLightboxImage(): IGalleryItem | undefined {
    return this.gallery?.[this.lightboxIndex()];
  }

  uploadImage() {
    this.onUploadImage.emit();
  }

  cancelUpload() {
    this.onCancelUpload.emit();
  }

  fileSelected($event: Event) {
    this.onFileSelected.emit($event);
  }
}
