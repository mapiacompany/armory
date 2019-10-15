import { ControlValueAccessor } from '@angular/forms';
import { AbstractBaseComponent } from './base.component';

export abstract class AbstractControlValueAccessor<T = any> extends AbstractBaseComponent implements ControlValueAccessor {
  disabled: boolean;

  // tslint:disable-next-line:no-empty
  onChange: (value: T) => void = () => {};
  // tslint:disable-next-line:no-empty
  onTouched: () => void = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // tslint:disable-next-line:no-empty
  writeValue(value: any): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

