import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceFormat',
  standalone: true
})
export class PriceFormatPipe implements PipeTransform {

  transform(value: number | null | undefined): string {
    if (value == null) return '';

    return new Intl.NumberFormat('ru-RU', {
      maximumFractionDigits: 2
    }).format(value);
  }
}