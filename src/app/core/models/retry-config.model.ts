import { InjectionToken } from '@angular/core';
import { RetryConfig } from 'rxjs';

export const APP_RETRY_CONFIG = new InjectionToken<RetryConfig>('WorkerRetryConfig', {
  providedIn: 'root',
  factory: () => ({
    count: 1,
    delay: 2000
  })
});