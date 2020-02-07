import lendingPoolAbi from '../../aave-protocol/abi/LendingPoolCore.json'
import { ethers } from "ethers"
import { ReservesList, ReserveEvent } from '../types'
import logger from '../logger'

export default class AaveContract {
    requestDelay: number = 0;
    network: string
    lendingPoolContract: ethers.Contract
    reservesList: ReservesList = { data: [], updatedAt: new Date() }
    provider: ethers.providers.InfuraProvider

    constructor(network: string, contractAddress: string){
        this.network = network;
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
    
    delay = async (interval: number) => new Promise(resolve => setTimeout(resolve, interval))

    async listen (processorFn: (data: ReserveEvent) => Promise<void>, blockHeight: number | null) {
        if(!this.lendingPoolContract) throw new Error("please initialize network first")
        this.provider.resetEventsBlock(blockHeight) 
        // use 2 workers for mainnet due to infura request rate limit
        // can be improved if a dedicated project is setup
        const workers = this.network == 'mainnet' ? 3 : process.env.NUM_WORKERS || 10
        const logId = `ethereum:${this.network}`
        const queue = require('fastq')(
            (
                {reserve, liquidityRate, stableBorrowRate, variableBorrowRate, liquidityIndex, variableBorrowIndex, event}: any, 
                cb: () => void
            ) => {
                this.requestDelay += 1;
                // add a request rate limit due to Infura request rate limit
                // can be reduced if a dedicated project is setup
                this.delay(this.network === 'mainnet' ? 5000 + this.requestDelay: 0)
                .then(() => event.getBlock())
                .then((block: any) => block.timestamp)
                .then((timestamp: number) => {
                    processorFn({reserve, liquidityRate, stableBorrowRate, variableBorrowRate, liquidityIndex, variableBorrowIndex, timestamp, blockNumber: event.blockNumber})
                    .then(function() {
                        logger(logId).info(`Finished processing event for block ${event.blockNumber} and reserve ${reserve}`)
                        cb()
                    })
                })
            }, 
            workers
        )

        this.lendingPoolContract.on("ReserveUpdated", (reserve, liquidityRate, stableBorrowRate, variableBorrowRate, liquidityIndex, variableBorrowIndex, event) => {
            queue.push({reserve, liquidityRate, stableBorrowRate, variableBorrowRate, liquidityIndex, variableBorrowIndex, event}, () => {})
        })
    }
}