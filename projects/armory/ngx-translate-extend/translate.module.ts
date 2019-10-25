import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateExtendPipe } from './translate.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateExtendService } from './translate.service';

// @experimental
@NgModule({
  imports: [
    CommonModule,
    TranslateModule
  ],
  providers: [
    TranslateExtendService
  ],
  declarations: [
    TranslateExtendPipe
  ],
  exports: [
    TranslateExtendPipe
  ]
})
export class NgxTranslateExtendModule {
}
