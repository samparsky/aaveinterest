import lendingPoolAbi from '../../aave-protocol/abi/LendingPoolCore.json'
import { ethers } from "ethers"
import { ReservesList, ReserveEvent } from '../types'
import logger from '../logger'

export default class AaveContract {
    lendingPoolContract: ethers.Contract
    reservesList: ReservesList = { data: [], updatedAt: new Date() }
    provider: ethers.providers.InfuraProvider

    constructor(network: string, contractAddress: string){
        this.provider = new ethers.providers.InfuraProvider(network);
        this.lendingPoolContract = new ethers.Contract(contractAddress, lendingPoolAbi, this.provider);
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

    async listen (processorFn: (data: ReserveEvent) => Promise<void>, blockHeight: number | null) {
        if(!this.lendingPoolContract) throw new Error("please initialize network first")
        this.provider.resetEventsBlock(blockHeight) 

        const queue = require('fastq')(
            (
                {reserve, liquidityRate, stableBorrowRate, variableBorrowRate, liquidityIndex, variableBorrowIndex, event}: any, 
                cb: () => void
            ) => {
                event
                .getBlock()
                .then((block: any) => block.timestamp)
                .then((timestamp: number) => {
                    processorFn({reserve, liquidityRate, stableBorrowRate, variableBorrowRate, liquidityIndex, variableBorrowIndex, timestamp, blockNumber: event.blockNumber})
                    .then(function() {
                        logger('ethereum').info(`Finished processing event for block ${event.blockNumber} and reserve ${reserve}`)
                        cb()
                    })
                })
            }, 
            process.env.NUM_WORKERS || 10
        )

        this.lendingPoolContract.on("ReserveUpdated", (reserve, liquidityRate, stableBorrowRate, variableBorrowRate, liquidityIndex, variableBorrowIndex, event) => {
            queue.push({reserve, liquidityRate, stableBorrowRate, variableBorrowRate, liquidityIndex, variableBorrowIndex, event}, () => {})
        })
    }
}