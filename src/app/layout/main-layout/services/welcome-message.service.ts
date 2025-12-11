import { Injectable } from '@angular/core';
import { TEXT } from '../../../shared/constants/texts/common.texts';

@Injectable({
  providedIn: 'root'
})
export class WelcomeMessageService {
  message: string = "";
  needShow: boolean = true;
  countShow: number = 0;

  show(userName: string | undefined): void {
    console.log("WelcomeMessageService SHOW");
    if (!this.needShow) {
      return;
    }

    this.message = userName?.trim() ?
      `${userName}, добро пожаловать в "${TEXT.PROJECT_NAME}"!` :
      `Добро пожаловать в "${TEXT.PROJECT_NAME}"`;
    this.countShow++;
  }

  hide(): void {
    this.message = "";
    this.needShow = false;
    console.log("WelcomeMessageService HIDE");
  }

  reset() {
    this.message = "";
    this.needShow = true;
    this.countShow = 0;
  }

}