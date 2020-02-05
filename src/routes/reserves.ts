import EventsModel from '../model/events'
import AaveContract from '../ethereum/aave'
import express from 'express'
export default class Reserves {
    eventsModel: EventsModel
    aaveContract: AaveContract

    constructor(eventsModel: EventsModel, aaveContract: AaveContract) {
        this.eventsModel =  eventsModel
        this.aaveContract = aaveContract
    }

    reservesList = async (req: express.Request, res: express.Response) => {
        const reserves = await this.aaveContract.getReserves();
        res.send({ reserves }) 
    }
    
    isDepositRoute(req: express.Request) : boolean {
        console.log("hello ", req.originalUrl.split('/')[0])
        return req.originalUrl.split('/')[0] === 'deposit'
    }
    
    reserves = async (req: express.Request, res: express.Response) => {
        let query = { }
        let timeframe = null
    
        if(req.params.slug) query = { reserve: req.params.slug }
        if(req.params.rate) {
            timeframe = this.getTimeframe(req.params.rate)
            if (timeframe.period) {
                query = { ...query, created: { $gt: new Date(Date.now() - timeframe.period) }}
            }
        } else {
            query = { ...query, created: { $gt: this.get24hours().toISOString() } }
        }
        
        if(req.query.borrowRate) {
            const borrowTypes = ['fixed', 'stable']
            if(!borrowTypes.includes(req.query.borrowRate)) {
                return res.send({"error": `invalid borrow rate, accepted types include ${borrowTypes.join(' ,')}` })
            }
        }
    
        let pipeline: any = [
            { '$match': query },
        ]

        const rate = this.isDepositRoute(req) ? '$liquityRate' : req.query.borrowRate ? `${req.query.borrowRate}BorrowRate` : '$stableBorrowRate'

        if (timeframe) {
            pipeline = [
                ...pipeline,
                {
                    $project: { value: { $toDecimal: rate }, created: { $toLong: '$created' },  }
                },
                {
                    $group: {
                        _$id: {
                            $subtract: [ '$created', { $mod: ['$created', timeframe.interval] }]
                        },
                        value: { $divide: [ { $sum: '$value'  }, timeframe.interval ] }
                    }
                },
                { $limit: 100 },
                { $project: { value: '$value', time: '$_id', _id: 0 } }
            ]
        }
    
        console.log({ pipeline })
        const data = await this.eventsModel.aggregateReserves(pipeline)
        console.log({ data })

        res.send({ data })        
    }
    
    getTimeframe (rate: string) : any {
        const MINUTE = 60 * 1000
        const HOUR = 60 * MINUTE
        const DAY = 24 * HOUR
    
        if(rate == "week") {
            return { period: 7 * DAY, interval: 5 * HOUR }
        } else if (rate == "month") {
            return { period: 30 * DAY, interval: 12 * HOUR }
        } else if (rate == "all-time") {
            // returns 
            return { period: 0, interval: 56 * HOUR }
        }
    
    }
    
    get24hours() : Date {
        return new Date(new Date().getTime() - (24*3600*1000))
    }
}



[
    {"$match":{"reserve":"0x0000000000085d4780B73119b644AE5ecd22b376","created":{"$gt":"2020-01-29T09:56:30.750Z"}}},
    {"$project":{"value":{"$toLong":"$stableBorrowRate"},"created":{"$toLong":"$created"}}},
    {"$group":{"_$id":{"$subtract":["$created",{"$mod":["$created","18000000"]}]},"value":{"$divide":[{"$sum":"$value"},"18000000"]}}},
    {"$limit":100},
    {"$project":{"value":"$value","time":"$_id","_id":0}}
]