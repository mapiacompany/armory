import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class AbstractBaseComponent implements OnDestroy {
  _sub: Subscription[] = [];

  ngOnDestroy(): void {
    if (this._sub) {
      this._sub.forEach(sub => sub.unsubscribe());
    }
  }
}
