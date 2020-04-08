import { BehaviorSubject, Subject } from 'rxjs';
import { AsyncStatus } from './async-status';

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

// @deprecated
export function renderPaypalButton(
  elementSelector: string, // 'DOM element 선택자 (ex, #paypal-button-container)'
  env: 'sandbox' | 'production', // 현재 환경이 sandbox인지 production인지
  config: { client_id: { sandbox: string, production: string }, currency: string }, // 환경변수
  loadItems: (() => { name: string, sku: string, price: number }[]), // 판매 상품을 리턴하는 함수
  description?: string
) {
  const status$ = new BehaviorSubject(AsyncStatus.INITIAL);
  const result$ = new Subject<{ paymentID, payerID }>();
  const error$ = new Subject();

  const renderButton = () => {
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
        const totalPrice = items.reduce((res, cur) => res + cur.price, 0);

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
                total: totalPrice, currency: config.currency
              },
              description
            }
          ]
        });
      },

      onCancel: (err) => {
        status$.next(AsyncStatus.REJECTED);
        error$.next(err);
      },

      // onAuthorize() is called when the buyer approves the payment
      onAuthorize: (data, actions) => {
        status$.next(AsyncStatus.FULFILLED);
        result$.next(data);
      }
    }, elementSelector);
  };

  if (typeof paypal === 'undefined') {
    loadScript(
      `https://www.paypalobjects.com/api/checkout.js`,
      renderButton
    );
  } else {
    renderButton();
  }

  return { result$: result$.asObservable(), status$: status$.asObservable(), error$: error$.asObservable() };
}

export function renderPaypalSmartButton(
  elementSelector: string, // 'DOM element 선택자 (ex, #paypal-button-container)'
  env: 'sandbox' | 'production', // 현재 환경이 sandbox인지 production인지
  config: { client_id: { sandbox: string, production: string }, currency: 'USD' | 'JPY' }, // 환경변수
  loadItems: (() => { name: string, sku: string, price: number }[]), // 판매 상품을 리턴하는 함수
  description?: string
) {
  const status$ = new BehaviorSubject(AsyncStatus.INITIAL);
  const result$ = new Subject<{ orderID, payerID }>();
  const error$ = new Subject();

  const renderButton = () => {
    paypal.Buttons({
      createOrder: (data, actions) => {
        status$.next(AsyncStatus.PENDING);

        const items = loadItems();
        const totalPrice = items.reduce((res, cur) => res + cur.price, 0);

        // Set up the transaction
        return actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              value: totalPrice,
              currency: config.currency,
              currency_code: config.currency,
              breakdown: {
                item_total: {
                  currency_code: config.currency,
                  value: totalPrice
                },
              }
            },
            items: items
              .map(({ name, sku, price }) => ({
                name: name.substring(0, 127),
                sku,
                unit_amount: {
                  value: price,
                  currency_code: config.currency
                },
                quantity: 1
              })),
            description
          }]
        });
      },
      onApprove: (data, actions) => {
        status$.next(AsyncStatus.FULFILLED);
        result$.next(data);
      },
      onError: (err) => {
        status$.next(AsyncStatus.REJECTED);
        error$.next(err);
      }
    }).render(elementSelector);
  };

  if (typeof paypal === 'undefined') {
    loadScript(
      `https://www.paypal.com/sdk/js?currency=${config.currency}&client-id=${config.client_id[env]}`,
      renderButton
    );
  } else {
    renderButton();
  }

  return { status$: status$.asObservable(), result$: result$.asObservable(), error$: error$.asObservable() };
}

function loadScript(url, callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.onload = () => callback();
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}
