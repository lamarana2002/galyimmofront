import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideX,
  lucideTriangleAlert,
  lucideInfo,
  lucideCircleX,
} from '@ng-icons/lucide';

import { ToastService, Toast, ToastType } from '../../services/toast.service';

interface ToastConfig {
  icon:       string;
  wrapperClass: string;
  iconClass:  string;
  barClass:   string;
}

const TOAST_CONFIG: Record<ToastType, ToastConfig> = {
  success: {
    icon:         'lucideCheck',
    wrapperClass: 'border-green-200 bg-white',
    iconClass:    'bg-green-100 text-green-600',
    barClass:     'bg-green-500',
  },
  error: {
    icon:         'lucideCircleX',
    wrapperClass: 'border-red-200 bg-white',
    iconClass:    'bg-red-100 text-red-600',
    barClass:     'bg-red-500',
  },
  warning: {
    icon:         'lucideTriangleAlert',
    wrapperClass: 'border-amber-200 bg-white',
    iconClass:    'bg-amber-100 text-amber-600',
    barClass:     'bg-amber-500',
  },
  info: {
    icon:         'lucideInfo',
    wrapperClass: 'border-primary-200 bg-white',
    iconClass:    'bg-primary-100 text-primary-600',
    barClass:     'bg-primary-500',
  },
};

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [
    provideIcons({ lucideCheck, lucideX, lucideTriangleAlert, lucideInfo, lucideCircleX }),
  ],
  templateUrl: './toast.html',
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);

  readonly toasts = this.toastService.toasts;

  getConfig(type: ToastType): ToastConfig {
    return TOAST_CONFIG[type];
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  trackById(_: number, toast: Toast): number {
    return toast.id;
  }
}
