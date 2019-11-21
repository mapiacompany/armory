import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[armInsertion]'
})
export class InsertionDirective {

  constructor(
    public viewContainerRef: ViewContainerRef
  ) { }

}
