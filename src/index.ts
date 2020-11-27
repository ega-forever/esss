import BN from 'bn.js';
import { split, join } from './esss';
import { generateSafeKeyPair } from './utils';

const maxPeers = 10;

const m = Math.floor(3 + Math.random() * (maxPeers - 3));
const n = Math.floor(2 + Math.random() * (m -3));

console.log(`chosen m: ${m}`);
console.log(`chosen n: ${n}`);

const keyPair0 = generateSafeKeyPair();
console.log(`privateKey[0]: ${ keyPair0.privateKey }`);

const keys = new Array(m).fill(null).map(() => generateSafeKeyPair());

const startSplit = Date.now();
const sh = split(keyPair0.privateKey, n, keys.map(k => k.publicKey));
console.log(`split in ${ Date.now() - startSplit }ms`);

const signedData = sh.map((part, i) => {
  const sig = new BN(keys[i].privateKey, 'hex').mul(new BN(part[0], 'hex')).toString('hex');
  return [
    sig,
    part[1]
  ];
});

const startJoin = Date.now();
const restored = join(signedData.slice(0, n));
console.log(`joined in ${ Date.now() - startJoin }ms`);

console.log('----');
console.log(`is equal: ${ restored === keyPair0.privateKey }`);
