import { NgModule, ComponentFactoryResolver, ApplicationRef, Injector, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from './dialog.component';
import { InsertionDirective } from './insertion.directive';
import { DialogService } from './dialog.service';

@NgModule({
  declarations: [
    DialogComponent,
    InsertionDirective
  ],
  imports: [
    CommonModule
  ],
  providers: [
    DialogService
  ],
  entryComponents: [DialogComponent]
})
export class DialogModule { }
