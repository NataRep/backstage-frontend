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
      case 'phone': {
        const digits = value.replace(/\D/g, '');
        return value.trim().startsWith('+') ? `tel:+${digits}` : `tel:${digits}`;
      }
      default:
        return '#';
    }
  }
}