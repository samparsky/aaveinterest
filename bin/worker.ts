import yargs from 'yargs'
import AaveContract from '../src/ethereum/aave'
import EventsModel from '../src/model/events'
import { connect, getMongo } from '../src/db/mongo'
import logger from '../src/logger'

const contractAdresses = require('../src/resources/address.json')

const { argv } = yargs
    .usage('Usage $0 [options]')
    .describe('network', 'the network to connect to ropsten or mainnet')
    .choices('network', Object.keys(contractAdresses))
    .demandOption(['network'])

const { LendingPool: contractAddress, createdBlockHeight } = contractAdresses[argv.network]

const delay = async (interval: number) => new Promise(resolve => setTimeout(resolve, interval))

async function initialize(){
    // connect to mongodb database
    await connect();
    const { network } = argv
    
    const contract = new AaveContract(network, contractAddress)
    const model = new EventsModel(getMongo())

    // retrieves last processed block height
    const blockHeight = await model.getLastBlockHeight() || createdBlockHeight

    // uses 3 workers for mainnet due to infura request rate limit
    // can be improved if a dedicated project is setup
    const workers = network == 'mainnet' ? 3 : parseInt(process.env.NUM_WORKERS, 10) || 10

    logger('worker').info(`processing events from block ${blockHeight} and with ${workers} workers`)

    const logId = `ethereum:${network}`
    let requestDelay = 0

    const queue = require('fastq')(
        (
            {reserve, liquidityRate, stableBorrowRate, variableBorrowRate, liquidityIndex, variableBorrowIndex, event}: any, 
            cb: () => void
        ) => {
            requestDelay += 1;
            // add a request rate limit due to Infura request rate limit
            // can be reduced if a dedicated project is setup
            delay(network === 'mainnet' ? 3000 + requestDelay: 0)
            .then(() => event.getBlock())
            .then((block: any) => block.timestamp)
            .then((timestamp: number) => {
                model.storeEvents(
                    {
                        reserve, 
                        liquidityRate, 
                        stableBorrowRate, 
                        variableBorrowRate, 
                        liquidityIndex, 
                        variableBorrowIndex, 
                        timestamp,
                        blockNumber: event.blockNumber
                    }
                )
                .then(function() {
                    logger(logId).info(`Finished processing event for block ${event.blockNumber} and reserve ${reserve}`)
                    cb()
                })
            })
        }, 
        workers
    )

    await contract.listen(blockHeight, queue)
}

initialize()
.then(function(){
    process.stdin.resume() // this is to prevent the script from exiting
})
