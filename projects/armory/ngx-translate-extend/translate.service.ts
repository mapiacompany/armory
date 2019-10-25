import { Inject, Injectable } from '@angular/core';
import { TRANSLATE_PREFIX } from './token';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TranslateExtendService {
  constructor(
    @Inject(TRANSLATE_PREFIX) public prefix: string,
    public translateService: TranslateService
  ) {
  }

  instant(key: string | Array<string>, interpolateParams?: Object): string | any {
    return this.translateService.instant(this.prefix + '.' + key, interpolateParams);
  }
}
