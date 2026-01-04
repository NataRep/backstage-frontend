import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Observable, map } from 'rxjs';
import { IconService } from './icons.service';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent implements OnInit {
  private iconService = inject(IconService);
  private sanitizer = inject(DomSanitizer);

  @Input() name!: string;

  svg$!: Observable<SafeHtml>;

  ngOnInit() {
    if (!this.name) return;

    this.svg$ = this.iconService.getIcon(this.name).pipe(
      map(svg => this.sanitizer.bypassSecurityTrustHtml((svg as string)))
    );
  }
}