import yargs from 'yargs'
import express from 'express'
import bodyParser from 'body-parser'
import AaveContract from '../src/ethereum/aave'
import EventsModel from '../src/model/events'
import {connect, getMongo} from '../src/db/mongo'
import ReservesRoute from '../src/routes/reserves'

const contractAdresses = require('../src/resources/address.json')

const { argv } = yargs
    .usage('Usage $0 [options]')
    .describe('network', 'the adapter for authentication and signing')
    .choices('network', Object.keys(contractAdresses))
    .demandOption(['network'])

const app = express()

const port = process.env.PORT || 8005
const contractAddress = contractAdresses[argv.network].LendingPool

async function initialize(){
    await connect()
    
    const contract = new AaveContract(argv.network, contractAddress)
    await contract.initReserves()
    const model = new EventsModel(getMongo())
    // adds contract events listener
    await contract.listen(model.storeEvents)
    const reservesRoute = new ReservesRoute(model, contract)

    app.use(bodyParser.json())
    app.get('/', reservesRoute.reservesList)
    app.get('/deposit/:slug', reservesRoute.reserves)
    app.get('/deposit/:slug/:rate', reservesRoute.reserves)
    app.get('/borrow/:slug', reservesRoute.reserves)
    app.get('/borrow/:slug/:rate', reservesRoute.reserves)  
}

initialize()
.then(() => app.listen(port, () => console.log(`listening on port ${port}!`)))

