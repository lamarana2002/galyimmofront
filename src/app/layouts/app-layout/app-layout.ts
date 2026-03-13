import { Component } from '@angular/core';
import { Navbar } from "../../shared/components/navbar/navbar";
import { RouterOutlet } from "@angular/router";
import { Sidebar } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-layout',
  imports: [Navbar, Sidebar, RouterOutlet],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout {}
