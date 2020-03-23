import { ActionCreator, createAction, Store } from '@ngrx/store';
import type { NotAllowedCheck, TypedAction } from '@ngrx/store/src/models';

export interface ComponentWithStore {
  store: Store<any>;
}

export type PropsType<P extends object> = {
  _as: 'props';
  _p: P;
} & NotAllowedCheck<P>;

// tslint:disable-next-line:max-line-length
export type PropsActionCreator<P extends object> = ActionCreator<string, (props: P & NotAllowedCheck<P>) => P & TypedAction<string>>;
export type NonPropsActionCreator = ActionCreator<string, () => TypedAction<string>>;

export function createActionWithDispatch(type: string): NonPropsActionCreator;
export function createActionWithDispatch<P extends object>(type: string, data: PropsType<P>): PropsActionCreator<P>;
/**
 * @leo6104(허상민)님이 직접 만든 함수입니다.
 *
 * @version 20200217
 *
 * @description
 *
 * this.store.dispatch(loadRoomId.BEGIN({ userId: 3 })); 를 아래처럼 사용할 수 있게 만들어줍니다.
 * loadRoomId.BEGIN(this, { userId: 3 });
 *
 * this.store.dispatch 를 매번 해주지 않고, this만 넘기면 알아서 해주도록 하기 위해 아래와 같은 함수를 구현했습니다.
 */
export function createActionWithDispatch<P extends object>(type: string, data?: PropsType<P>) {
  const action = createAction(type, data);

  // Function도 object이므로 action.type 으로 접근했을 때 type 값이 나오도록 defineType 호출
  return defineType(
    type,
    (comp: ComponentWithStore, ...args) => {
      // action을 호출할 때 첫번째 인자가 store dispatch하는 인자인 경우에는 action dispatch
      if (comp && comp.store && comp.store.dispatch) {
        comp.store.dispatch(action.call(this, ...args));
      } else {
        return action.call(this, comp, ...args);
      }
    }
  );
}

function defineType<T extends string>(
  type: T,
  action: any
): ActionCreator<T> {
  return Object.defineProperty(action, 'type', {
    value: type,
    writable: false,
  });
}
