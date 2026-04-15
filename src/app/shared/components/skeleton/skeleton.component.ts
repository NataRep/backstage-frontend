import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonComponent {
  @Input() type: 'text' | 'circle' | 'rect' = 'text';
  @Input() width = '100%';
  @Input() height = '1rem';
  @Input() borderRadius = '0.25rem';
}
