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

    public async reservesList(req: express.Request, res: express.Response) {
        const reserves = await this.aaveContract.getReserves();
        res.send({ reserves }) 
    }
    
    isDepositRoute(req: express.Request) : boolean {
        return req.originalUrl.split('/')[0] === 'deposit'
    }
    
    async reserves (req: express.Request, res: express.Response) {
        let query = { }
        let timeframe = null
    
        if(req.params.slug) query = { reserve: req.params.slug }
        if(req.params.rate) {
            timeframe = this.getTimeframe(req.params.rate)
            if (timeframe.period) {
                query = { ...query, created: { $gt: new Date(Date.now() - timeframe.period) }}
            }
        } else {
            query = { ...query, created: { $gt: this.get24hours() } }
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
    
        if (timeframe) {
            pipeline = [
                ...pipeline,
                {
                    $group: {
                        _$id: {
                            $subtract: [{ $toLong: '$created' }, { $mod: [{ $toLong: '$created' }, timeframe.interval] }]
                        },
                        value: { $sum: this.isDepositRoute(req) ? '$liquityRate' : req.query.borrowRate ? `${req.query.borrowRate}BorrowRate` : '$stableBorrowRate' }
                    }
                },
                { $limit: 100 },
                { $project: { value: '$value', time: '$_id', _id: 0 } }
            ]
        }
    
        
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