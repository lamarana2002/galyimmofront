import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
  lucideInbox,
  lucideTrash2,
  lucideCheckCircle2,
  lucideArrowLeft,
  lucideCircleAlert,
  lucideUser,
  lucideCalendar,
  lucideCircle,
  lucideSettings,
} from '@ng-icons/lucide';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { NotificationModel } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';
import { ToastService } from '../../../../shared/services/toast.service';

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
      lucideInbox,
      lucideTrash2,
      lucideCheckCircle2,
      lucideArrowLeft,
      lucideCircleAlert,
      lucideUser,
      lucideCalendar,
      lucideCircle,
      lucideSettings,
    }),
  ],
})
export class Notifications implements OnInit {
  private readonly service = inject(NotificationService);
  private readonly toast = inject(ToastService);

  // ── État ──────────────────────────────────────────────────────
  notifications = signal<NotificationModel[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');
  filter = signal<'all' | 'unread'>('all');
  selectedNotification = signal<NotificationModel | null>(null);

  // ── Computed ──────────────────────────────────────────────────
  unreadCount = computed(() => this.notifications().filter((item) => !item.lu).length);
  totalCount  = computed(() => this.notifications().length);

  filteredNotifications = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    return this.notifications()
      .filter((notification) => {
        const matchesFilter = this.filter() === 'unread' ? !notification.lu : true;
        const matchesQuery =
          notification.sujet?.toLowerCase().includes(query) ||
          notification.message?.toLowerCase().includes(query) ||
          false;
        return matchesFilter && matchesQuery;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  });

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.isLoading.set(true);
    this.service.findAll().subscribe({
      next: (res) => {
        this.notifications.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Erreur lors du chargement des notifications.');
        this.isLoading.set(false);
      }
    });
  }

  // ── Handlers ──────────────────────────────────────────────────
  setFilter(value: 'all' | 'unread'): void {
    this.filter.set(value);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  selectNotification(n: NotificationModel): void {
    this.selectedNotification.set(n);
    if (!n.lu) {
      this.markAsRead(n);
    }
  }

  markAsRead(n: NotificationModel): void {
    const id = n.id;
    this.service.markAsRead(id).subscribe({
      next: () => {
        this.notifications.update((list) =>
          list.map((item) => (item.id === id ? { ...item, lu: true } : item))
        );
        // Mettre à jour l'objet sélectionné si c'est le même
        const current = this.selectedNotification();
        if (current && current.id === id) {
          this.selectedNotification.set({ ...current, lu: true });
        }
      }
    });
  }

  markAllRead(): void {
    this.service.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update((list) => list.map((item) => ({ ...item, lu: true })));
        this.toast.success('Toutes les notifications sont marquées comme lues.');
        
        const current = this.selectedNotification();
        if (current) this.selectedNotification.set({...current, lu: true});
      }
    });
  }

  getCategoryIcon(type: string): string {
    const map: Record<string, string> = {
      contact: 'lucideMail',
      visit:   'lucideCalendar',
      payment: 'lucideCheckCircle2',
      system:  'lucideSettings',
      alert:   'lucideCircleAlert',
    };
    return map[type] || 'lucideBell';
  }

  getCategoryClass(type: string): string {
    const map: Record<string, string> = {
      contact: 'bg-blue-100 text-blue-600',
      visit:   'bg-purple-100 text-purple-600',
      payment: 'bg-emerald-100 text-emerald-600',
      system:  'bg-slate-100 text-slate-600',
      alert:   'bg-red-100 text-red-600',
    };
    return map[type] || 'bg-gray-100 text-gray-600';
  }
}
