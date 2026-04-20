import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideUsers, lucideShield, lucideBuilding2 } from '@ng-icons/lucide';
import { UsersHandlerTab } from '../components/tabs/users-handler-tab/users-handler-tab';
import { RolesTab } from '../components/tabs/roles-tab/roles-tab';
import { AgenceTab } from '../components/tabs/agence-tab/agence-tab';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, NgIconComponent, UsersHandlerTab, RolesTab, AgenceTab],
  templateUrl: './users.html',
  styleUrl: './users.css',
  viewProviders: [provideIcons({ lucideUsers, lucideShield, lucideBuilding2 })],
})
export class Users {
  activeTab = signal<'users' | 'roles' | 'agence'>('users');

  readonly tabs = [
    { key: 'users' as const, label: 'Utilisateurs', icon: 'lucideUsers' },
    { key: 'roles' as const, label: 'Rôles', icon: 'lucideShield' },
    { key: 'agence' as const, label: 'Agence', icon: 'lucideBuilding2' },
  ];
}
