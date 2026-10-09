import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SidebarService } from './sidebar.service';
import {
  lucideBuilding,
  lucideBuilding2,
  lucideChartNoAxesCombined,
  lucideFileText,
  lucideHelpCircle,
  lucideHome,
  lucideHouse,
  lucideInbox,
  lucideUserCog,
  lucideUserRound,
  lucideUsers,
  lucideMessageSquare,
  lucideBanknote,
  lucideKanban,
  lucideSettings,
  lucideShieldCheck
} from '@ng-icons/lucide';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProfileService } from '../../../core/auth/services/profile.service';
import { NgIcon, provideIcons } from '@ng-icons/core';

interface NavItem {
  label: string;
  icon: string;
  link: string;
  role?: string;
  badge?: 'pro' | 'unread';
}

type User = {
  name: string;
  email: string;
  role: string;
  avatar: string;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgIcon, RouterLink, RouterLinkActive],
  providers: [
    provideIcons({
      lucideHouse,
      lucideInbox,
      lucideBuilding,
      lucideBuilding2,
      lucideHome,
      lucideUserRound,
      lucideFileText,
      lucideUsers,
      lucideUserCog,
      lucideChartNoAxesCombined,
      lucideHelpCircle,
      lucideMessageSquare,
      lucideBanknote,
      lucideKanban,
      lucideSettings,
      lucideShieldCheck
    }),
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar implements OnInit {
  profile = inject(ProfileService);
  userRoles = this.profile.roleNamesArray;

  mainNavs: NavItem[] = [
    { label: 'Dashboard', icon: 'lucideHouse', link: '/dashboard' },
    // { label: 'Kanban', icon: 'lucideKanban', link: '/kanban', badge: 'pro' }, // pas encore utilisé
    { label: 'Inbox', icon: 'lucideInbox', link: '/inbox', badge: 'unread' },
  ];

  managementNavs: NavItem[] = [
    { label: 'Agences', icon: 'lucideBuilding2', link: '/structures', role: 'super-admin' },
    { label: 'Propriétés', icon: 'lucideHome', link: '/properties', role: 'proprietaire' },
    { label: 'Locataires', icon: 'lucideUserRound', link: '/locataires', role: 'proprietaire' },
    { label: 'Contrats', icon: 'lucideFileText', link: '/contrats', role: 'proprietaire' },
    { label: 'Paiements', icon: 'lucideBanknote', link: '/payments', role: 'proprietaire' },
    { label: 'Teams', icon: 'lucideUsers', link: '/teams', role: 'super-admin' },
    { label: 'FAQs', icon: 'lucideHelpCircle', link: '/faqs', role: 'super-admin' },
    { label: 'Témoignages', icon: 'lucideMessageSquare', link: '/testimonials', role: 'super-admin' },
    { label: 'Utilisateurs', icon: 'lucideUsers', link: '/users', role: 'proprietaire' },
    { label: 'Administrateurs', icon: 'lucideUserCog', link: '/users', role: 'super-admin' },
    { label: 'Analytics', icon: 'lucideChartNoAxesCombined', link: '/analytics', role: 'super-admin' },
  ];

  accountNavs: NavItem[] = [
    // { label: 'Settings', icon: 'lucideSettings', link: '/settings' }, // pas encore utilisé
  ];

  sidebarService = inject(SidebarService);
  isOpen = this.sidebarService.isOpen;

  currentUser: User = {
    name: 'Neil Sims',
    email: 'neil.sims@flowbite.com',
    role: 'Administrator',
    avatar: 'https://flowbite.com/docs/images/people/profile-picture-5.jpg',
  };

  unreadCount = 2;
  isUserDropdownOpen = false;

  constructor() {}

  ngOnInit(): void {}

  close(): void {
    this.sidebarService.close();
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  onSignOut(): void {}
}
