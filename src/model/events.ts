import MongoHelper from '../db/mongo'
import * as mongo from 'mongodb'

export default class EventsModel {
    db: MongoHelper;
    
    constructor(db: MongoHelper) {
        this.db = db
    }

    public async storeEvents(
        reserve: String, 
        liquidityRate: Number, 
        stableBorrowRate: Number, 
        variableBorrowRate:Number ,
        liquidityIndex: String,
        variableBorrowIndex: String
    ) : Promise<any> {
        const eventsTable = this.db.getMongo().collection('events')
        const event = {
            reserve,
            liquidityRate: +liquidityRate,
            stableBorrowRate: +stableBorrowRate,
            variableBorrowRate: +variableBorrowRate,
            variableBorrowIndex,
            liquidityIndex,
            created: new Date().toISOString()
        }
    
       const result = await eventsTable.insertOne(event)
       console.log({ result })
       return result
    }
}
