import { AbstractControl, ValidationErrors, Validator } from '@angular/forms';
import { AbstractControlValueAccessor } from './control-value-accessor';
import { Directive } from '@angular/core';

@Directive()
export abstract class AbstractControlValueAccessorV2<T = any> extends AbstractControlValueAccessor<T> implements Validator {
  // tslint:disable-next-line:no-empty
  onValidatorChange: () => void = () => {};

  registerOnChange(fn: any): void {
    this.onChange = () => {
      fn();
      this.onValidatorChange();
    };
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  abstract validate(control: AbstractControl): ValidationErrors | null;
}

