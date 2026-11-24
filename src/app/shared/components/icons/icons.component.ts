import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { EMPTY, map, switchMap } from 'rxjs';
import { IconService } from './icons.service';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  private iconService = inject(IconService);
  private sanitizer = inject(DomSanitizer);

  name = input<string>();

  svg = toSignal(
    toObservable(this.name).pipe(
      switchMap((name) =>
        name
          ? this.iconService
            .getIcon(name)
            .pipe(map((svg) => this.sanitizer.bypassSecurityTrustHtml(svg as string)))
          : EMPTY
      )
    )
  );
}