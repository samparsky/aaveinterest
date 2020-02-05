import { getMongo } from '../db/mongo'
import * as mongo from 'mongodb'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'


export default class EventsModel {
    collection: mongo.Collection

    constructor(db: mongo.Db) {
        this.collection = db.collection('events')
    }

    storeEvents = async ({
        reserve,
        liquidityRate, 
        stableBorrowRate, 
        variableBorrowRate,
        liquidityIndex,
        variableBorrowIndex
    } : any) : Promise<any> => {
        const event = {
            reserve,
            liquidityRate: new BigNumber(liquidityRate.toString()).div(new BigNumber(10).pow(27)).multipliedBy(100).toNumber(),
            stableBorrowRate: new BigNumber(stableBorrowRate.toString()).div(new BigNumber(10).pow(27)).multipliedBy(100).toNumber(),
            variableBorrowRate: new BigNumber(variableBorrowRate.toString()).div(new BigNumber(10).pow(27)).multipliedBy(100).toNumber(),
            variableBorrowIndex: variableBorrowIndex.toString(),
            liquidityIndex: liquidityIndex.toString(),
            created: new Date().toISOString()
        }
    
       const result = await this.collection.insertOne(event)
       console.log({ result })
       return result
    }

    aggregateReserves = async (pipeline: Array<object>) : Promise<any> => {
        console.log(JSON.stringify(pipeline))
        let db = getMongo()
        const data = await db.collection('events')
            .aggregate([...pipeline])
            .toArray()
        
        console.log(data)
        return data
    }
}
