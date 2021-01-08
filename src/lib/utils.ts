import { ec as EC } from 'elliptic';
import crypto from 'crypto';

const ec = new EC('secp256k1');

export const pubKeyToPoint = (pubKey) => {
  const pubKeyEven = (pubKey[0] - 0x02) === 0;
  return ec.curve.pointFromX(pubKey.slice(1, 33).toString('hex'), !pubKeyEven);
};

export const pointToPublicKey = (P): Buffer => {
  const buffer = Buffer.allocUnsafe(1);
  // keep sign, if is odd
  buffer.writeUInt8(P.getY().isEven() ? 0x02 : 0x03, 0);
  return Buffer.concat([buffer, P.getX().toArrayLike(Buffer)]);
};

export const generateSafeKeyPair = (): { privateKey: string, publicKey: string } => {

  const node = crypto.createECDH('secp256k1');
  node.generateKeys();

  const publicKey = node.getPublicKey('hex', 'compressed');
  const privateKey = node.getPrivateKey().toString('hex');

  if (privateKey.startsWith('0')) {
    return generateSafeKeyPair();
  }

  return {
    privateKey,
    publicKey
  }
}
