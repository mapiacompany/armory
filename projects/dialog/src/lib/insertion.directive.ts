import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[mcInsertion]'
})
export class InsertionDirective {

  constructor(
    public viewContainerRef: ViewContainerRef
  ) { }

}
