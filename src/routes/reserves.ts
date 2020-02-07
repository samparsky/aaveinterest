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
        res.send(reserves) 
    }
    
    isDepositRoute(req: express.Request) : boolean {
        return req.originalUrl.split('/')[1] === 'deposit'
    }
    
    reserves = async (req: express.Request, res: express.Response) => {
        let query = { }
        let projection = null
        let timeframe = null
        const borrowTypes = ['variable', 'stable']

        if(req.query.borrowRate && !borrowTypes.includes(req.query.borrowRate)) {
            return res.send({"error": `invalid borrow rate, accepted types include ${borrowTypes.join(' ,')}` })
        }

        const rate = this.isDepositRoute(req) ? 'liquidityRate' : req.query.borrowRate ? `${req.query.borrowRate}BorrowRate` : 'stableBorrowRate'
    
        if(req.params.slug) query = { reserve: req.params.slug }
        if(req.params.mode) {
            timeframe = this.getTimeframe(req.params.mode)
            if (timeframe.period) {
                query = { ...query, created: { $gt: new Date(Date.now() - timeframe.period) }}
            }
        } else {
            query = { ...query, created: { $gt: this.get24hours() } }
            projection = { [rate] : 1, '_id': 0, created: 1 }
        }
        
        const data = await this.eventsModel.aggregateReserves(query, projection, rate, timeframe)
        res.send({ data })        
    }
    
    getTimeframe (rate: string) : any {
        const MINUTE = 60 * 1000
        const HOUR = 60 * MINUTE
        const DAY = 24 * HOUR
    
        if(rate == "week") {
            return { period: 7 * DAY, interval: 6 * HOUR }
        } else if (rate == "month") {
            return { period: 30 * DAY, interval: 12 * HOUR }
        } else if (rate == "all-time") {
            return { period: 0, interval: 56 * HOUR }
        }
    
    }
    
    get24hours() : Date {
        return new Date(new Date().getTime() - (24*3600*1000))
    }
}
