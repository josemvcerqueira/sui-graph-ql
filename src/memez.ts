import { InterestCurve } from '@interest-protocol/interest-aptos-curve';
import { log } from './utils';

const interestCurve = new InterestCurve();

(async () => {
  const result = await interestCurve.wrapCoins({
    coinTypes: ['0x1::aptos_coin::AptosCoin'],
    amounts: [1000000000000000000n],
    recipient:
      '0xbc0fb2558938521434dd528427e9585c420af83b44277b325fe8a2987c897b15',
  });

  log(result);
})();
