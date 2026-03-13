import { Component, inject, Input, output } from '@angular/core';
import { StructureModel } from '../../../models/structure.model';
import { StructureStatus } from '../../../enums/structure-status.enum';
import { StructureService } from '../../../services/structure.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideXCircle } from '@ng-icons/lucide';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-structure-list-view',
  imports: [NgIcon, DatePipe, TitleCasePipe, RouterLink],
  templateUrl: './structure-list-view.html',
  styleUrl: './structure-list-view.css',
  viewProviders: [provideIcons({ lucideBuilding2, lucideXCircle })],
})
export class StructureListView {
  @Input({ required: true }) structures!: StructureModel[];
  StructureStatus = StructureStatus;
  structureService = inject(StructureService);

  // Pagination
  @Input() currentPage = 1;
  @Input() itemsPerPage = 12;
  @Input() totalItems = 1;
  @Input() hasNextPage = false;
  @Input() hasPrevPage = false;

  changePage = output<number>();
  changeStatus = output<{ id: number; status: StructureStatus }>();
  changePlan = output<number>();

  // ── Modals ────────────────────────────────────────────────────
  contactTarget: StructureModel | null = null;
  contactSubject = '';
  contactMessage = '';
  deleteTarget: StructureModel | null = null;

  onStatusChange(s: StructureModel, status: StructureStatus) {
    this.changeStatus.emit({ id: s.id, status: status });
  }

  getHealthScore(s: StructureModel): number {
    return this.structureService.getHealthScore(s);
  }

  getOwnerName(nom?: string, prenom?: string){
    return `${prenom} ${nom}`;
  }

  getInitials(name: string): string {
    return this.structureService.getInitials(name);
  }
  getStatutLabel(status: string): string {
    return this.structureService.getStatutLabel(status);
  }
  // ── Pagination ────────────────────────────────────────────────
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageChange(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.changePage.emit(p);
  }
  onPlanChange(id: number): void {
    this.changePlan.emit(id);
  }
  openContact(s: StructureModel): void {
    this.contactTarget = s;
    this.contactSubject = `Concernant votre structure "${s.name}"`;
    this.contactMessage = '';
  }
  confirmDelete(s: StructureModel): void {
    this.deleteTarget = s;
  }
}
