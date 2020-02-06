import * as mongo from 'mongodb'
import BigNumber from 'bignumber.js'
import { ReserveEvent } from '../types'

export default class EventsModel {
    collection: mongo.Collection

    constructor(db: mongo.Db) {
        this.collection = db.collection('events')
    }

    getEvent = async(reserve: string) : Promise<any> => {
        const result = await this.collection.find({ reserve }).sort({ created: 1 }).limit(1).toArray()
        console.log({ result })
        return result[0]
    }

    updateEventDuration = async(id: string, duration: any): Promise<any> => {
       const update = await this.collection.updateOne({ _id: id }, { $set: { duration }})
       console.log({ update })
    }

    storeEvents = async ({
        reserve,
        liquidityRate, 
        stableBorrowRate, 
        variableBorrowRate,
        liquidityIndex,
        variableBorrowIndex
    } : ReserveEvent) : Promise<any> => {

        const event = {
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
            // update the previous insert with the duration
            await this.updateEventDuration(previousUpdate._id, duration)
        }

        // get previous reserve rate created
        // calculate the difference to the current one
        // store the difference
        // if it doesn't exist return 1
        // on new event we update the previous time difference too

        // get the previous
    
       const result = await this.collection.insertOne(event)
       console.log({ result })
       return result
    }

    aggregateReserves = async (query: any, projection: any, rate: string, timeframe: any) : Promise<any> => {
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
    
        console.log({ pipeline })
        console.log(JSON.stringify(pipeline))

        const data = await this.collection
            .aggregate([...pipeline])
            .toArray()
        
        console.log(data)
        return data
    }
}
