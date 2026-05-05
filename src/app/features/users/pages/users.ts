import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideUsers, lucideShield, lucideBuilding2 } from '@ng-icons/lucide';
import { Subject, takeUntil } from 'rxjs';
import { UsersHandlerTab } from '../components/tabs/users-handler-tab/users-handler-tab';
import { AgenceTab } from '../components/tabs/agence-tab/agence-tab';
import { RolesTab } from '../components/tabs/roles-tab/roles-tab';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, NgIconComponent, RolesTab, UsersHandlerTab, AgenceTab],
  templateUrl: './users.html',
  styleUrl: './users.css',
  viewProviders: [provideIcons({ lucideUsers, lucideShield, lucideBuilding2 })],
})
export class Users implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  activeTab = signal<'users' | 'roles' | 'agence'>('users');

  readonly tabs = [
    { key: 'users' as const, label: 'Utilisateurs', icon: 'lucideUsers' },
    { key: 'roles' as const, label: 'Rôles', icon: 'lucideShield' },
    { key: 'agence' as const, label: 'Agence', icon: 'lucideBuilding2' },
  ];

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['tab']) {
        this.activeTab.set(params['tab'] as 'users' | 'roles' | 'agence');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveTab(tab: 'users' | 'roles' | 'agence'): void {
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
