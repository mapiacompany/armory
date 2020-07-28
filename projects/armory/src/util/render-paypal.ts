import { BehaviorSubject, Subject } from 'rxjs';
import { AsyncStatus } from './async-status';

declare const paypal;

/* 사용 예시

```html
  <div id="paypal-button-container"></div>
```

```typescript
    const { onSuccess$, status$ } = renderPaypalSmartButton(
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

export function renderPaypalSmartButton(
  elementSelector: string, // 'DOM element 선택자 (ex, #paypal-button-container)'
  env: 'sandbox' | 'production', // 현재 환경이 sandbox인지 production인지
  config: { client_id: { sandbox: string, production: string }, currency: 'USD' | 'JPY' }, // 환경변수
  loadItems: (() => { name: string, sku: string, price: number }[]) | { name: string, sku: string, price: number }[], // 판매 상품을 리턴하는 함수
  description?: string
) {
  const status$ = new BehaviorSubject(AsyncStatus.INITIAL);
  const result$ = new Subject<{ orderID, payerID }>();
  const error$ = new Subject();

  const cutNumber = (num: number) => {
    return Math.round(num * 100) / 100;
  };

  const renderButton = () => {
    paypal.Buttons({
      createOrder: (data, actions) => {
        status$.next(AsyncStatus.PENDING);

        let items = typeof loadItems === 'function' ? loadItems() : loadItems;
        if (!items) {
          status$.next(AsyncStatus.REJECTED);
          return Promise.reject();
        }
        items = items.map(item => {
          item.price = cutNumber(item.price);
          return item;
        });

        const totalPrice = cutNumber(
          items.reduce((res, cur) => res + cur.price, 0)
        );

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
          }],
          application_context: {
            shipping_preference: 'NO_SHIPPING'
          }
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
      'armory-paypal-smart-button',
      `https://www.paypal.com/sdk/js?currency=${config.currency}&client-id=${config.client_id[env]}`,
      renderButton
    );
  } else {
    renderButton();
  }

  return { status$: status$.asObservable(), result$: result$.asObservable(), error$: error$.asObservable() };
}

function loadScript(id, url, callback) {
  if (document.getElementById(id)) {
    return;
  }
  const script = document.createElement('script');
  script.id = id;
  script.type = 'text/javascript';
  script.onload = () => callback();
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}
