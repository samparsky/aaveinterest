import lendingPoolAbi from '../../aave-protocol/abi/LendingPoolCore.json'
import { ethers } from "ethers"
import { ReservesList, ReserveEvent } from '../types'
import logger from '../logger'

export default class AaveContract {
    lendingPoolContract: ethers.Contract
    reservesList: ReservesList = { data: [], updatedAt: new Date() }

    constructor(network: string, contractAddress: string){
        const infuraProvider = new ethers.providers.InfuraProvider(network);
        this.lendingPoolContract = new ethers.Contract(contractAddress, lendingPoolAbi, infuraProvider);
    }

    async initReserves() : Promise<void> {
        if(!this.lendingPoolContract) throw new Error("please initialize network")
        const data = await this.lendingPoolContract.getReserves();
        this.reservesList = { data, updatedAt: new Date() }
    }

    async getReserves() : Promise<ReservesList> {
        if(!this.lendingPoolContract) throw new Error("please initialize network")
        if(!this.reservesList.data.length) throw new Error("please initialize reserves")
        if((this.reservesList.updatedAt.getTime() - (new Date().getTime())) / 3600*1000 > 1 ) {
            // update the reserves list
            // every hour
            await this.initReserves();
        }
    
        return this.reservesList
    }

    async listen (processorFn: (data: ReserveEvent) => Promise<void>) {
        if(!this.lendingPoolContract) throw new Error("please initialize network first")
        this.lendingPoolContract.on("ReserveUpdated", (reserve, liquidityRate, stableBorrowRate, variableBorrowRate, liquidityIndex, variableBorrowIndex, event) => {
            processorFn({reserve, liquidityRate, stableBorrowRate, variableBorrowRate, liquidityIndex, variableBorrowIndex})
            .then(function() {
                logger('ethereum').info(`Finished processing event for block ${event.blockNumber} and reserve ${reserve}`)
            })
        })
    }


}