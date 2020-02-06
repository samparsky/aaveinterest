import * as mongo from 'mongodb';

const dbName = process.env.DB_MONGO_NAME || 'aaveInterest'

let client : mongo.MongoClient;
 
export async function connect(): Promise<void> {
    if(client) return
    const url = process.env.DB_MONGO_URL || 'mongodb://localhost:27017'
    client = await mongo.MongoClient.connect(url, {useNewUrlParser: true})
}

export function getMongo() : mongo.Db {
    if (client) return client.db(dbName)
    throw new Error('db.connect() needs to be invoked before using getMongo()')
}

export function disconnect(): void {
    client.close();
}
