import fetch from 'node-fetch'
import tape from 'tape-catch'

const baseUrl =  process.env.BASE_URL || 'http://localhost:8005'
const mongo = require('./mongo')

tape('/', async function(t) {
    const result = await fetch(baseUrl, {}).then(res => res.json())
    t.equal(result.data.length > 0, true, 'fetch reserves list')
    t.ok(result.updatedAt, 'has updatedAt property')
    t.end()
})

tape('/deposit/:slug', async function(t) {
    const result = await fetch(`${baseUrl}/deposit/${mongo[0].reserve}`, {}).then(res => res.json())
    t.equal(result.data.length > 0, true, 'fetch borrow rate')
    t.deepEqual(Object.keys(result.data[0]), ['liquidityRate', 'created'], 'fetch reserves list')
    t.end()
})

tape('/deposit/:slug/week', async function(t) {
    const result = await fetch(`${baseUrl}/deposit/${mongo[0].reserve}/week`, {}).then(res => res.json())
    t.equal(result.data.length > 0, true, 'fetch borrow rate')
    t.deepEqual(Object.keys(result.data[0]), ['liquidityRate', 'time'], 'fetch reserves list')
    t.end()
})

tape('/deposit/:slug/month', async function(t) {
    const result = await fetch(`${baseUrl}/deposit/${mongo[0].reserve}/month`, {}).then(res => res.json())
    t.equal(result.data.length > 0, true, 'fetch borrow rate')
    t.deepEqual(Object.keys(result.data[0]), ['liquidityRate', 'time'], 'fetch reserves list')
    t.end()
})

tape('/deposit/:slug/all-time', async function(t) {
    const result = await fetch(`${baseUrl}/deposit/${mongo[0].reserve}/all-time`, {}).then(res => res.json())
    t.equal(result.data.length > 0, true, 'failed to get all-time borrow rate')
    t.deepEqual(Object.keys(result.data[0]), ['liquidityRate', 'time'], 'fetch reserves list')
    t.end()
})

tape('stable /borrow/:slug', async function(t) {
    const result = await fetch(`${baseUrl}/borrow/${mongo[0].reserve}`, {}).then(res => res.json())
    t.equal(result.data.length > 0, true, 'fetch borrow rate')
    t.deepEqual(Object.keys(result.data[0]), ['stableBorrowRate', 'created'], 'fetch reserves list')
    t.end()
})

tape('variable /borrow/:slug', async function(t) {
    const result = await fetch(`${baseUrl}/borrow/${mongo[0].reserve}?borrowRate=variable`, {}).then(res => res.json())
    t.equal(result.data.length > 0, true, 'fetch borrow rate')
    t.deepEqual(Object.keys(result.data[0]), ['variableBorrowRate', 'created'], 'fetch reserves list')
    t.end()
})

tape('/borrow/:slug/week', async function(t) {
    const result = await fetch(`${baseUrl}/borrow/${mongo[0].reserve}/week`, {}).then(res => res.json())
    t.equal(result.data.length > 0, true, 'fetch borrow rate')
    t.deepEqual(Object.keys(result.data[0]), ['stableBorrowRate', 'time',], 'fetch reserves list')
    t.end()
})

tape('/borrow/:slug/month', async function(t) {
    const result = await fetch(`${baseUrl}/borrow/${mongo[0].reserve}/month`, {}).then(res => res.json())
    t.equal(result.data.length > 0, true, 'fetch borrow rate')
    t.deepEqual(Object.keys(result.data[0]), ['stableBorrowRate', 'time'], 'fetch reserves list')
    t.end()
})

tape('/borrow/:slug/all-time', async function(t) {
    const result = await fetch(`${baseUrl}/borrow/${mongo[0].reserve}/all-time`, {}).then(res => res.json())
    t.equal(result.data.length > 0, true, 'fetch borrow rate')
    t.deepEqual(Object.keys(result.data[0]), ['stableBorrowRate', 'time'], 'fetch reserves list')
    t.end()
})

