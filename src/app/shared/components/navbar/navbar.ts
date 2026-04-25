import { Component, computed, inject, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from '../sidebar/sidebar.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ProfileService } from '../../../core/auth/services/profile.service';
import { NotificationService } from '../../../features/notifications/services/notification.service';
import { NotificationModel } from '../../../features/notifications/models/notification.model';

interface Language {
  code: string;
  label: string;
  flag: string;
}

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideUser, 
  lucideSettings, 
  lucideLogOut, 
  lucideBell, 
  lucideGlobe, 
  lucideChevronDown, 
  lucideMoon, 
  lucideSun,
  lucideMenu,
  lucideTrash2,
  lucideBellOff
} from '@ng-icons/lucide';

import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIconComponent, RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  viewProviders: [
    provideIcons({
      lucideUser,
      lucideSettings,
      lucideLogOut,
      lucideBell,
      lucideGlobe,
      lucideChevronDown,
      lucideMoon,
      lucideSun,
      lucideMenu,
      lucideTrash2,
      lucideBellOff
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar implements OnInit {

  profile = inject(ProfileService);
  authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  fullName = this.authService.fullName;
  initials = this.authService.initials;
  avatarUrl = this.authService.avatarUrl;

  // ── Dark mode ──
  isDarkMode = false;

  // ── Langue ──
  currentLang = 'FR';
  isLangDropdownOpen = false;
  languages: Language[] = [
    { code: 'FR', label: 'Français', flag: '🇫🇷' },
    { code: 'EN', label: 'English',  flag: '🇬🇧' },
    { code: 'AR', label: 'العربية',  flag: '🇸🇦' },
  ];

  // ── Notifications ──
  isNotifDropdownOpen = false;
  notifications = signal<NotificationModel[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.lu).length);

  // ── User dropdown ──
  isUserDropdownOpen = false;

  constructor(
    private router: Router,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.findAll().subscribe({
      next: (res) => {
        // On ne garde que les 5 dernières pour le dropdown
        this.notifications.set(res.data);
      }
    });
  }

  toggleSideBar(): void {
    this.sidebarService.toggle();
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }

  toggleLangDropdown(): void {
    this.isLangDropdownOpen = !this.isLangDropdownOpen;
    this.isNotifDropdownOpen = false;
    this.isUserDropdownOpen = false;
  }

  setLanguage(code: string): void {
    this.currentLang = code;
    this.isLangDropdownOpen = false;
  }

  toggleNotifDropdown(): void {
    this.isNotifDropdownOpen = !this.isNotifDropdownOpen;
    this.isLangDropdownOpen = false;
    this.isUserDropdownOpen = false;
    
    // Si on ouvre et qu'il y a des notifs, on pourrait rafraîchir
    if (this.isNotifDropdownOpen) {
      this.loadNotifications();
    }
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, lu: true })));
      }
    });
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    this.isLangDropdownOpen = false;
    this.isNotifDropdownOpen = false;
  }

  closeAllDropdowns(): void {
    this.isUserDropdownOpen = false;
    this.isLangDropdownOpen = false;
    this.isNotifDropdownOpen = false;
  }

  onSignOut(): void {
    this.closeAllDropdowns();
    this.authService.logout();
  }
}
