import { Component, DestroyRef, inject, Input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ShowItem } from '../../../../core/models/interfaces/show.model';
import { selectCanEdit } from '../../../../core/store/auth/auth.selectors';
import { deleteShowAction, deleteShowSuccessAction } from '../../../../core/store/shows/shows.actions';
import { AudioPlayerComponent } from '../../../../shared/components/audio-player/audio-player.component';
import { IconComponent } from '../../../../shared/components/icons/icons.component';
import { ModalContainerComponent } from '../../../../shared/components/modal-container/modal-container.component';
import { ModalAction } from '../../../../shared/components/modal-container/modal.model';
import { SHOW_CATEGORY_RU } from '../../../../shared/constants/texts/common.texts';
import { DeclensionPipe } from '../../../../shared/pipes/declension.pipe';
import { DurationPipe } from '../../../../shared/pipes/duration.pipe';
import { PriceFormatPipe } from '../../../../shared/pipes/price-format.pipe';
import { UppercaseFirstLetter } from '../../../../shared/pipes/uppercase-first-letter.pipe';

@Component({
  selector: 'app-show-item',
  standalone: true,
  imports: [
    RouterLink,
    IconComponent,
    AudioPlayerComponent,
    ModalContainerComponent,
    DeclensionPipe,
    DurationPipe,
    PriceFormatPipe,
    UppercaseFirstLetter,
  ],
  templateUrl: './show-item.component.html',
  styleUrl: './show-item.component.scss',
})
export class ShowItemComponent {
  @Input({ required: true }) show!: ShowItem;
  @Input() type: 'card' | 'row' = 'card';

  private readonly actions = inject(Actions);
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);
  readonly canEdit = this.store.selectSignal(selectCanEdit);

  showTypes = SHOW_CATEGORY_RU;
  isConfirmModalOpen = signal(false);

  constructor() {
    this.initModalsSubscriptions();
  }

  onDelete(): void {
    this.isConfirmModalOpen.set(true);
  }

  handleDeleteAction(action: ModalAction): void {
    console.log("Delete");
    if (action == 'confirm') {
      const id = this.show.id;
      if (id) {
        this.store.dispatch(deleteShowAction({ id }));
      }
    }
  }

  private initModalsSubscriptions(): void {
    this.actions
      .pipe(
        ofType(deleteShowSuccessAction),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.isConfirmModalOpen.set(false);
      });
  }
}