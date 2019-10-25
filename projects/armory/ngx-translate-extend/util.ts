import { TRANSLATE_PREFIX } from './token';
import { Provider } from '@angular/core';

export function setTranslatePrefix(prefix): Provider {
  return {
    provide: TRANSLATE_PREFIX,
    useValue: prefix
  };
}
