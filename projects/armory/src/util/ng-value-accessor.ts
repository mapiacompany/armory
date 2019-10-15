import { forwardRef, Provider, Type } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export function getNgValueAccessor(component: Type<any>): Provider {
  return {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => component),
    multi: true,
  };
}
