import { AbstractControl, ValidationErrors, Validator } from '@angular/forms';
import { AbstractControlValueAccessor } from './control-value-accessor';

export abstract class AbstractControlValueAccessorV2<T = any> extends AbstractControlValueAccessor implements Validator {
  disabled: boolean;

  // tslint:disable-next-line:no-empty
  onValidatorChange: () => void = () => {
  };

  // tslint:disable-next-line:no-empty
  onChange: (value: T) => void = () => {
  };
  // tslint:disable-next-line:no-empty
  onTouched: () => void = () => {
  };

  registerOnChange(fn: any): void {
    this.onChange = () => {
      fn();
      this.onValidatorChange();
    };
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

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return undefined;
  }
}

