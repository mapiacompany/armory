import { ChangeDetectorRef, Inject, Pipe } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TRANSLATE_PREFIX } from './token';

@Pipe({
  name: 'translateExt',
  pure: false // required to update the value when the promise is resolved
})
export class TranslateExtendPipe extends TranslatePipe {
  constructor(
    translate: TranslateService,
    _ref: ChangeDetectorRef,
    @Inject(TRANSLATE_PREFIX) public prefix: string
  ) {
    super(translate, _ref);
  }

  transform(query: string, ...args: any[]): any {
    if (!query || query.length === 0) {
      return query;
    }

    return super.transform(this.prefix + '.' + query, ...args);
  }
}
