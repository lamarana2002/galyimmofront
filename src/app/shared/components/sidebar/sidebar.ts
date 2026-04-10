import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SidebarService } from './sidebar.service';
import { Subscription } from 'rxjs';
import { lucideBuilding, lucideBuilding2, lucideChartNoAxesCombined, lucideFileText, lucideHome, lucideHouse, lucideInbox, lucideUserCog, lucideUserRound, lucideUsers } from '@ng-icons/lucide';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProfileService } from '../../../core/auth/services/profile.service';
import { NgIcon, provideIcons } from '@ng-icons/core';

type User = {
  name: string,
  email: string,
  role: string,
  avatar: string
}

@Component({
  selector: 'app-sidebar',
  imports: [NgIcon, RouterLink, RouterLinkActive],
  providers: [provideIcons({ 
    lucideHouse, 
    lucideInbox, 
    lucideBuilding, 
    lucideBuilding2,
    lucideHome,
    lucideUserRound,
    lucideFileText,
    lucideUsers,
    lucideUserCog,
    lucideChartNoAxesCombined
   })],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit, OnDestroy {

  profile = inject(ProfileService);
  userRoles = this.profile.roleNamesArray;  

  navs = [
    { label: "Agences", icon: 'lucideBuilding2', link: '/structures', role: 'super-admin' },
    { label: "Propriétés", icon: 'lucideHome', link: '/properties',  role: 'proprietaire' },
    { label: "Locataires", icon: 'lucideUserRound', link: '/locataires', role: 'proprietaire' },
    { label: "Contrats", icon: 'lucideFileText', link: '/contrats', role: 'proprietaire' },
    { label: "Utilisateurs", icon: 'lucideUsers', link: '/users', role: 'proprietaire' },
    { label: "Administrateurs", icon: 'lucideUserCog', link: '/admins', role: 'super-admin' },
    { label: "Analytics", icon: 'lucideChartNoAxesCombined', link: '/analytics', role: 'super-admin' }, 
  ]

  isOpen = false;
  private sub!: Subscription;

  currentUser: User = {
    name: 'Neil Sims',
    email: 'neil.sims@flowbite.com',
    role: 'Administrator',
    avatar: 'https://flowbite.com/docs/images/people/profile-picture-5.jpg'
  };

  unreadCount = 2;
  isUserDropdownOpen = false;

  constructor(
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.sub = this.sidebarService.isOpen$.subscribe(val => {
      this.isOpen = val;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  close(): void {
    this.sidebarService.close();
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  onSignOut(): void {}
}
