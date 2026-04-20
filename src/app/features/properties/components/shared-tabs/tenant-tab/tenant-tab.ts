import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUser,
  lucideMail,
  lucidePhone,
  lucideMapPin,
  lucideUserPlus,
} from '@ng-icons/lucide';

import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state';
import { ILocationUnit } from '../../../models/location-unit.model';
import { getInitials } from '../../../../structures/utils/structure.utils';
import { ContactModal } from '../../../../../shared/components/modals/contact-modal/contact-modal';

@Component({
  selector: 'app-tenant-tab',
  standalone: true,
  imports: [CommonModule, NgIconComponent, EmptyStateComponent, ContactModal],
  templateUrl: './tenant-tab.html',
  viewProviders: [
    provideIcons({
      lucideUser,
      lucideMail,
      lucidePhone,
      lucideMapPin,
      lucideUserPlus,
    }),
  ],
})
export class TenantTab {
  unit = input.required<ILocationUnit | undefined | null>();

  onContact = output<void>();
  onAffect = output<void>();

  getInitials(nom: string, prenom: string): string {    
    return getInitials(`${prenom} ${nom}`);
  }

  showContactModal = signal(false);

  openContactModal() {
    this.showContactModal.set(true);
  }

  sendContactMessage(data: { subject: string, message: string }) {
    // Émettre l'événement ou gérer l'envoi
    this.onContact.emit();
    this.showContactModal.set(false);
  }
}
