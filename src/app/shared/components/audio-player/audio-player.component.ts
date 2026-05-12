import { HttpClient } from '@angular/common/http';
import { Component, inject, Input } from '@angular/core';
import { MediaMetadata } from '../../../core/models/interfaces/show.model';
import { IconComponent } from '../icons/icons.component';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.scss'
})
export class AudioPlayerComponent {
  @Input({ required: true }) meta!: MediaMetadata;

  http = inject(HttpClient);

  downloadTrack(url: string, fileName = 'track.mp3'): void {
    this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = objectUrl;
      link.download = fileName;

      link.click();

      URL.revokeObjectURL(objectUrl);
    });
  }

}
