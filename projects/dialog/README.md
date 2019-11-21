# ngx-dialog

Open dialog modal page with component page or template.



## API

#### DialogService

```typescript
open(componentType: Type<any>, config: DialogConfig<any> = {})
```

Modal dialog open api.

###### Template open

- ```this.dialogService.open(templateContent);```

###### Component open

- ```this.dialogService.open(contentComponent);```



#### DialogConfig

```typescript
export class DialogConfig<D = any> {
  data?: D;
  size?: 'sm' | 'md' | 'lg' | 'full';
  width?: string;
  height?: string;
  closeButton?: boolean;
  fade?: boolean;
  backDrop?: boolean;
}
```

###### dialog config options ```optional```

- ``` data: any```

  User custom dialog initial data

- ```size: 'sm' | 'md' | 'lg' | 'full'```

  Dialog width option (%)

- ```width: string```

  Dialog width option css type (ex: '200px', '100vw', '23%')

- ```height: string```

  Dialog height option css type (ex: '200px', '100vh')

- ```closeButton: boolean```

  X close button option at right top side

- ```fade: boolean```

  Fade in, fade out option when dialog appear, disappear

- ```backDrop: boolean```

  Dialog close option when background click

- ```accessibility: boolean```

  Keyboard input option (ex: 'Escape' key close)



#### DialogRef

```typescript
close(result?: any)
```

Close current dialog

- ```this.dialogRef.close();```



## Example

```...module.ts```

```typescript
import { DialogModule } from '@mapiacompany/ngx-dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    ...,
    AppDialogComponent
  ],
  imports: [
    ...,
    DialogModule,
    BrowserAnimationsModule
  ],
  entryComponents: [
    AppDialogComponent // dialog content component
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
```



```...component.html```

```html
<button type="button" (click)="openTemp(content)">Dialog template OPEN!</button>
<button type="button" (click)="openComp(content)">Dialog component OPEN!</button>
<ng-template #content>
  <div style="text-align:center; height: 200px;">
    <h1>template!!</h1>
    <button (click)="close()">Dialog CLOSE!</button>
  </div>
</ng-template>

```

```...component.ts```

```typescript
export class AppComponent implements OnInit {
  private dialogRef: DialogRef;

  constructor(
    private dialogServ: DialogService,
  ) { }

  // open dialog with template 
  openTemp(content) {
    this.dialogRef = this.dialogServ.open(content, { backDrop: true, fade: true });
  }

  // open dialog with component
  openComp() {
    this.dialogRef = this.dialogServ.open(
      AppDialogComponent, 
      { data: { title: 'COMPONENT'}, backDrop: false, fade: true }
    );

    this.dialogRef.afterClosed$.subscribe(result => {
      console.log('Dialog closed', result);
    });
  }

  closeTemp() {
    this.dialogRef.close();
  }
  
  ngOnInit() { }
}

```



```dialog page ...component.html```

```html
<div style="text-align:center; height: 200px;">
  <h1>{{title}}</h1>
  <button (click)="close()">Dialog CLOSE!</button>
</div>
```

```dialog page ...component.ts```

```
export class AppDialogComponent implements OnInit {

  title: string;

  constructor(
    private dialogOpt: DialogConfig,
    private dialogRef: DialogRef
  ) {
  }

  close() {
    this.dialogRef.close({ result: 'component close.' });
  }

  ngOnInit() {
    this.title = this.dialogOpt.data.title;
  }
}
```

