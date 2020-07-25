/*
 * KG모빌리언스 Mcash 결제 창을 띄워주는 함수.
 *
 * 리팩토링한 대상 스크립트: https://mup.mobilians.co.kr/js/ext/ext_inc_comm.js
 * 4년동안 한번도 바뀌지 않은 스크립트여서 아래처럼 타입스크립트 버전을 구현했습니다.
 *
 * 모빌리언스 문서에 의하면 https://pg.mcash.co.kr/dlp/js/npgIF.js 도 있지만 실제 결제 과정에서 사용하지 않으므로 로드하지 않음
 *
 * 작성자: Heo Sangmin
 * 업데이트: 2020.01.25
 */

import { BehaviorSubject, Observable, of } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { enablePassive } from './event-passive';

declare const document;
declare const window;

const MOB_CASH_GB_DICT = {
  card: 'CN', // 카드 결제
  payco: 'MC', // 페이코 결제
  phone: 'MC', // 핸드폰 결제
  gift: 'GM', // 문화상품권
  happy: 'HM', // 해피문화상품권
  game: 'GG', // 게임문화상품권
  book: 'GC', // 도서문화상품권
  ra: 'RA', // 실시간 계좌이체
  va: 'VA' // 가상계좌 (무통장입금)
};

function IS_MOBILE() {
  const UserAgent = navigator.userAgent;
  // tslint:disable-next-line:max-line-length
  return (UserAgent.match(/iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i) != null
    || UserAgent.match(/LG|SAMSUNG|Samsung/) != null);
}

/** @deprecated */
export function OPEN_MCASH_PAYMENT(
  config: {
    notiEmail: string, // 결제 알림 받을 URL (결제자 이메일 말고 가맹점 이메일)
    urls: {
      site?: string, // 도메인 주소를 입력해야함
      noti: string, // 결제 성공 시 신호 보낼 API 주소
      close: string, // 모빌리언스측의 결제 취소 버튼 눌렀을 때 이동할 URL (결제자가 보는 화면)
      ok: string, // 결제 성공했을 때 이동할 URL (결제자가 보는 화면)
      fail: string // 결제 실패 시 이동할 URL (결제자가 보는 화면)
    },
    height: string | number, // 결제창 높이
    environment?: 'production' | 'stage', // 설정하지 않았을 때 기본값은 production입니다.
    SVC_IDS: Partial<{
      CN: string,
      MC: string,
      GM: string,
      HM: string,
      GG: string,
      GC: string,
      RA: string,
      VA: string,
      [key: string]: string // 미래에 추가 될 새로운 결제 수단을 고려
    }>,
    MOB_CASH_GB_DICT?: { [key: string]: string }, // 미래에 추가 될 새로운 결제 수단을 고려
    additionalForm?: { [key: string]: string } // 커스텀해서 넣어보고 싶은 입력들
  },
  transaction: {
    method: keyof typeof MOB_CASH_GB_DICT | string,
    uuid: string, // 주문 고유값
    name: string, // 상품명
    userId: string | number,
    price: number, // 가격 (KRW 기준)
    formTarget: 'iframe' | 'popup' | 'self',
    iframeName?: string // CALL_TYPE이 'iframe'일 때 유효
    MSTR?: string // 암호화 값
  }
): Observable<boolean> {
  let PAY_WIN;
  const form: HTMLFormElement = document.createElement('form');
  form.name = 'mcashMapiaForm';
  form.acceptCharset = 'UTF-8';
  form.method = 'post';
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
    if (method === 'HM') {
      // 해피머니 상품권 서비스일 경우에는,
      // 해피머니로 지불할지 모바일팝으로 지불할지를 HM/HP 중에 선택하게 되는데
      // 당사 계약은 무조건 해피머니이므로 이처럼 HM으로 대입
      createInput('HM_SVC_GB', 'HM');
    }
  });

  // MOB_CASH_GB_DICT에서 먼저 찾아보고 없으면 config에서 찾음. config.MOB_CASH_GB_DICT가 설정되어있지 않은 경우도 고려.
  // CASH_GB가 TN일 때에 대한 처리는 되어있지 않으므로 추후에 구현 필요
  // (https://mup.mobilians.co.kr/js/ext/ext_inc_comm.js에 있는데 안쓰는 코드인거같아서 구현하지 않음)
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
  if (transaction.MSTR) {
    createInput('MSTR', transaction.MSTR);
  }

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

      if (IS_MOBILE()) {
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

  // 커스텀 폼 데이터 주입
  if (config.additionalForm) {
    Object.keys(config.additionalForm).forEach(key => {
      createInput(key, config.additionalForm[key]);
    });
  }

  // 결제 시도 -> 취소 -> 결제 시도 하는 경우, 그전에 만들어둔 form 태그때문에 제대로 동작하지 않는 문제가 있어 지우기 작업 진행
  const prev: HTMLElement = document.querySelector(`form[name=${form.name}]`);
  if (prev) {
    prev.remove();
  }
  document.body.appendChild(form);
  form.submit();

  /*
   * BehaviorSubject를 이용해서 첫 stream이 실행되도록 했습니다.
   * isProcessing$가 iframeMssageReader를 등록하고, 삭제하는 과정을 모두 처리할 수 있도록 Rx 파이프를 활용한게 핵심입니다.
   * 리팩토링하더라도 iframeMessageReader에 대한 처리 '책임'을 한 곳에서 제어할 수 있도록 해주면 좋을듯합니다.
   *
   * 결제 과정에서 모빌리언스측 화면에 있는 X (닫기) 버튼을 누르면 config.urls.cancel 로 이동하는데
   * 이 URL로 이동했다는 것을 알아차리기 위해 iframeMessageReader라는 이벤트를 이용합니다.
   * https://developer.mozilla.org/ko/docs/Web/API/Window/postMessage 원리
   *
   * config.urls.cancel에서 보여주는 response가 아래와 같이 postMessage를 호출하면
   * ```javascript
   * if (window.parent && window.parent !== window) {
   *    window.parent.postMessage('CANCEL_MCASH_PAYMENT', '*');
   * }
   * ```
   * iframeMessageReader가 메세지를 받아서 결제가 취소되었다는 stream을 전송하는 방식입니다.
   */
  const isProcessing$ = new BehaviorSubject<boolean>(true);
  const iframeMessageReader = (e: MessageEvent) => {
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
      if (PAY_WIN) PAY_WIN.close();
    })
  );
}
