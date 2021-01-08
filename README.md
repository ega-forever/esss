# ESSS

[![Build Status](https://www.travis-ci.com/ega-forever/esss.svg?branch=master)](https://travis-ci.com/ega-forever/esss)

Elliptic SSS scheme implementation in Node.js.

algorithm features
* use secp256k1 to restore secret
* each share can be signed with the corresponding private key

## Description
The ESSS scheme is an extended version of SSS (Shamir Shared Secret) scheme, which use elliptic curve properties for making sure,
that only certain private key owners are able to restore the secret.

## How does it work?
The original algorithm is based on polynomial interpolation, where we have to find (x0, y0). The ```x0 = 0```, and ```y0 = secret```. 
In ESSS scheme, each peer should have its own private and public keys. The workflow looks like so:
1) during split phase, the peer should provide all involved public keys with restoration factor (m, in m-of-n)
2) the result of the split is an [xCoef, y] for each peer (each will have its own pair). 
3) each peer should receive its own [xCoef, y]
4) To restore the secret, m of n peers should sign the xCoef with their private key
5) the next step is to exchange with [signature, y].
6) the last step is to restore the secret from m shares

## Explanation

During the split phase, algorithm generates a random xCoef for each provided public key. The xCoef should belong to prime: ```xCoef <= prime```.

Then the algorithm calculates the ```x``` coordinate: ```xCoef * publicKey[i]```, where ```publicKey[i]``` - is an `i` public key of provided public keys array.

M-of-n peers should sign the ```xCoef```: ```signature = xCoef * privateKey```.

During the restoration phase, the algorithm calculates the initial ```x``` coordinate as: ```x = signature * G```.

By knowing m-of-n shares, the algorithm restores initial secret through interpolation.

The proof: ```xCoef * publicKey = xCoef * privateKey * G = signature * G```

## Installation

### Via npm
```bash
$ npm install esss --save
```

### From repo
```bash
$ npm run build
```


## API

### esss.split(secret: string, needed: number, publicKeys: string[]): Array<[string, string]>

Arguments:
* `secret` - the source secret, which should be split. Make sure, that secret doesn't start from `0` - otherwise it will be wiped during restoration.
* `needed` - how many keys required for restoration (m, m-of-n)
* `publicKeys` - all involved public keys 

Return: `Array<[string, string]>`, where each element of array is [xCoef, y], which should be distributed to the certain peer.
The publicKey index is the same as index of [xCoef, y] (so it returns in the same order as publicKeys were provided).

### esss.sign(share: string, privateKey: string): string

Arguments:
* `share` - the y coordinate (which is also known as share)
* `privateKey` - peer's private key

Return: signature, which is `string`. 

### esss.partialValidate(xCoef: string, publicKey: string, signature: string): boolean

An optional step to validate the signature of the certain peer

Arguments:
* `xCoef` - the peer's ```xCoef```
* `publicKey` - peer's public key
* `signature` - peer's signature for provided ```xCoef```

Return: `boolean`. If signature valid returns `true` otherwise - `false`

### esss.join(shares: Array<[string, string]>): string

Arguments:
* `Array<[string, string]>` - array of [signature, share]

Return: `string`. Should return the secret

### esss.utils.generateSafeKeyPair(): { privateKey: string, publicKey: string }

Should generate the safe keypair. The safe means that private key doesn't start with `0`.
It's important since algorithm works with bigNumbers and this 0 can be wiped during convertation process.

Return: `{ privateKey: string, publicKey: string }` - should return the keyPair.

## Example
Please check out test files for example.

## Running test

```bash
$ npm run test
```

# Copyright

Copyright (c) 2020-2021 Egor Zuev
