import { bcs } from '@mysten/sui/bcs';
import { toHex } from '@mysten/sui/utils';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { keyPair } from './utils';

const MessageStruct = bcs.struct('Message', {
  pool: bcs.Address,
  amount: bcs.U64,
  nonce: bcs.U64,
  sender: bcs.Address,
});

(async () => {
  const message = MessageStruct.serialize({
    pool: normalizeSuiAddress('0x2'),
    amount: 123,
    nonce: 1,
    sender: keyPair.toSuiAddress(),
  }).toBytes();

  console.log({
    message: toHex(message),
    signature: toHex(await keyPair.sign(message)),
    publicKey: toHex(keyPair.getPublicKey().toRawBytes()),
    suiAddress: keyPair.toSuiAddress(),
  });
})();
