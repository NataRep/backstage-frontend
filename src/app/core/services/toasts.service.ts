import { Injectable, signal } from "@angular/core";

export interface Toast {
  id: number,
  type: ToastType,
  position: ToastPosition,
  message: string
}

export type ToastType = 'success' | 'warning';

export type ToastPosition =
  'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'center';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(message: string, type: ToastType, position: ToastPosition) {
    const id = Date.now();
    this.toastsSignal.update(t => [...t, { id, message, type, position }]);

    setTimeout(() => this.remove(id), 4000);
  }

  remove(id: number) {
    this.toastsSignal.update(t => t.filter(toast => toast.id !== id));
  }
}