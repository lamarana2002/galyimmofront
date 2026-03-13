import { Component, OnDestroy, OnInit } from '@angular/core';
import { SidebarService } from './sidebar.service';
import { Subscription } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding, lucideBuilding2, lucideFileText, lucideHome, lucideHouse, lucideInbox, lucideUserCog, lucideUserRound, lucideUsers } from '@ng-icons/lucide';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
    lucideUserCog
   })],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit, OnDestroy {

  navs = [
    { label: "Agences", icon: 'lucideBuilding2', link: '/structures' },
    { label: "Propriétés", icon: 'lucideHome', link: '/properties' },
    { label: "Locataires", icon: 'lucideUserRound', link: '/locataires' },  
    { label: "Contrats", icon: 'lucideFileText', link: '/contrats' },
    { label: "Utilisateurs", icon: 'lucideUsers', link: '/users' },
    { label: "Administrateurs", icon: 'lucideUserCog', link: '/admins' }, 
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
