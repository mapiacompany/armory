import {
  createActionWithDispatch,
  NonPropsActionCreator,
  PropsActionCreator,
  PropsType
} from './createActionWithDispatch';

export interface ActionsReturnTypes<B, S, F> {
  BEGIN: B;
  SUCCESS: S;
  FAILURE: F;
}

/**
 * @example
 *
 * const loadRoomId = createActionExtend({
 *    type: '[message] load room info',
 *    begin: props<{ userId: number }>(),
 *    success: props<{ userId: number, result: any }>(),
 *    failure: props<{ userId: number, result: any }>()
 * });
 *
 * begin, success, failure props를 넘길지 안넘기는지에 따라 자동으로 힌팅이 되도록 하기 위해
 * B, S, F 타입에 대한 모든 return type을 명시해주었습니다.
 */
export function createActionExtend(data: {
  type: string
}): ActionsReturnTypes<NonPropsActionCreator, NonPropsActionCreator, NonPropsActionCreator>;
export function createActionExtend<S extends object>(data: {
  type: string,
  success: PropsType<S>
}): ActionsReturnTypes<NonPropsActionCreator, PropsActionCreator<S>, NonPropsActionCreator>;
export function createActionExtend<S extends object, F extends object>(data: {
  type: string,
  success: PropsType<S>,
  failure: PropsType<F>
}): ActionsReturnTypes<NonPropsActionCreator, PropsActionCreator<S>, PropsActionCreator<F>>;
export function createActionExtend<B extends object>(data: {
  type: string,
  begin: PropsType<B>
}): ActionsReturnTypes<PropsActionCreator<B>, NonPropsActionCreator, NonPropsActionCreator>;
export function createActionExtend<B extends object, S extends object>(data: {
  type: string,
  begin: PropsType<B>,
  success: PropsType<S>
}): ActionsReturnTypes<PropsActionCreator<B>, PropsActionCreator<S>, NonPropsActionCreator>;
export function createActionExtend<B extends object, S extends object, F extends object>(data: {
  type: string,
  begin: PropsType<B>,
  success: PropsType<S>,
  failure: PropsType<F>
}): ActionsReturnTypes<PropsActionCreator<B>, PropsActionCreator<S>, PropsActionCreator<F>>;
/**
 * @leo6104(허상민)님이 직접 만든 함수입니다.
 *
 * @version 20191015
 *
 * @description
 * do, success, failure 3개 액션으로 이루어진 effects action들을 만들 때 유용합니다.
 * this.store.dispatch 를 매번 해주지 않고, this만 넘기면 알아서 해주도록 하기 위해 아래와 같은 함수를 구현했습니다.
 */
export function createActionExtend<B extends object, S extends object, F extends object>(data: {
  type: string,
  begin?: PropsType<B>,
  success?: PropsType<S>,
  failure?: PropsType<F>
}) {
  const { type, begin, success, failure } = data;
  const successType = type + ' success';
  const failType = type + ' failure';

  return {
    BEGIN: createActionWithDispatch(type, begin),
    SUCCESS: createActionWithDispatch(successType, success),
    FAILURE: createActionWithDispatch(failType, failure)
  };
}
