import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
  hasUnsavedChanges: () => boolean;
}

export const pendingChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component?.hasUnsavedChanges()) {
    return confirm('На странице есть несохраненные изменения. Если ее покинуть, они потеряются. Вы уверены?');
  }
  return true;
};