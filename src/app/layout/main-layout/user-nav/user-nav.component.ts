import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, Input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { PAGE_LINKS_LIST } from '../../../core/models/page-links.models';
import { logoutAction } from '../../../core/store/auth/auth.actions';
import { IconComponent } from '../../../shared/components/icons/icons.component';

@Component({
  selector: 'app-user-nav',
  standalone: true,
  imports: [RouterModule, IconComponent],
  templateUrl: './user-nav.component.html',
  styleUrl: './user-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserNavComponent {
  @Input() userName: string[] | undefined = [];

  private store = inject(Store);
  private clickListener?: (event: MouseEvent) => void;
  isOpen = signal(false);
  navList = PAGE_LINKS_LIST;

  constructor(private elementRef: ElementRef) {
    effect(() => {
      if (this.isOpen()) {
        this.addClickListener();
      } else {
        this.removeClickListener();
      }
    });
  }

  toggle(): void {
    this.isOpen.set(!this.isOpen());
  }

  logout() {
    this.store.dispatch(logoutAction());
  }

  private addClickListener(): void {
    this.clickListener = (event: MouseEvent) => {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.isOpen.set(false);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', this.clickListener!);
      document.addEventListener('keydown', this.handleEscape.bind(this));
    }, 0);
  }

  private handleEscape(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.isOpen.set(false);
    }
  }

  private removeClickListener(): void {
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
      document.removeEventListener('keydown', this.handleEscape.bind(this));
    }
  }

  ngOnDestroy(): void {
    this.removeClickListener();
  }
}
