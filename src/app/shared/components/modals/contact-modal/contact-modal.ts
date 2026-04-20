import { Component, Input, OnInit, SimpleChanges, OnChanges, output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { lucideMessageSquare, lucideSend, lucideX } from '@ng-icons/lucide';
import { getInitials } from '../../../../features/structures/utils/structure.utils';

@Component({
  selector: 'app-contact-modal',
  standalone: true,
  imports: [NgIconComponent, FormsModule],
  templateUrl: './contact-modal.html',
  viewProviders: [provideIcons({ lucideMessageSquare, lucideX, lucideSend })],
})
export class ContactModal implements OnInit, OnChanges {
  @Input() title = 'Nous contacter';
  @Input() recipientFullName = '';
  @Input() recipientEmail = '';
  @Input() initialSubject = '';

  contactSubject = '';
  contactMessage = '';

  sendMessage = output<{ subject: string, message: string }>();
  cancel = output<void>();

  ngOnInit() {
    this.contactSubject = this.initialSubject;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialSubject']) {
      this.contactSubject = this.initialSubject;
    }
  }

  getInitials(name: string): string {
    return getInitials(name);
  }

  sendContactMessage() {
    this.sendMessage.emit({
      subject: this.contactSubject,
      message: this.contactMessage,
    });
  }

  cancelToSendMessage() {
    this.cancel.emit();
  }
}
