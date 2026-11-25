import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * IconComponent
 * Angular concepts demonstrated:
 * - Standalone Component (standalone: true)
 * - @Input decorators for property binding (name, size, class)
 * - Template switch / conditional rendering
 * - Clean SVG Lucide-compatible icons without bundle overhead
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      [ngClass]="cssClass"
    >
      <!-- Layout Dashboard -->
      @if (name === 'dashboard' || name === 'layout-dashboard') {
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      }

      <!-- Briefcase -->
      @if (name === 'briefcase') {
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      }

      <!-- Plus -->
      @if (name === 'plus') {
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      }

      <!-- Calendar -->
      @if (name === 'calendar') {
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      }

      <!-- Search -->
      @if (name === 'search') {
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      }

      <!-- Filter -->
      @if (name === 'filter') {
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      }

      <!-- Edit / Pen -->
      @if (name === 'edit') {
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      }

      <!-- Trash / Delete -->
      @if (name === 'trash') {
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
      }

      <!-- External Link -->
      @if (name === 'external-link') {
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      }

      <!-- Check / Check-circle -->
      @if (name === 'check-circle' || name === 'check') {
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      }

      <!-- Alert Circle -->
      @if (name === 'alert-circle') {
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      }

      <!-- Clock -->
      @if (name === 'clock') {
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      }

      <!-- Map Pin -->
      @if (name === 'map-pin') {
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      }

      <!-- Dollar Sign -->
      @if (name === 'dollar-sign') {
        <line x1="12" x2="12" y1="2" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      }

      <!-- Chevron Down -->
      @if (name === 'chevron-down') {
        <path d="m6 9 6 6 6-6" />
      }

      <!-- Chevron Left -->
      @if (name === 'chevron-left') {
        <path d="m15 18-6-6 6-6" />
      }

      <!-- Chevron Right -->
      @if (name === 'chevron-right') {
        <path d="m9 18 6-6-6-6" />
      }

      <!-- Table -->
      @if (name === 'table') {
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
        <path d="M9 3v18" />
      }

      <!-- Kanban / Columns -->
      @if (name === 'kanban') {
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
      }

      <!-- Menu (Hamburger) -->
      @if (name === 'menu') {
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
      }

      <!-- X / Close -->
      @if (name === 'x') {
        <line x1="18" x2="6" y1="6" y2="18" />
        <line x1="6" x2="18" y1="6" y2="18" />
      }

      <!-- Chevron Up -->
      @if (name === 'chevron-up') {
        <path d="m18 15-6-6-6 6" />
      }

      <!-- Sparkles (AI) -->
      @if (name === 'sparkles' || name === 'ai') {
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        <path d="M19 3v4" />
        <path d="M21 5h-4" />
        <path d="M5 19v2" />
        <path d="M6 20H4" />
      }

      <!-- Copy -->
      @if (name === 'copy') {
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      }

      <!-- Refresh / Rotate-cw -->
      @if (name === 'refresh' || name === 'rotate-cw') {
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
      }

      <!-- Book Open -->
      @if (name === 'book-open') {
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      }

      <!-- Lightbulb -->
      @if (name === 'lightbulb') {
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      }

      <!-- Building -->
      @if (name === 'building') {
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="M12 6h.01" />
        <path d="M12 10h.01" />
        <path d="M12 14h.01" />
        <path d="M16 10h.01" />
        <path d="M16 14h.01" />
        <path d="M8 10h.01" />
        <path d="M8 14h.01" />
      }
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `],
})
export class IconComponent {
  @Input() name: string = 'briefcase';
  @Input() size: number = 20;
  @Input() cssClass: string = '';
}
