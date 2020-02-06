# aaveinterest
A simple http api to get Aave interest rates from the blockchain

## Run Application

There are two services:

- Http Api web application

- Worker  (listens to the ethereum network for updates)


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

#### *URL* 

/deposit/:reserve/:rate?

#### *Route Params*

reserve: Reserve address (e.g. 0x6B175474E89094C44Da98b954EedeAC495271d0F)

rate (optional) : rate ['week', 'month', 'all-time']

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