// https://craftsmen.nl/angular-lifehack-reactive-component-input-properties/
// https://stackblitz.com/edit/angular-reactive-component-input-properties?file=app%2Ftimer.component.ts

import { BehaviorSubject, Observable } from 'rxjs';

/**
 * property가 바뀔 때마다 RxJS observable이 돕니다.
 *
 * @Input() product: Product;
 *
 * product$ = observeProperty(this, 'product').pipe(
 *
 * )
 */
export function observeProperty<T, K extends keyof T>(target: T, key: K): Observable<T[K]> {

  const subject = new BehaviorSubject<T[K]>(target[key]);

  Object.defineProperty(target, key, {
    get(): T[K] {
      return subject.getValue();
    },
    set(newValue: T[K]): void {
      if (newValue !== subject.getValue()) {
        subject.next(newValue);
      }
    }
  });

  return subject.asObservable();
}
