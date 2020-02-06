import * as mongo from 'mongodb'
import BigNumber from 'bignumber.js'
import { ReserveEvent } from '../types'

interface EventsSchema {
    _id ?: string,
    reserve: string,
    liquidityRate: number,
    stableBorrowRate: number,
    variableBorrowRate: number,
    variableBorrowIndex: string,
    liquidityIndex: string,
    created: Date,
    duration: number
}

export default class EventsModel {
    collection: mongo.Collection

    constructor(db: mongo.Db) {
        this.collection = db.collection('events')
    }

    getEvent = async(reserve: string) : Promise<EventsSchema | null> => {
        const result = await this.collection.find({ reserve }).sort({ created: 1 }).limit(1).toArray()
        return result[0]
    }

    updateEventDuration = async(id: string, duration: any): Promise<any> => {
       await this.collection.updateOne({ _id: id }, { $set: { duration }})
    }

    storeEvents = async ({
        reserve,
        liquidityRate, 
        stableBorrowRate, 
        variableBorrowRate,
        liquidityIndex,
        variableBorrowIndex
    } : ReserveEvent) : Promise<void> => {

        const event: EventsSchema = {
            reserve,
            liquidityRate: new BigNumber(liquidityRate.toString()).div(new BigNumber(10).pow(27)).multipliedBy(100).toNumber(),
            stableBorrowRate: new BigNumber(stableBorrowRate.toString()).div(new BigNumber(10).pow(27)).multipliedBy(100).toNumber(),
            variableBorrowRate: new BigNumber(variableBorrowRate.toString()).div(new BigNumber(10).pow(27)).multipliedBy(100).toNumber(),
            variableBorrowIndex: variableBorrowIndex.toString(),
            liquidityIndex: liquidityIndex.toString(),
            created: new Date(),
            duration: 1.0
        }

        const previousUpdate = await this.getEvent(reserve)
        if(previousUpdate) {
            const duration = (new Date().getTime() - previousUpdate.created.getTime()) / 36e5;
            await this.updateEventDuration(previousUpdate._id, duration)
        }

       await this.collection.insertOne(event)
    }

    aggregateReserves = async (query: object, projection: object, rate: string, timeframe: {interval: number}) : Promise<Array<any>> => {
        let pipeline: any = [
            { '$match': query },
        ]

        if (projection) {
            pipeline = [ ...pipeline, { '$project': projection } ]
        }

        if (timeframe) {
            pipeline = [
                ...pipeline,
                {
                    $addFields: {
                        value: { $divide: [ { $multiply : [`$${rate}`, '$duration'] }, timeframe.interval ] },
                        key: {
                            $subtract: [ { "$toLong": "$created" }, { $mod: [ { "$toLong": "$created" }, timeframe.interval] }]
                        },   
                    }
                },
                {
                    $group: {
                        _id: "$key",
                        value: { $sum: '$value' }
                    }
                },
                { $limit: 100 },
                { $project: { [rate]: '$value', time: '$_id', _id: 0 } }
            ]
        }

        return await this.collection
            .aggregate([...pipeline])
            .toArray()        
    }
}
