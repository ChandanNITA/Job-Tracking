import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

/**
 * NavbarComponent
 * Angular concepts demonstrated:
 * - Standalone Component
 * - Event binding and Output emission to open mobile drawer
 * - Router navigation links
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <header class="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-3">
        <!-- Mobile hamburger menu button -->
        <button
          type="button"
          (click)="onOpenMobileMenu()"
          class="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Open Menu"
        >
          <app-icon name="menu" [size]="20"></app-icon>
        </button>

        <div>
          <h1 class="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
            CareerTrack
          </h1>
          <p class="text-[11px] text-slate-400 font-medium hidden sm:block">
            Professional Job Application Tracker & Interview Pipeline
          </p>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex items-center gap-3">
        <a
          routerLink="/applications/add"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <app-icon name="plus" [size]="16"></app-icon>
          <span class="hidden sm:inline">Add Application</span>
          <span class="sm:hidden">Add</span>
        </a>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  @Output() openMobileMenu = new EventEmitter<void>();

  onOpenMobileMenu(): void {
    this.openMobileMenu.emit();
  }
}
