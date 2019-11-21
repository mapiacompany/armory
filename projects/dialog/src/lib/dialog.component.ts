import { animate, style, transition, trigger, query } from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  OnDestroy,
  Type,
  ViewChild,
  OnInit,
  HostListener
} from '@angular/core';
import { Subject } from 'rxjs';
import { DialogConfig } from './dialog-config';
import { InsertionDirective } from './insertion.directive';
import { DialogRef } from './dialog-ref';

@Component({
  selector: 'arm-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition( 'false => true', [
        query('.overlay, .dialog',  style({ opacity: 0 })),
        query('.overlay', animate('0.1s ease-out', style({ opacity: 1 }))),
        query('.dialog', animate('0.2s ease-out', style({ opacity: 1 }))),
      ]),
      transition( 'true => false', [
        query('.overlay, .dialog', style({ opacity: 1 })),
        query('.dialog', animate('0.2s ease-out', style({ opacity: 0 }))),
        query('.overlay', animate('0.1s ease-out', style({ opacity: 0 }))),
      ])
    ])
  ]
})
export class DialogComponent implements OnInit, AfterViewInit, OnDestroy {
  componentRef: ComponentRef<any>;
  childComponentType: Type<any>;
  fadeStatus = false;

  @ViewChild(InsertionDirective, {static: false})
  insertionPosition: InsertionDirective;

  private readonly onClose = new Subject<any>();
  public onClose$ = this.onClose.asObservable();

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.config.accessiblility) {
      if (event.key === 'Escape') {
        this.close();
      }
    }
  }

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private changeDetectorRef: ChangeDetectorRef,
    public config: DialogConfig,
    private dialogRef: DialogRef
  ) { }

  close() {
    this.fadeStatus = false;
  }

  onOverlayClicked($event) {
    if (this.config.backDrop) { this.close(); }
  }

  onAnimationEvent(event: AnimationEvent) {
    if (!this.fadeStatus) { this.onClose.next(); }
  }

  onDialogClicked(e: MouseEvent) {
    e.stopPropagation();
  }

  loadChildComponent(componentType: Type<any>) {
    const viewContainerRef = this.insertionPosition.viewContainerRef;
    viewContainerRef.clear();

    switch (typeof componentType) {
      case 'object':
        viewContainerRef.createEmbeddedView(componentType);
        break;
      case 'function':
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
        this.componentRef = viewContainerRef.createComponent(componentFactory);
        break;
      default:
    }
  }

  ngOnInit() {
    const sub = this.dialogRef.afterClosed$.subscribe(() => {
      this.close();
      sub.unsubscribe();
    });
  }

  ngAfterViewInit() {
    this.loadChildComponent(this.childComponentType);
    this.fadeStatus = true;

    this.changeDetectorRef.detectChanges(); // last check at afterViewInit
  }

  ngOnDestroy() {
    if (this.componentRef) { this.componentRef.destroy(); }
  }
}
