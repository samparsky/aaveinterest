# aaveinterest
A simple http api to get Aave interest rates from the blockchain
It updates the reserves list every hour from the blockchain, this is to prevent


## Run Application

There are two services:

- Http Api web application

- Worker  (listens to the ethereum network for events)


### Start Http Server

It can connect to either the `mainnet` or `ropsten` ethereum network

```sh
$ npm run build
$ npm start -- --network=mainnet
```

### Start Worker Service

It listens to the ethereum network for `ReserveUpdated` Aave events and stores in the database

It can listen to either the `mainnet` or `ropsten` ethereum network

```sh
$ npm run build
$ npm run start-worker -- -network=mainnet

```

## Routes

### Get Reserves List

#### *URL*  

/

#### *Response*

```js
{
    data: ["0x6B175474E89094C44Da98b954EedeAC495271d0F"],
    updatedAt: "2020-02-06T06:48:53.037Z"
}
```


### Get Deposit Rates

Returns the rates for the last 24 hours by default

#### *URL* 

/deposit/:reserve/:rate?

#### *Route Params*

reserve: Reserve address (e.g. 0x6B175474E89094C44Da98b954EedeAC495271d0F)

rate (optional): Get weighted average rate for the options ['week', 'month', 'all-time']

#### *Response*

```js
{
    data: [
        {
            liquidityRate: 0.0000005,
            time: "2020-02-06T06:48:53.037Z"
        }
    ]
}
```

### Get Borrow Rates

#### *URL* 

/borrow/:reserve/:rate?

#### *Route Params*

reserve: Reserve address (e.g. 0x6B175474E89094C44Da98b954EedeAC495271d0F)

rate (optional) : rate ['week', 'month', 'all-time']

#### *Query Params*

borrowRate: ['stable', 'variable']

#### *Response*

```js
{
    data: [
        {
            stableBorrowRate: 0.0000005,
            time: "2020-02-06T06:48:53.037Z"
        }
    ]
}
```

# Running locally

### Sample data

There is a sample Mongodb dump data in the `./data` directory. It can be imported to the 
local mongodb server

```sh
$ cd ./data
$ mongorestore
```

There is should now be a collection of sample 208 documents in your local database that you can
test against

# LICENSE

MIT