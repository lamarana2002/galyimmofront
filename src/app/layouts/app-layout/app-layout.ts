import { Component } from '@angular/core';
import { Navbar } from "../../shared/components/navbar/navbar";
import { RouterOutlet } from "@angular/router";
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { ToastComponent } from '../../shared/components/toast/toast';

@Component({
  selector: 'app-layout',
  imports: [Navbar, Sidebar, RouterOutlet, ToastComponent],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout {}
