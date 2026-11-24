import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NotificationService, ToastNotification } from './services/notification.service';
import { IconComponent } from './components/icon/icon.component';

/**
 * AppComponent
 * Angular concepts demonstrated:
 * - Standalone root Component (imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent])
 * - Reactive state subscription to NotificationService.toasts$
 * - Modern template control flow (@if, @for)
 * - Event binding and property binding between layout components
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    SidebarComponent,
    NavbarComponent,
    IconComponent,
  ],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      <!-- Layout shell with sidebar and main content -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar -->
        <app-sidebar
          [isCollapsed]="isSidebarCollapsed"
          [isMobileOpen]="isMobileSidebarOpen"
          (toggleCollapse)="toggleSidebar()"
          (closeMobile)="closeMobileSidebar()"
        ></app-sidebar>

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <!-- Navbar -->
          <app-navbar (openMobileMenu)="openMobileSidebar()"></app-navbar>

          <!-- Router Page Content Container -->
          <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>

      <!-- Toast Notification Container (Fixed Top-Right) -->
      <div class="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        @for (toast of toasts$ | async; track toast.id) {
          <div
            class="pointer-events-auto rounded-xl p-4 shadow-lg border flex items-start gap-3 transition-all duration-300 animate-slide-in"
            [ngClass]="getToastClasses(toast.type)"
          >
            <!-- Toast Icon -->
            <div class="shrink-0 mt-0.5">
              @if (toast.type === 'success') {
                <app-icon name="check-circle" [size]="18" cssClass="text-emerald-600"></app-icon>
              } @else if (toast.type === 'error') {
                <app-icon name="alert-circle" [size]="18" cssClass="text-rose-600"></app-icon>
              } @else if (toast.type === 'warning') {
                <app-icon name="alert-circle" [size]="18" cssClass="text-amber-600"></app-icon>
              } @else {
                <app-icon name="clock" [size]="18" cssClass="text-blue-600"></app-icon>
              }
            </div>

            <!-- Toast Message -->
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold leading-relaxed">{{ toast.message }}</p>
            </div>

            <!-- Dismiss Button -->
            <button
              type="button"
              (click)="dismissToast(toast.id)"
              class="shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            >
              <app-icon name="x" [size]="14"></app-icon>
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .animate-slide-in {
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `],
})
export class AppComponent {
  private notificationService = inject(NotificationService);

  isSidebarCollapsed: boolean = false;
  isMobileSidebarOpen: boolean = false;

  toasts$ = this.notificationService.toasts$;

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  openMobileSidebar(): void {
    this.isMobileSidebarOpen = true;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  dismissToast(id: string): void {
    this.notificationService.dismiss(id);
  }

  getToastClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'error':
        return 'bg-rose-50 border-rose-200 text-rose-900';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  }
}
