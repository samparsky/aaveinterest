import yargs from 'yargs'
import AaveContract from '../src/ethereum/aave'
import EventsModel from '../src/model/events'
import MongoHelper from '../src/db/mongo'

const contractAdresses = require('../resources/address.json')
const { argv } = yargs
    .usage('Usage $0 [options]')
    .describe('network', 'the network to connect to ropsten or mainnet')
    .choices('network', Object.keys(contractAdresses))
    .demandOption(['network'])

const contractAddress = contractAdresses[argv.network].LendingPool

async function initialize(){
    // connect to mongodb database
    MongoHelper.connect();

    let mongo = new MongoHelper()
    let contract = new AaveContract(argv.network, contractAddress)
    let model = new EventsModel(mongo)

    contract.listen(model.storeEvents)
}


initialize()
.then(function(){
    console.log(`exiting worker`)
    process.exit(0)
})
