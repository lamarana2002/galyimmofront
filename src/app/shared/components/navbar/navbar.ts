import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from '../sidebar/sidebar.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ProfileService } from '../../../core/auth/services/profile.service';

interface User {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Notification {
  id: number;
  type: 'contract' | 'visit' | 'payment';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

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
  lucideMenu
} from '@ng-icons/lucide';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIconComponent, RouterLink],
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
      lucideMenu
    }),
  ],
})
export class Navbar {

  profile = inject(ProfileService);
  authService = inject(AuthService);

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
  notifications: Notification[] = [
    { id: 1, type: 'contract',  title: 'Contrat signé',         message: 'Appartement Plateau – Locataire Koné',   time: 'Il y a 5 min',  read: false },
    { id: 2, type: 'visit',     title: 'Visite programmée',     message: 'Villa Cocody – demain à 10h00',          time: 'Il y a 30 min', read: false },
    { id: 3, type: 'payment',   title: 'Loyer reçu',            message: 'Studio Marcory – 180 000 FCFA',          time: 'Il y a 2h',     read: true  },
    { id: 4, type: 'contract',  title: 'Bail expirant bientôt', message: 'Magasin Adjamé – expire dans 15 jours',  time: 'Hier',          read: true  },
  ];

  get unreadNotifs(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // ── User dropdown ──
  isUserDropdownOpen = false;

  constructor(
    private router: Router,
    private sidebarService: SidebarService
  ) {}

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
    // Brancher ici ton service de traduction (ngx-translate, etc.)
  }

  toggleNotifDropdown(): void {
    this.isNotifDropdownOpen = !this.isNotifDropdownOpen;
    this.isLangDropdownOpen = false;
    this.isUserDropdownOpen = false;
  }

  markAllRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
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
