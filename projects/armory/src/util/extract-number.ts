export function extractNumber(value: any): number {
  // match 함수의 결과가 null이 될 수 있기 때문에 이렇게 구성했습니다.
  return +(((value || '').match(/\d+/g) || []).join([]));
}
