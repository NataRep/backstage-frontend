import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class StringTruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit = 100, ellipsis = '...'): string {
    if (!value) return '';
    if (value.length <= limit) return value;

    return value.slice(0, limit).trimEnd() + ellipsis;
  }
}