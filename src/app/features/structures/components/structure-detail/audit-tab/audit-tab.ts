import { Component, Input, OnInit } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideShield, lucideUser } from '@ng-icons/lucide';

import { LoadingComponent }    from '../../../../../shared/components/loading/loading';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state';

import { StructureModel } from '../../../models/structure.model';
import { getInitials } from '../../../utils/structure.utils';

// ── Interface temporaire ───────────────────────────────────────
// À déplacer dans audit.model.ts quand spatie/laravel-activitylog sera branché
export type AuditType = 'admin' | 'user';

export interface AuditLog {
  id:          number;
  causer:      string;
  description: string;
  date:        string;
  type:        AuditType;
}

@Component({
  selector: 'app-audit-tab',
  standalone: true,
  imports: [NgIconComponent, LoadingComponent, EmptyStateComponent],
  templateUrl: './audit-tab.html',
  viewProviders: [provideIcons({ lucideActivity, lucideShield, lucideUser })],
})
export class AuditTab implements OnInit {

  @Input({ required: true }) structure!: StructureModel;

  // État
  loading = false;
  error: string | null = null;

  // TODO: Remplacer par un vrai appel API
  // GET /structures/{id}/activities  (spatie/laravel-activitylog)
  logs: AuditLog[] = [];

  readonly getInitials = getInitials;

  ngOnInit(): void {
    // TODO: this.loadLogs();
  }

  // TODO: décommenter quand spatie est configuré
  // private loadLogs(): void {
  //   this.loading = true;
  //   this.structureService.getActivities(this.structure.id)
  //     .subscribe({
  //       next: (res) => { this.logs = res.data; this.loading = false; },
  //       error: (err) => { this.error = err?.error?.message ?? 'Erreur'; this.loading = false; },
  //     });
  // }
}