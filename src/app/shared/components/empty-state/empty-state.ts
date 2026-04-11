import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideSearchX, lucideCirclePlus } from '@ng-icons/lucide';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [provideIcons({ lucideSearchX, lucideCirclePlus })],
  template: `
    <div class="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div class="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50">
        <ng-icon [name]="icon()" size="28" class="text-primary-400" />
      </div>
      <div class="space-y-1">
        <p class="text-base font-semibold text-primary-800">{{ title() }}</p>
        @if (subtitle()) {
          <p class="text-sm text-primary-400 max-w-xs">{{ subtitle() }}</p>
        }
      </div>
      @if (actionLabel()) {
        <button
          (click)="action.emit()"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                 bg-primary-800 text-white hover:bg-primary-900 transition-colors">
          <ng-icon name="lucideCirclePlus" size="16" />
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  icon        = input<string>('lucideSearchX');
  title       = input<string>('Aucun résultat');
  subtitle    = input<string>('');
  actionLabel = input<string>('');
  action      = output<void>();
}
