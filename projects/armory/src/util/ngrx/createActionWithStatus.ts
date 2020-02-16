import { ActionReducer, createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { AsyncStatus } from '../async-status';
import { createActionExtend } from './createActionExtend';
import { NonPropsActionCreator, PropsActionCreator, PropsType } from './createActionWithDispatch';

// tslint:disable-next-line:no-empty-interface
export interface AsyncStatusState {
}

export function createAsyncStatusReducer(...actions: ActionsWithStatusReturnTypes<any, any, any>[]): ActionReducer<AsyncStatusState> {
  return createReducer(
    {},
    ...actions.reduce((res, action) => [...res, ...action.on], [])
  );
}

export interface ActionsWithStatusReturnTypes<B, S, F> {
  BEGIN: B;
  SUCCESS: S;
  FAILURE: F;
  on: any[];
  status: any;
}

export const selectAsyncStatusFeature = createFeatureSelector<AsyncStatusState>('asyncStatus');

/**
 * @example
 *
 * const loadRoomId = createActionWithStatus({
 *    type: '[message] load room info',
 *    begin: props<{ userId: number }>(),
 *    success: props<{ userId: number, result: any }>(),
 *    failure: props<{ userId: number, result: any }>()
 * });
 *
 * loadRoomId.on 을 ngrx global state에 선언해주고,
 * this.store.select(loadRoomId.status) 를 이용하면 됩니다.
 *
 * begin, success, failure props를 넘길지 안넘기는지에 따라 자동으로 힌팅이 되도록 하기 위해
 * B, S, F 타입에 대한 모든 return type을 명시해주었습니다.
 */
export function createActionWithStatus(data: {
  type: string
}): ActionsWithStatusReturnTypes<NonPropsActionCreator, NonPropsActionCreator, NonPropsActionCreator>;
export function createActionWithStatus<S extends object>(data: {
  type: string,
  success: PropsType<S>
}): ActionsWithStatusReturnTypes<NonPropsActionCreator, PropsActionCreator<S>, NonPropsActionCreator>;
export function createActionWithStatus<S extends object, F extends object>(data: {
  type: string,
  success: PropsType<S>,
  failure: PropsType<F>
}): ActionsWithStatusReturnTypes<NonPropsActionCreator, PropsActionCreator<S>, PropsActionCreator<F>>;
export function createActionWithStatus<B extends object>(data: {
  type: string,
  begin: PropsType<B>
}): ActionsWithStatusReturnTypes<PropsActionCreator<B>, NonPropsActionCreator, NonPropsActionCreator>;
export function createActionWithStatus<B extends object, S extends object>(data: {
  type: string,
  begin: PropsType<B>,
  success: PropsType<S>
}): ActionsWithStatusReturnTypes<PropsActionCreator<B>, PropsActionCreator<S>, NonPropsActionCreator>;
export function createActionWithStatus<B extends object, S extends object, F extends object>(data: {
  type: string,
  begin: PropsType<B>,
  success: PropsType<S>,
  failure: PropsType<F>
}): ActionsWithStatusReturnTypes<PropsActionCreator<B>, PropsActionCreator<S>, PropsActionCreator<F>>;
/**
 * @leo6104(허상민)님이 직접 만든 함수입니다.
 *
 * @version 20191015
 *
 * @description
 * do, success, failure 3개 액션으로 이루어진 effects action들을 만들 때 유용합니다.
 */
export function createActionWithStatus<B extends object, S extends object, F extends object>(data: {
  type: string,
  begin?: PropsType<B>,
  success?: PropsType<S>,
  failure?: PropsType<F>
}) {
  const { type } = data;
  const result = {
    ...createActionExtend(data),
    on: [],
    status: createSelector(selectAsyncStatusFeature, (state: AsyncStatusState) => {
      if (!state) {
        throw new Error(
          type + ' effect의 async state를 가져오지 못했습니다. \n' +
          '@mapiacompany/armory의 AsyncState를 ngrx 모듈에 구현했는지 확인해주세요.'
        );
      }
      return state[type] || AsyncStatus.INITIAL;
    })
  };
  result.on = [
    on(result.BEGIN, (state: AsyncStatusState) => {
      return { ...state, [type]: AsyncStatus.PENDING };
    }),
    on(result.SUCCESS, (state: AsyncStatusState) => {
      return { ...state, [type]: AsyncStatus.FULFILLED };
    }),
    on(result.FAILURE, (state: AsyncStatusState) => {
      return { ...state, [type]: AsyncStatus.REJECTED };
    })
  ];
  return result;
}
