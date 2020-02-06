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

const contractAddress = contractAdresses[argv.network].LendingPool

async function initialize(){
    // connect to mongodb database
    await connect();
 
    let contract = new AaveContract(argv.network, contractAddress)
    let model = new EventsModel(getMongo())

    await contract.listen(model.storeEvents)
}

initialize()
.then(function(){
    logger('woker').info("starting worker")
    process.stdin.resume() // this is to prevent the script from exiting
})
