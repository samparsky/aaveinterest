import lendingPoolAbi from '../../aave-protocol/abi/LendingPool.json'
import ethers from "ethers"
export default class AaveContract {
    lendingPoolContract: ethers.Contract
    reservesList = { data: {}, updatedAt: new Date() }

    constructor(network: string, contractAddress: string){
        const infuraProvider = new ethers.providers.InfuraProvider(network);
        this.lendingPoolContract = new ethers.Contract(contractAddress, lendingPoolAbi, infuraProvider);
    }

    async initReserves() : Promise<void> {
        if(!this.lendingPoolContract) throw new Error("please initialize network")
        const data = await this.lendingPoolContract.getReserves();
        this.reservesList = { data, updatedAt: new Date() }
    }

    async getReserves() : Promise<object> {
        if(!this.lendingPoolContract) throw new Error("please initialize network")
        if(!this.reservesList.data) throw new Error("please initialize reserves")
        if((this.reservesList.updatedAt.getTime() - (new Date().getTime())) / 3600*1000 > 1 ) {
            // update the reserves list
            // every hour
            await this.initReserves();
        }
    
        return this.reservesList
    }

    async listen (processorFn: ({}) => Promise<void>) {
        if(!this.lendingPoolContract) throw new Error("please initialize network first")
        this.lendingPoolContract.on("ReserveUpdated", (reserve, liquidityRate, stableBorrowRate, variableBorrowRate, liquidityIndex, variableBorrowIndex, event) => {
            processorFn({reserve, liquidityRate, stableBorrowRate, variableBorrowRate, liquidityIndex, variableBorrowIndex})
            .then(function() {
                console.log(`Finsished processing event for block ${event.blockNumber}`)
            })
        })
    }


}