import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBell,
  lucideSearch,
  lucideCheck,
  lucideEye,
  lucideMail,
  lucideClock,
  lucideChevronRight,
} from '@ng-icons/lucide';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { NotificationModel } from '../../models/notification.model';

const MOCK_NOTIFICATIONS: NotificationModel[] = [
  {
    id: 1,
    category: 'contact',
    title: 'Demande de contact reçue',
    description: 'Un visiteur veut plus d’informations sur l’appartement Cocody. ',
    source: 'Formulaire contact',
    status: 'new',
    created_at: 'Il y a 5 min',
    read: false,
  },
  {
    id: 2,
    category: 'lead',
    title: 'Nouvelle demande de visite',
    description: 'Visite demandée pour la villa Marcory demain à 10h00.',
    source: 'Portail client',
    status: 'pending',
    created_at: 'Il y a 20 min',
    read: false,
  },
  {
    id: 3,
    category: 'payment',
    title: 'Paiement partiel reçu',
    description: 'Un acompte a été reçu pour le local Plateau.',
    source: 'Transaction',
    status: 'reviewed',
    created_at: 'Il y a 2 h',
    read: true,
  },
  {
    id: 4,
    category: 'system',
    title: 'Mise à jour disponible',
    description: 'Nouvelle version des documents de location disponible.',
    source: 'Système',
    status: 'reviewed',
    created_at: 'Hier',
    read: true,
  },
];

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, EmptyStateComponent],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'],
  viewProviders: [
    provideIcons({
      lucideBell,
      lucideSearch,
      lucideCheck,
      lucideEye,
      lucideMail,
      lucideClock,
      lucideChevronRight,
    }),
  ],
})
export class Notifications {
  notifications = signal<NotificationModel[]>(MOCK_NOTIFICATIONS);
  searchQuery = signal('');
  filter = signal<'all' | 'unread'>('all');

  unreadCount = computed(() => this.notifications().filter((item) => !item.read).length);
  totalCount = computed(() => this.notifications().length);

  filteredNotifications = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    return this.notifications().filter((notification) => {
      const matchesFilter = this.filter() === 'unread' ? !notification.read : true;
      const matchesQuery =
        notification.title.toLowerCase().includes(query) ||
        notification.description.toLowerCase().includes(query) ||
        notification.source.toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
  });

  setFilter(value: 'all' | 'unread'): void {
    this.filter.set(value);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  markAsRead(id: number): void {
    this.notifications.update((list) =>
      list.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  markAllRead(): void {
    this.notifications.update((list) => list.map((item) => ({ ...item, read: true })));
  }
}
