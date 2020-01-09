import { BehaviorSubject, Subject } from 'rxjs';
import { AsyncStatus } from './ngrx-async-status';

declare const paypal;

/* 사용 예시

```html
  <div id="paypal-button-container"></div>
```

```typescript
    const { onSuccess$, status$ } = renderPaypalButton(
      '#paypal-button-container',
      environment,
      {
        client_id: {
          sandbox: '~~~',
          production: '~~~'
        },
        currency: 'USD'
      },
      () => {
        return [
          {
            name: `캐시`,
            sku: `상품 고유 식별값`,
            price: 1000 // 가격
          }
        ];
      },
      `사용 설명`
    );

    status$.subscribe(status => {
    });

    onSuccess$.subscribe(data => {
    });
```
*/

export function renderPaypalButton(
  elementSelector: string, // 'DOM element 선택자 (ex, #paypal-button-container)'
  env: 'sandbox' | 'production', // 현재 환경이 sandbox인지 production인지
  config: { client_id: { sandbox: string, production: string }, currency: string }, // 환경변수
  loadItems: (() => { name: string, sku: string, price: number }[]), // 판매 상품을 리턴하는 함수
  description?: string
) {
  const status$ = new BehaviorSubject(AsyncStatus.INITIAL);
  const result$ = new Subject<{ paymentID, payerID }>();

  paypal.Button.render({
    env, // sandbox | production

    // PayPal Client IDs - replace with your own
    // Create a PayPal app: https://developer.paypal.com/developer/applications/create
    client: config.client_id,

    // Show the buyer a 'Pay Now' button in the checkout flow
    commit: true,

    // payment() is called when the button is clicked
    payment: (data, actions) => {
      status$.next(AsyncStatus.PENDING);

      const items = loadItems();

      // Make a call to the REST api to create the payment
      return actions.payment.create({
        transactions: [
          {
            item_list: {
              items: items.map(({ name, sku, price }) => {
                return {
                  name, sku, price,
                  currency: config.currency,
                  quantity: 1
                };
              })
            },
            amount: {
              total: items.reduce((res, cur) => res + cur.price, 0), currency: config.currency
            },
            description
          }
        ]
      });
    },

    onCancel: () => {
      status$.next(AsyncStatus.REJECTED);
      result$.complete();
    },

    // onAuthorize() is called when the buyer approves the payment
    onAuthorize: (data, actions) => {
      status$.next(AsyncStatus.FULFILLED);
      result$.next(data);
      result$.complete();
    }
  }, elementSelector);

  return { onSuccess$: result$.asObservable(), status$: status$.asObservable() };
}
