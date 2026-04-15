import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'socialLink',
  standalone: true
})
export class SocialLinkPipe implements PipeTransform {
  transform(value: string, type: string): string {
    if (!value) return '#';

    switch (type.toLowerCase()) {
      case 'telegram':
        return `https://t.me/${value.replace('@', '')}`;
      case 'whatsapp':
        return `https://wa.me/${value.replace('+', '')}`;
      case 'vk':
        return `https://vk.com/${value}`;
      case 'email':
        return `mailto:${value}`;
      case 'phone':
        let tel = value.trim();
        if (tel.startsWith('+')) {
          tel = '+' + tel.substring(1).replace(/\D/g, '');
        } else {
          tel = tel.replace(/\D/g, '');
        }
        return `tel:${tel}`;
      default:
        return '#';
    }
  }
}