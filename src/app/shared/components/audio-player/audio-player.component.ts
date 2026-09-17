import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  ViewChild,
} from '@angular/core';
import { MediaMetadata } from '../../../core/models/interfaces/show.model';
import { AudioDurationPipe } from '../../pipes/audio-duration.pipe';
import { FileSizePipe } from '../../pipes/file-size.pipe';
import { IconComponent } from '../icons/icons.component';

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [IconComponent, AudioDurationPipe, FileSizePipe],
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPlayerComponent {
  @Input({ required: true }) meta!: MediaMetadata;
  @ViewChild('audio') audio!: ElementRef<HTMLAudioElement>;

  http = inject(HttpClient);

  audioState: AudioState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
  };

  setAudioState() {
    this.audioState = {
      isPlaying: this.isPlaying,
      currentTime: this.audioCurrentTime,
      duration: this.audioDuration,
      volume: this.audioVolume,
    };

    console.log(this.audioState);
  }

  onPlay(): void {
    this.audioState = {
      ...this.audioState,
      isPlaying: true,
    };
  }

  onPause(): void {
    this.audioState = {
      ...this.audioState,
      isPlaying: false,
    };
  }

  onVolumeChange(): void {
    this.audioState = {
      ...this.audioState,
      volume: this.audioVolume,
    };
  }

  onTimeupdate(): void {
    this.audioState = {
      ...this.audioState,
      currentTime: this.audioCurrentTime,
    };
  }

  async togglePlay() {
    if (this.audio.nativeElement.paused) {
      await this.audio.nativeElement.play();
    } else {
      this.audio.nativeElement.pause();
    }
  }

  downloadTrack(url: string, fileName = 'track.mp3'): void {
    this.http.get(url, { responseType: 'blob' }).subscribe((blob) => {
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = objectUrl;
      link.download = fileName;

      link.click();

      URL.revokeObjectURL(objectUrl);
    });
  }

  onSetProgress(event: Event) {
    const newCurrentTime =
      (this.audioState.duration / 100) * +(event.target as HTMLInputElement).value;

    this.audio.nativeElement.currentTime = newCurrentTime;
  }

  get isPlaying() {
    return !this.audio.nativeElement.paused;
  }

  get audioCurrentTime() {
    return this.audio.nativeElement.currentTime;
  }

  get audioDuration() {
    return this.audio.nativeElement.duration;
  }

  get audioVolume() {
    return this.audio.nativeElement.volume;
  }

  get progress(): number {
    if (!this.audioState.duration) {
      return 0;
    }

    return (this.audioState.currentTime / this.audioState.duration) * 100;
  }
}
