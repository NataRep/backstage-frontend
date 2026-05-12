import { Component, Input } from '@angular/core';
import { ShowItem } from '../../../../core/models/interfaces/show.model';
import { AudioPlayerComponent } from '../../../../shared/components/audio-player/audio-player.component';
import { IconComponent } from '../../../../shared/components/icons/icons.component';
import { DeclensionPipe } from '../../../../shared/pipes/declension.pipe';

@Component({
  selector: 'app-show-item',
  standalone: true,
  imports: [IconComponent, DeclensionPipe, AudioPlayerComponent],
  templateUrl: './show-item.component.html',
  styleUrl: './show-item.component.scss'
})
export class ShowItemComponent {
  @Input({ required: true }) show!: ShowItem;
  @Input() type: 'card' | 'row' = 'card';
}
