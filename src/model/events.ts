import MongoHelper from '../db/mongo'
import * as mongo from 'mongodb'

export default class EventsModel {
    db: MongoHelper;
    collection: mongo.Collection

    constructor(db: MongoHelper) {
        this.db = db
        this.collection = db.getMongo().collection('events')
    }

    public async storeEvents({
        reserve,
        liquidityRate, 
        stableBorrowRate, 
        variableBorrowRate,
        liquidityIndex,
        variableBorrowIndex
    }: any) : Promise<any> {
        const event = {
            reserve,
            liquidityRate: +liquidityRate,
            stableBorrowRate: +stableBorrowRate,
            variableBorrowRate: +variableBorrowRate,
            variableBorrowIndex,
            liquidityIndex,
            created: new Date().toISOString()
        }
    
       const result = await this.collection.insertOne(event)
       console.log({ result })
       return result
    }

    public async aggregateReserves(pipeline: Array<object>) : Promise<any>{
        return await this.collection
            .aggregate(pipeline, { maxTimeMS: 10000 })
            .toArray()
    }
}
