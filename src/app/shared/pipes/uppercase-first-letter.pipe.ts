import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'upperFirstLetter',
  standalone: true
})
export class UppercaseFirstLetter implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    return value[0].toLocaleUpperCase() + value.slice(1)
  }
}