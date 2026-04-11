import { Component, Input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { provideIcons } from '@ng-icons/core';
import { lucideUpload, lucideImage, lucideZoomIn, lucideTrash2 } from '@ng-icons/lucide';

export interface IGalleryItem {
  id: number;
  image: string;
}

@Component({
  selector: 'app-gallery-tab',
  imports: [NgIcon],
  templateUrl: './gallery-tab.html',
  styleUrl: './gallery-tab.css',
  viewProviders: [provideIcons({ lucideUpload, lucideImage, lucideZoomIn, lucideTrash2 })]
})
export class GalleryTab {
  onConfirmDelete = output<number>();
  onOpenLightbox = output<number>();
  onUploadImage = output<void>();
  onCancelUpload = output<void>();
  onFileSelected = output<Event>();

  @Input({ required: true }) gallery!: IGalleryItem[] | undefined | null;
  @Input() previewUrl: string | null = null;
  confirmDeleteImage(id: number) {
    this.onConfirmDelete.emit(id);
  }
  openLightbox(index: number) {
    this.onOpenLightbox.emit(index);
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
