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

const { LendingPool: contractAddress, contractCreatedBlockHeight }= contractAdresses[argv.network].LendingPool

async function initialize(){
    // connect to mongodb database
    await connect();
 
    const contract = new AaveContract(argv.network, contractAddress)
    const model = new EventsModel(getMongo())
    // retrieves last processed block height
    const blockHeight = await model.getLastBlockHeight() || contractCreatedBlockHeight
    logger('worker').info(`processing events from block ${blockHeight}`)
    await contract.listen(model.storeEvents, blockHeight)
}

initialize()
.then(function(){
    logger('worker').info("starting worker")
    process.stdin.resume() // this is to prevent the script from exiting
})
