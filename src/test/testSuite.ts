import crypto from 'crypto';
import assert from 'assert';
import { generateSafeKeyPair } from '../lib/utils';
import { join, partialValidate, sign, split } from '../lib/esss';
import * as _ from 'lodash';
import BN from 'bn.js';

interface CTX {
  m: number,
  n: number,
  secret: string,
  keyPairs: Array<{ privateKey: string, publicKey: string }>,
  shares: Array<[string, string]>,
  signedShares: Array<{ x: string, y: string, index: number, xCoef: string }>
}

export function testSuite(m: number, n: number) {

  const ctx: CTX = {
    m,
    n,
    secret: null,
    keyPairs: [],
    shares: [],
    signedShares: []
  }

  before(() => {
    ctx.keyPairs = new Array(m).fill(null).map(() => generateSafeKeyPair());
    ctx.secret = crypto.createHash('sha256')
      .update(`data: ${ Date.now() }`)
      .digest('hex');

    if (ctx.secret.indexOf('0') === 0) {
      ctx.secret = new BN(ctx.secret, 'hex').toString(16);
    }
  });

  it(`should split secret (${ m }-of-${ n })`, () => {
    const startSplit = Date.now();
    ctx.shares = split(ctx.secret, m, ctx.keyPairs.map(k => k.publicKey));
    assert(Date.now() - startSplit < 50 * m);
  });

  it(`should sign random ${ m } parts`, () => {
    const startSign = Date.now();
    ctx.signedShares = _.chain(ctx.keyPairs)
      .map((keyPair, index) => ({
        keyPair,
        index
      }))
      .shuffle()
      .take(m)
      .map((data) => {
        const share = ctx.shares[data.index];
        const signature = sign(share[0], data.keyPair.privateKey);
        return {
          x: signature,
          y: share[1],
          index: data.index,
          xCoef: share[0]
        }
      })
      .value();

    assert(Date.now() - startSign < 50 * m);
  });

  it(`should validate ${ m } parts (optional step)`, () => {
    for (const signedShare of ctx.signedShares) {
      const startValidation = Date.now();
      const isValid = partialValidate(signedShare.xCoef, ctx.keyPairs[signedShare.index].publicKey, signedShare.x);
      assert(isValid && Date.now() - startValidation < 50);
    }
  });

  it(`should merge ${ m } parts`, () => {
    const signedData = ctx.signedShares.map(s => [s.x, s.y]);
    const startJoined = Date.now();
    const joined = join(signedData as any);
    assert(ctx.secret === joined && Date.now() - startJoined < 50 * m);
  });


}
