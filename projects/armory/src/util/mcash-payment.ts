import { BehaviorSubject, Observable, of } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { enablePassive } from './event-passive';

declare const document;
declare const window;

const MOB_CASH_GB_DICT = {
  card: 'CN',
  payco: 'MC',
  phone: 'MC',
  gift: 'GM',
  happy: 'HM',
  game: 'GG',
  book: 'GC',
  ra: 'RA'
};

function MCASH_MOBILE_FLAG() {
  const UserAgent = navigator.userAgent;
  // tslint:disable-next-line:max-line-length
  return (UserAgent.match(/iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i) != null
    || UserAgent.match(/LG|SAMSUNG|Samsung/) != null);
}

export function OPEN_MCASH_PAYMENT(
  config: {
    notiEmail: string,
    urls: {
      site?: string,
      noti: string,
      close: string,
      ok: string,
      fail: string
    },
    height: string | number,
    environment?: 'production' | 'stage',
    SVC_IDS: Partial<{
      CN: string,
      MC: string,
      GM: string,
      HM: string,
      GG: string,
      GC: string,
      RA: string,
      [key: string]: string // 미래에 추가 될 새로운 결제 수단을 고려
    }>,
    MOB_CASH_GB_DICT?: { [key: string]: string } // 미래에 추가 될 새로운 결제 수단을 고려
  },
  transaction: {
    method: keyof typeof MOB_CASH_GB_DICT | string,
    uuid: string, // 주문 고유값
    name: string, // 상품명
    userId: string | number,
    price: number,
    formTarget: 'iframe' | 'popup' | 'self',
    iframeName?: string // CALL_TYPE이 'iframe'일 때 유효
    MSTR?: string // 암호화 값
  }
): Observable<boolean> {
  const mobile_flag = MCASH_MOBILE_FLAG();

  const form: HTMLFormElement = document.createElement('form');
  form.name = 'mcashMapiaForm';
  form.acceptCharset = 'UTF-8';
  form.method = 'post';  // Post 방식
  form.action =
    (config.environment !== 'stage')
      ? 'https://mup.mobilians.co.kr/MUP/goMcashMain.mcash'
      : 'https://test.mobilians.co.kr/MUP/goMcashMain.mcash';

  const createInput = (name, value) => {
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  createInput('PAY_MODE', config.environment !== 'stage' ? '10' : '00');
  createInput('HEIGHT', config.height);
  createInput('LOGO_YN', 'N');
  createInput('FOOTER_YN', 'N');

  createInput('Notiemail', config.notiEmail);
  createInput('Siteurl', config.urls.site || document.location.host);
  createInput('Failurl', config.urls.fail);
  createInput('Closeurl', config.urls.close);
  createInput('Notiurl', config.urls.noti);
  createInput('Okurl', config.urls.ok);
  Object.keys(config.SVC_IDS).forEach(method => {
    createInput(method + '_SVCID', config.SVC_IDS[method]);
  });

  const CASH_GB = MOB_CASH_GB_DICT[transaction.method] || (config.MOB_CASH_GB_DICT || {})[transaction.method];
  if (!CASH_GB) {
    throw new Error(`${transaction.method}에 대한 CASH_GB을 알 수 없습니다. \n첫번째 인자에 MOB_CASH_GB_DICT를 설정해주세요.`);
  }
  createInput('CASH_GB', CASH_GB);
  createInput('VER', (transaction.method === 'card') ? 'ALL_NEW' : '');
  createInput('CALL_TYPE', {
    iframe: 'I', popup: 'P', self: 'SELF'
  }[transaction.formTarget]);

  createInput('Prdtnm', transaction.name);
  createInput('Userid', transaction.userId);
  createInput('Prdtprice', transaction.price);
  createInput('Tradeid', transaction.uuid);

  switch (transaction.formTarget) {
    case 'iframe':
      createInput('IFRAME_NAME', transaction.iframeName);
      form.target = transaction.iframeName;
      break;

    case 'self':
      form.target = '_self';
      break;

    case 'popup':
      form.target = 'PAY_WIN';

      let PAY_WIN;
      if (mobile_flag) {
        PAY_WIN = window.open('', 'PAY_WIN', 'fullscreen=yes,toolbar=yes,menubar=yes,scrollbars=no,resizable=no');
        if (!PAY_WIN) {
          alert('브라우저에서 팝업 허용해주셔야 결제 진행이 가능합니다.');
          return of(false);
        }
      } else {
        PAY_WIN = window.open('', 'PAY_WIN', 'width=480,height=620,toolbar=no,menubar=no,scrollbars=no,resizable=yes');
        if (!PAY_WIN) {
          alert('브라우저에서 팝업 허용해주셔야 결제 진행이 가능합니다.');
          return of(false);
        }
        PAY_WIN.opener = self;
      }
      PAY_WIN.focus();
      break;
  }

  const prev: HTMLElement = document.querySelector(`form[name=${form.name}]`);
  if (prev) {
    prev.remove();
  }
  document.body.appendChild(form);
  form.submit();

  const isProcessing$ = new BehaviorSubject<boolean>(true);
  const iframeMessageReader = (e: MessageEvent) => {
    console.log('postMessage', e);
    if (e.data === 'CANCEL_MAPIANIST_PAYMENT' || e.data === 'CANCEL_MCASH_PAYMENT') {
      isProcessing$.next(false);
      isProcessing$.complete();
    }
  };

  return isProcessing$.asObservable().pipe(
    tap((isProcessing) => {
      if (isProcessing) {
        window.addEventListener('message', iframeMessageReader, enablePassive());
      }
    }),
    finalize(() => {
      window.removeEventListener('message', iframeMessageReader);
    })
  );
}
