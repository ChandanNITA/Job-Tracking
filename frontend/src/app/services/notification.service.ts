import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Toast Notification Interface
 */
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

/**
 * NotificationService
 * Angular concept demonstrated:
 * - Singleton Service with @Injectable({ providedIn: 'root' })
 * - RxJS BehaviorSubject & Observables for reactive UI state propagation
 * - Decoupled notification dispatching across all components
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // BehaviorSubject holds the current array of active toasts
  private toastsSubject = new BehaviorSubject<ToastNotification[]>([]);
  public toasts$: Observable<ToastNotification[]> = this.toastsSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastNotification = { id, type, message, duration };

    const current = this.toastsSubject.getValue();
    this.toastsSubject.next([...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  success(message: string, duration: number = 4000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 4000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 4000): void {
    this.show(message, 'warning', duration);
  }

  dismiss(id: string): void {
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next(current.filter((t) => t.id !== id));
  }
}
