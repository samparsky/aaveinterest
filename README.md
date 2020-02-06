# aaveinterest
A simple http api to get Aave interest rates from the blockchain


## Routes

### Get Reserves List

*URL*  /

*Response*

```js
{
    data: ["0x6B175474E89094C44Da98b954EedeAC495271d0F"],
    updatedAt: "2020-02-06T06:48:53.037Z"
}
```


### Get Deposit Rates

*URL* /deposit/:reserve/:rate?

*Route Params*

reserve: Reserve address (e.g. 0x6B175474E89094C44Da98b954EedeAC495271d0F)
rate (optional) : rate ['week', 'month', 'all-time']

*Response*

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

*URL* /borrow/:reserve/:rate?

*Route Params*

reserve: Reserve address (e.g. 0x6B175474E89094C44Da98b954EedeAC495271d0F)
rate (optional) : rate ['week', 'month', 'all-time']

*Query Params*

borrowRate: ['stable', 'variable']

*Response*

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