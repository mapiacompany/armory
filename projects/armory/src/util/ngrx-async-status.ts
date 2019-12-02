
export class AsyncStatus {
  static INITIAL = { pending: false, fulfilled: false, rejected: false };
  static PENDING = { pending: true, fulfilled: false, rejected: false };
  static FULFILLED = { pending: false, fulfilled: true, rejected: false };
  static REJECTED = { pending: false, fulfilled: false, rejected: true };
}
