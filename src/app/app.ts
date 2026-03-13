import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Card } from './shared/components/card/card';
import { initFlowbite } from 'flowbite';
import { Sidebar } from './shared/components/sidebar/sidebar';
import { Navbar } from './shared/components/navbar/navbar';
import { List } from './shared/components/list/list';
import { StructureCard } from './features/structures/components/structures/structure-card/structure-card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroUsers, heroCog6Tooth } from '@ng-icons/heroicons/outline';
import { lucideGithub, lucideTwitter, lucideHouse } from '@ng-icons/lucide';
import { AppLayout } from './layouts/app-layout/app-layout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('angular-tuto');
}
