import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'declension',
  standalone: true
})
export class DeclensionPipe implements PipeTransform {

  /**
   * Склоняет слова в зависимости от числа
   * @param value Число
   * @param words Массив из 3-х форм: ['артист', 'артиста', 'артистов']
   */
  transform(value: number, words: [string, string, string]): string {
    const absValue = Math.abs(value);
    const lastDigit = absValue % 10;
    const lastTwoDigits = absValue % 100;

    if (lastTwoDigits > 10 && lastTwoDigits < 20) {
      return words[2];
    }
    if (lastDigit > 1 && lastDigit < 5) {
      return words[1];
    }
    if (lastDigit === 1) {
      return words[0];
    }
    return words[2];
  }
}