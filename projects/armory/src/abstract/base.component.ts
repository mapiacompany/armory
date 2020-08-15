import { Directive, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class AbstractBaseComponent implements OnDestroy {
  /**
   * @deprecated
   * @internal
   */
  _sub: Subscription[] = [];

  ngOnDestroy(): void {
    if (this._sub) {
      this._sub.forEach(sub => sub.unsubscribe());
    }
  }

  subscribeOn(obs$: Observable<any>): Subscription;
  subscribeOn(obs$: Observable<any>, ...observables$: Observable<any>[]): Subscription[];
  subscribeOn(...observables$: Observable<any>[]): Subscription[] | Subscription {
    const subs = observables$.map(obs => obs.subscribe());
    this._sub.push(...subs);
    return subs.length <= 1 ? subs[0] : subs;
  }
}
