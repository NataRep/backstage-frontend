import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  transform(duration: number): string {
    if (!isNaN(duration)) {
      const allSeconds = Math.floor(duration);
      const hours = Math.floor(allSeconds / 3600);
      const mins = Math.floor((allSeconds % 3600) / 60);
      const seconds = allSeconds % 60;

      const formattedHours = hours > 0 ? hours.toString().padStart(2, '0') : "";
      const formattedSeconds = seconds.toString().padStart(2, '0');
      const formattedMins = mins.toString().padStart(2, '0');

      return `${formattedHours ? formattedHours + ":" : ""}${formattedMins}:${formattedSeconds}`;
    } else {
      return '--';
    }
  }
}
