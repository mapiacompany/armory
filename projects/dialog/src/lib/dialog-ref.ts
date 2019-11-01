import { Subject, Observable } from 'rxjs';

export class DialogRef {
  private afterClosed = new Subject<any>();
  afterClosed$: Observable<any> = this.afterClosed.asObservable();

  constructor() {}

  close(result?: any) {
    this.afterClosed.next(result);
  }
}
