import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center gap-3" [class]="containerClass()">
      <div class="relative">
        <div class="w-10 h-10 rounded-full border-4 border-primary-100"></div>
        <div class="absolute inset-0 w-10 h-10 rounded-full border-4 border-transparent border-t-secondary-500 animate-spin"></div>
      </div>
      @if (message()) {
        <p class="text-sm text-primary-500 font-medium">{{ message() }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent {
  message        = input<string>('Chargement…');
  containerClass = input<string>('py-16');
}
