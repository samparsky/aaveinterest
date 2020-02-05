import yargs from 'yargs'
import express from 'express'
import bodyParser from 'body-parser'
import reserves from '../src/routes/reserves'

const contractAdresses = require('../resources/address.json')

const { argv } = yargs
    .usage('Usage $0 [options]')
    .describe('network', 'the adapter for authentication and signing')
    .choices('network', Object.keys(contractAdresses))
    .demandOption(['network'])

const app = express()
const port = process.env.PORT || 8005

app.use(bodyParser.json())
app.router.get('/', reservesList)
router.get('/deposit/:slug', reserves)
router.get('/deposit/:slug/:rate', reserves)
router.get('/borrow/:slug', reserves)
router.get('/borrow/:slug/:rate', reserves)
