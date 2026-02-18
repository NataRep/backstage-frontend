import { Pipe, PipeTransform } from "@angular/core";
import { SocialLink } from "../../core/models/interfaces/person.model";

@Pipe({ name: 'getSocialLink', standalone: true })
export class GetSocialLinkPipe implements PipeTransform {
  transform(links: SocialLink[] | undefined, type: string): string {
    return links?.find(l => l.type === type)?.link || '';
  }
}