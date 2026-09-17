import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true,
})
export class AudioDurationPipe implements PipeTransform {
  transform(duration: number): string {
    if (!isNaN(duration)) {
      const allSeconds = Math.floor(duration);
      const mins = Math.floor(allSeconds / 60);
      const seconds = allSeconds % 60;

      const formattedSeconds = seconds.toString().padStart(2, '0');
      const formattedMins = mins.toString().padStart(2, '0');

      return `${formattedMins}:${formattedSeconds}`;
    } else {
      return '--';
    }
  }
}
