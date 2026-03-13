import { Component, inject, Input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlignLeft, lucideCalendar, lucideMail, lucideMapPin, lucidePhone, lucideUser, lucideUserX } from '@ng-icons/lucide';
import { StructureDetail } from '../../../pages/structure-details/structure-details';
import { StructureService } from '../../../services/structure.service';
import { PlanType } from '../../structures/structure-card/structure-card';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StructureModel } from '../../../models/structure.model';
import { ContactStructureModal } from "../contact-structure-modal/contact-structure-modal";

@Component({
  selector: 'app-owner-tap',
  imports: [NgIcon, DatePipe, FormsModule, ContactStructureModal],
  templateUrl: './owner-tap.html',
  styleUrl: './owner-tap.css',
  viewProviders: [provideIcons({lucideUser, lucideMail, lucidePhone, lucideMapPin, lucideCalendar,
    lucideAlignLeft, lucideUserX
  })]
})
export class OwnerTap {
  @Input() structure?: StructureModel;
  structureService = inject(StructureService);
  // ── UI states ─────────────────────────────────────────────────
  showContactModal = false;
  showDeleteConfirm = false;
  showPlanModal = false;
  contactMessage = '';
  contactSubject = '';
  selectedPlan: PlanType = 'premium';

  getInitials(name?: string): string {
    return name ? this.structureService.getInitials(name) : '';
  }
  getOwnerName(nom?: string, prenom?: string){
    return `${prenom} ${nom}`;
  }
  sendContactMessage(): void {
    console.log('Message envoyé à', this.structure?.owner?.email);
    // this.addAuditLog(`Message envoyé au propriétaire : "${this.contactSubject}".`);
    this.showContactModal = false;
    this.contactMessage = '';
    this.contactSubject = '';
  }
}
