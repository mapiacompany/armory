export interface AsyncStatusType {
  pending: boolean;
  fulfilled: boolean;
  rejected: boolean;
}

export class AsyncStatus {
  static INITIAL: AsyncStatusType = { pending: false, fulfilled: false, rejected: false };
  static PENDING: AsyncStatusType = { pending: true, fulfilled: false, rejected: false };
  static FULFILLED: AsyncStatusType = { pending: false, fulfilled: true, rejected: false };
  static REJECTED: AsyncStatusType = { pending: false, fulfilled: false, rejected: true };
}
