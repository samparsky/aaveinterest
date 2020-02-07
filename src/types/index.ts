import { utils } from 'ethers'
export interface ReservesList {
    data: Array<string>, 
    updatedAt: Date
}

export interface ReserveEvent {
    reserve: string,
    liquidityRate: utils.BigNumber, 
    stableBorrowRate: utils.BigNumber, 
    variableBorrowRate: utils.BigNumber,
    liquidityIndex: utils.BigNumber,
    variableBorrowIndex: utils.BigNumber,
    timestamp: number,
    blockNumber: number,
}