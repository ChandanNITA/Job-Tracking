import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
}

/**
 * SidebarComponent
 * Angular concepts demonstrated:
 * - Standalone Component
 * - Angular Router integration (RouterModule, routerLink, routerLinkActive)
 * - @Input() and @Output() for responsive sidebar collapse and mobile drawer states
 * - @for loop template syntax for nav items
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <!-- Mobile Backdrop -->
    @if (isMobileOpen) {
      <div
        class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        (click)="closeMobileMenu()"
      ></div>
    }

    <!-- Sidebar Container -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:static lg:translate-x-0"
      [ngClass]="{
        'w-64': !isCollapsed,
        'w-20': isCollapsed,
        'translate-x-0': isMobileOpen,
        '-translate-x-full lg:translate-x-0': !isMobileOpen
      }"
    >
      <!-- Logo Header -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <div class="flex items-center gap-3 overflow-hidden">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 shrink-0"
          >
            <app-icon name="briefcase" [size]="20" cssClass="text-white"></app-icon>
          </div>
          @if (!isCollapsed) {
            <div class="transition-opacity duration-200">
              <span class="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                CareerTrack
              </span>
              <span class="block text-[10px] font-semibold text-primary-600 uppercase tracking-widest -mt-1">
                Job Tracker
              </span>
            </div>
          }
        </div>

        <!-- Mobile close button -->
        <button
          type="button"
          (click)="closeMobileMenu()"
          class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <app-icon name="x" [size]="20"></app-icon>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-primary-50 text-primary-700 font-semibold shadow-sm border-l-4 border-primary-600"
            [routerLinkActiveOptions]="{ exact: !!item.exact }"
            (click)="closeMobileMenu()"
            [title]="item.label"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-150 group"
          >
            <div class="shrink-0 flex items-center justify-center w-5 h-5">
              <app-icon
                [name]="item.icon"
                [size]="18"
                cssClass="transition-colors group-hover:text-primary-600"
              ></app-icon>
            </div>
            @if (!isCollapsed) {
              <span class="truncate">{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <!-- Desktop Collapse Toggle Button -->
      <div class="hidden lg:flex p-3 border-t border-slate-100">
        <button
          type="button"
          (click)="onToggleCollapse()"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          [title]="isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
        >
          <app-icon
            [name]="isCollapsed ? 'chevron-right' : 'chevron-left'"
            [size]="16"
          ></app-icon>
          @if (!isCollapsed) {
            <span>Collapse Menu</span>
          }
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;
  @Input() isMobileOpen: boolean = false;

  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() closeMobile = new EventEmitter<void>();

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard', exact: true },
    { label: 'All Applications', route: '/applications', icon: 'briefcase', exact: true },
    { label: 'Add Application', route: '/applications/add', icon: 'plus' },
    { label: 'Interview Schedule', route: '/interviews', icon: 'calendar' },
  ];

  onToggleCollapse(): void {
    this.toggleCollapse.emit();
  }

  closeMobileMenu(): void {
    this.closeMobile.emit();
  }
}
