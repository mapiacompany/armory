import { Directive, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class AbstractBaseComponent implements OnDestroy {
  _sub: Subscription[] = [];

  ngOnDestroy(): void {
    if (this._sub) {
      this._sub.forEach(sub => sub.unsubscribe());
    }
  }

  subscribeOn(...observables$: Observable<any>[]) {
    this._sub.push(...observables$.map(obs => obs.subscribe()));
  }
}
