import lendingPoolAbi from '../../aave-protocol/abi/LendingPoolCore.json'
import { ethers } from "ethers"
import { ReservesList } from '../types'

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
    
    async listen (blockHeight: number | null, queue: any) {
        if(!this.lendingPoolContract) throw new Error("please initialize network first")
        this.provider.resetEventsBlock(blockHeight) 
        this.lendingPoolContract.on(
            "ReserveUpdated", 
            (reserve, liquidityRate, stableBorrowRate, variableBorrowRate, liquidityIndex, variableBorrowIndex, event) => {
            queue.push({reserve, liquidityRate, stableBorrowRate, variableBorrowRate, liquidityIndex, variableBorrowIndex, event}, () => {})
        })
    }
}