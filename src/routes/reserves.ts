
export default class Reserves {
    public async reservesList(req, res, next) {
        const reserves = await contract.getReserves();
        res.send({ reserves }) 
    }
    
    function isDepositRoute(req){
        req.originalUrl.split('/')[0] === 'deposit'
    }
    
    async function reserves (req, res, next) {
        let query = { }
        let timeframe = null
    
        if(req.params.slug) query = { reserve: req.params.slug }
        if(req.params.rate) {
            timeframe = getTimeframe(req.params.rate)
            if (timeframe.period) {
                query = { ...query, created: { $gt: new Date(Date.now() - period) }}
            }
        } else {
            query = { ...query, created: { $gt: get24hours() } }
        }
        
        if(req.query.borrowRate) {
            const borrowTypes = ['fixed', 'stable']
            if(!borrowTypes.includes(req.query.borrowRate)) {
                return res.send({"error": `invalid borrow rate, accepted types include ${borrowTypes.join(' ,')}` })
            }
        }
    
        let pipeline = [
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
                        value: { $sum: isDepositRoute() ? '$liquityRate' : req.query.borrowRate ? `${req.query.borrowRate}BorrowRate` : '$stableBorrowRate' }
                    }
                },
                { $limit: 100 },
                { $project: { value: '$value', time: '$_id', _id: 0 } }
            ]
        }
    
        const eventsCol = db.getMongo().collection('events')
        const data = await eventsCol
            .aggregate(pipeline, { maxTimeMS: 10000 })
            .toArray()
        
        console.log({ data })
    
        res.send({ data })        
    }
    
    function getTimeframe (rate) {
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
    
    function get24hours(){
        return new Date(new Date().getTime() - (24*3600*1000))
    }
}