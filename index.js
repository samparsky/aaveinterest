const BigNumber = require('bignumber.js');

const y = BigNumber('9298331780700868366622792');
console.log(y.div(new BigNumber(10).pow(27)).toNumber())
