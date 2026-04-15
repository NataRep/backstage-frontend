import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../icons/icons.component';

export interface TabItem {
  label: string;
  link: string;
  icon: string;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent {
  @Input() tabs: TabItem[] = [];

  private router = inject(Router);

  isActive(link: string): boolean {
    return this.router.url.includes(link);
  }
}
