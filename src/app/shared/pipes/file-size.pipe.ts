import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number): string {
    const megabytes = bytes / 1024 / 1024;

    return `${megabytes.toFixed(1)} Mb`;
  }
}