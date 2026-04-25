import { Component, Input, output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideAlignLeft, lucideCalendar, lucideMail,
  lucideMapPin, lucidePhone, lucideUser, lucideUserX,
} from '@ng-icons/lucide';
import { DatePipe } from '@angular/common';

import { StructureModel } from '../../../models/structure.model';
import { getInitials, getOwnerFullName } from '../../../utils/structure.utils';

@Component({
  selector: 'app-owner-tap',
  standalone: true,
  imports: [NgIconComponent, DatePipe],
  templateUrl: './owner-tap.html',
  viewProviders: [provideIcons({
    lucideUser, lucideMail, lucidePhone, lucideMapPin,
    lucideCalendar, lucideAlignLeft, lucideUserX,
  })],
})
export class OwnerTap {

  @Input({ required: true }) structure!: StructureModel;

  // Remonte au parent — la modale contact est gérée par structure-details
  readonly contact = output<void>();

  get owner() {
    return this.structure.owner;
  }

  get ownerName(): string {
    return getOwnerFullName(this.owner?.nom, this.owner?.prenom);
  }

  get ownerInitials(): string {
    return getInitials(this.ownerName);
  }

  get ownerLocation(): string {
    const { ville, pays } = this.owner ?? {};
    if (ville && pays) return `${ville}, ${pays}`;
    return ville ?? pays ?? 'Non renseigné';
  }

  onContact(): void {
    this.contact.emit();
  }
}