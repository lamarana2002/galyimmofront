import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number; // ms
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  private _nextId  = 0;

  /** Liste réactive des toasts actifs. */
  readonly toasts = computed(() => this._toasts());

  // ── API publique ──────────────────────────────────────────
  success(message: string, duration = 4000): void {
    this._add('success', message, duration);
  }

  error(message: string, duration = 5000): void {
    this._add('error', message, duration);
  }

  warning(message: string, duration = 4500): void {
    this._add('warning', message, duration);
  }

  info(message: string, duration = 4000): void {
    this._add('info', message, duration);
  }

  dismiss(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  // ── Interne ───────────────────────────────────────────────
  private _add(type: ToastType, message: string, duration: number): void {
    const id = ++this._nextId;
    this._toasts.update(list => [...list, { id, type, message, duration }]);

    setTimeout(() => this.dismiss(id), duration);
  }
}
