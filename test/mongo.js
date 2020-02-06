/* eslint-disable no-undef */

const seed = [
  {
    _id: '5e3b107f226ca26385164b5b', reserve: '0xdd974D5C2e2928deA5F71b9825b8b646686BD200', liquidityRate: 0.002656211973886328, stableBorrowRate: 3.2037087924795813, variableBorrowRate: 0.16296703398366497, variableBorrowIndex: '1000067334716458781626485248', liquidityIndex: '1000016115361868887533139942', created: '2020-02-05T18:59:11.467Z', duration: 1,
  },
  {
    _id: '5e3b10af36507a6679d0a08f', reserve: '0xdAC17F958D2ee523a2206206994597C13D831ec7', liquidityRate: 17.536123253280063, stableBorrowRate: 35.878508299406725, variableBorrowRate: 20.315423582838935, variableBorrowIndex: '1004881007228017037250452658', liquidityIndex: '1003733641039625021690250822', created: '2020-02-05T18:59:59.283Z', duration: 1,
  },
  {
    _id: '5e3b10af36507a6679d0a090', reserve: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', liquidityRate: 6.7828692170385025, stableBorrowRate: 23.907205683956814, variableBorrowRate: 8.339338069964011, variableBorrowIndex: '1004996935541796041756779407', liquidityIndex: '1004047171300108328331286850', created: '2020-02-05T18:59:59.285Z', duration: 1,
  },
  {
    _id: '5e3b111e8ee43966fd79cca6', reserve: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F', liquidityRate: 2.4826681090627805, stableBorrowRate: 3.986757215688983, variableBorrowRate: 7.78410865882678, variableBorrowIndex: '1010712276501306831108121395', liquidityIndex: '1007169803497128299524733588', created: '2020-02-05T19:01:50.356Z', duration: 1,
  },
  {
    _id: '5e3b1256336ec66875e40a8d', reserve: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', liquidityRate: 0.15833917220273164, stableBorrowRate: 4.2240056273773385, variableBorrowRate: 0.9792045019018705, variableBorrowIndex: '1000674806365909927776717795', liquidityIndex: '1000143153591729758447414445', created: '2020-02-05T19:07:02.037Z', duration: 1,
  },
  {
    _id: '5e3b126a336ec66875e40a8e', reserve: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51', liquidityRate: 3.182281991010142, stableBorrowRate: 15.820439650180488, variableBorrowRate: 4.5201256143372825, variableBorrowIndex: '1002440890472367037275370868', liquidityIndex: '1001314002499602415051794820', created: '2020-02-05T19:07:22.029Z', duration: 1,
  },
  {
    _id: '5e3b16cee55fe3742aabd56a', reserve: '0x514910771AF9Ca656af840dff83E8264EcF986CA', liquidityRate: 0.000009108614574692, stableBorrowRate: 3.011856521361631, variableBorrowRate: 0.009485217089304845, variableBorrowIndex: '1000314476702036175300269940', liquidityIndex: '1000021132873786359697721800', created: '2020-02-05T19:26:06.130Z', duration: 1,
  },
];

if (typeof module !== 'undefined') module.exports = seed;
if (typeof db !== 'undefined') {
  seed.forEach((item) => db.events.insert(item));
}
