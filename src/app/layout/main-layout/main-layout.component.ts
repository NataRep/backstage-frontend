import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { selectAuthUser } from '../../core/store/auth/auth.selectors';
import { TEXT } from '../../shared/constants/texts/common.texts';
import { IconComponent } from '../../shared/icons/components/icons/icons.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { MainNavComponent } from './main-nav/main-nav.component';
import { PAGE_LINKS_LIST } from './models/main-layout.models';
import { WelcomeMessageService } from './services/welcome-message.service';
import { UserNavComponent } from './user-nav/user-nav.component';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, IconComponent, MainNavComponent, FooterComponent, UserNavComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private store = inject(Store);
  private router = inject(Router);
  private titleService = inject(Title);
  protected welcomeMessage = inject(WelcomeMessageService);

  user = this.store.selectSignal(selectAuthUser);

  pageTitle = "";
  userName: string = "";
  fullName: string[] = ["", ""];
  TEXT = TEXT;
  dashboard = PAGE_LINKS_LIST.find((item) => item.link === "dashboard");

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.updateTitle();
    });

    this.updateTitle();

    this.store.select(selectAuthUser).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(user => {
      if (user?.personal?.full_name) {
        this.fullName = user.personal.full_name.split(" ");
        this.userName = this.fullName[0] || "";
        this.showWelcomeMessage();
      }
    });
  }

  showWelcomeMessage(): void {
    if (this.welcomeMessage.needShow && this.userName) {
      this.welcomeMessage.show(this.userName);
      this.cdr.detectChanges();

      setTimeout(() => {
        this.welcomeMessage.hide();
        this.cdr.detectChanges();
      }, 3000);
    }
  }

  updateTitle() {
    const route = this.router.url.split('/')[1];
    const title = this.getTitleFromRoute(route);
    this.pageTitle = title;
    this.titleService.setTitle(`${title} | CRM Backspace`);
  }

  getTitleFromRoute(route: string): string {
    return PAGE_LINKS_LIST.find(item => item.link == route)?.title || 'Current Page';
  }
}
