import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNzI18n, ru_RU } from 'ng-zorro-antd/i18n';
import { DragDropModule } from '@angular/cdk/drag-drop';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideNzI18n(ru_RU),
    importProvidersFrom(DragDropModule)
  ]
};
