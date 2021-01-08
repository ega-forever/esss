import { testSuite } from './testSuite';


for(let n = 3; n < 10; n++){
  for(let m = 2; m < n;m++){
    describe(`esss test (${m}-of-${n})`, () => testSuite(m, n));
  }
}
