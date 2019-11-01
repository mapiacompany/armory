import { Injectable, ComponentRef, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef, Type } from '@angular/core';
import { DialogComponent } from './dialog.component';
import { DialogRef } from './dialog-ref';
import { DialogConfig } from './dialog-config';
import { DialogInjector } from './dialog-injector';

@Injectable()
export class DialogService {
  dialogComponentRef: ComponentRef<DialogComponent>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) { }

  open(componentType: Type<any>, config: DialogConfig<any> = {}) {
    const dialogRef = this.appendDialogComponentToBody(config);
    this.dialogComponentRef.instance.childComponentType = componentType;
    return dialogRef;
  }

  private appendDialogComponentToBody(config: DialogConfig<any>) {
    const weakmap = new WeakMap();
    weakmap.set(DialogConfig, config);

    const dialogRef = new DialogRef();
    weakmap.set(DialogRef, dialogRef);

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(DialogComponent);
    const componentRef = componentFactory.create(new DialogInjector(this.injector, weakmap));
    this.appRef.attachView(componentRef.hostView);

    const domElement = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElement);

    this.dialogComponentRef = componentRef;
    this.dialogComponentRef.instance.onClose$.subscribe(() => {
      this.removeDialogComponentFromBody(componentRef);
    });

    return dialogRef;
  }

  private removeDialogComponentFromBody(componentRef: ComponentRef<DialogComponent>) {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }
}
