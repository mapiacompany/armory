import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

export abstract class AbstractBaseComponent implements OnDestroy {
  _sub: Subscription[] = [];

  ngOnDestroy(): void {
    if (this._sub) {
      this._sub.forEach(sub => sub.unsubscribe());
    }
  }
}
