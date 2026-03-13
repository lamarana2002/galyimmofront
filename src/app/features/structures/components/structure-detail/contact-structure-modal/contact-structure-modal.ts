import { Component, inject, Input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { StructureModel } from '../../../models/structure.model';
import { StructureService } from '../../../services/structure.service';
import { FormsModule } from '@angular/forms';
import { lucideMessageSquare, lucideSend, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-contact-structure-modal',
  imports: [NgIcon, FormsModule],
  templateUrl: './contact-structure-modal.html',
  styleUrl: './contact-structure-modal.css',
  viewProviders: [provideIcons({ lucideMessageSquare, lucideX, lucideSend })],
})
export class ContactStructureModal {
  contactSubject = '';
  contactMessage = '';
  sendMessage = output();
  cancel = output();

  @Input() showContactModal = false;
  @Input() structure!: StructureModel;
  structureService = inject(StructureService);

  getOwnerName(nom: string, prenom: string): string {
    return this.structureService.getOwnerName(nom, prenom);
  }
  getInitials(name: string) {
    return this.structureService.getInitials(name);
  }
  sendContactMessage() {
    this.sendMessage.emit();
  }
  cancelToSendMessage(){
    this.cancel.emit();
  }
}
