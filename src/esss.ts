import BN from 'bn.js';
import { ec as EC } from 'elliptic';
import { pointToPublicKey, pubKeyToPoint } from './utils';
import bigInt from 'big-integer';

const ec = new EC('secp256k1');

const prime = ec.n;

export const split = (secret, needed, publicKeys: string[]) => {
  const coef = [new BN(secret, 16)];
  const shares = [];
  for (let c = 1; c <= needed; c++) {
    coef[c] = new BN(bigInt.randBetween(bigInt(0), bigInt(prime.sub(new BN(1)), 16)).toString(16), 'hex');
  }

  for (let publicKey of publicKeys) {
    let y = coef[0];
    let xCoef = new BN(bigInt.randBetween(bigInt(0), bigInt(prime.sub(new BN(1)), 16)).toString(16), 'hex');
    const xC = new BN(
      pointToPublicKey(
        pubKeyToPoint(Buffer.from(publicKey, 'hex')).mul(xCoef)
      ).toString('hex'), 'hex');

    for (let exp = 1; exp < needed; exp++) {
      let ss = coef[exp].mul(xC.pow(new BN(exp)));
      y = y.add(ss);
    }

    y = y.toString('hex'); //it's bn
    xCoef = xCoef.toString('hex');
    shares.push([xCoef, y]);
  }

  return shares;
}

/* Gives the multiplicative inverse of k mod prime.  In other words (k * modInverse(k)) % prime = 1 for all prime > k >= 1  */
const modInverse = (k) => {
  k = k.mod(prime);
  const isKNeg = k.lt(new BN(0));
  let r = new BN(prime).egcd(new BN(isKNeg ? k.mul(new BN(-1)) : k)).b;

  if (isKNeg) {
    r = r.mul(new BN(-1));
  }

  return r.add(prime).mod(prime);
}

export const join = (shares) => {
  let accum = new BN(0);
  for (let k = 0; k < shares.length; k++) {
    /* Multiply the numerator across the top and denominators across the bottom to do Lagrange's interpolation
     * Result is x0(2), x1(4), x2(5) -> -4*-5 and (2-4=-2)(2-5=-3), etc for l0, l1, l2...
     */
    let numerator = new BN(1);
    let denominator = new BN(1);
    for (let i = 0; i < shares.length; i++) {
      if (k == i)
        continue; // If not the same value

      const x_k = new BN(pointToPublicKey(ec.g.mul(shares[k][0])).toString('hex'), 'hex');
      const x_i = new BN(pointToPublicKey(ec.g.mul(shares[i][0])).toString('hex'), 'hex');

      numerator = numerator.mul(x_i).mul(new BN(-1)).mod(prime);
      denominator = denominator.mul(x_k.sub(x_i)).mod(prime);
    }

    accum = accum.add(
      new BN(shares[k][1], 'hex')
        .mul(numerator)
        .mod(prime)
        .add(prime)
        .mod(prime)
        .mul(modInverse(denominator))
        .mod(prime)
        .add(prime)
        .mod(prime)
    )
      .mod(prime)
      .add(prime)
      .mod(prime);

    //   (prime + accum + (shares[k][1] * numerator * modInverse(denominator))) % prime;
  }

  return accum.toString('hex');
}
