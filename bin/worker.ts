import yargs from 'yargs'
import contractAdresses from '../resources/address.json'

const { argv } = yargs
    .usage('Usage $0 [options]')
    .describe('network', 'the adapter for authentication and signing')
    .choices('network', Object.keys(contractAdresses))
    .demandOption(['network'])


