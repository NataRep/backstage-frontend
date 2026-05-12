import { MediaMetadata, ShowItem, ShowType } from "../../../core/models/interfaces/show.model";
import { RawShowFormValue } from "./show-form.models";

export function mapFormToShowItem(formValue: RawShowFormValue): ShowItem {
  const inventoryRecord: Record<string, number> = {};

  if (formValue.requiredInventory) {
    Object.values(formValue.requiredInventory).forEach((categoryArray) => {
      categoryArray.forEach((item: { id: string | number; count: number | null | undefined; }) => {
        if (item.id && item.count !== null && item.count !== undefined) {
          inventoryRecord[item.id] = item.count;
        }
      });
    });
  }

  const roles = formValue.requiredRoles as unknown as { artist: number; tech: number; fireworker: number };

  return {
    isActive: formValue.isActive ?? false,
    type: (formValue.type as unknown as ShowType) ?? 'welcome',
    title: formValue.title ?? '',
    description: formValue.description ?? '',
    duration: formValue.duration ?? 0,
    price: formValue.price ?? 0,
    requiredRoles: roles,
    requiredInventory: inventoryRecord,
    viewImg: (formValue.viewImg as unknown as MediaMetadata) ?? { name: '', url: '', metadata: { size: 0, format: '' } },
    audio: (formValue.viewImg as unknown as MediaMetadata) ?? { name: '', url: '', metadata: { size: 0, format: '' } },
    comment: formValue.comment ?? ''
  };
}