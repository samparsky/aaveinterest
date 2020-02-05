import * as mongo from 'mongodb';

const dbName = process.env.DB_MONGO_NAME || 'adexValidator'

let client : mongo.MongoClient;
 
export async function connect() {
    const url = process.env.DB_MONGO_URL || 'mongodb://localhost:27017'
    client = await mongo.MongoClient.connect(url, {useNewUrlParser: true})
    return client 
}

export function getMongo() {
    if (client) return client.db(dbName)
    throw new Error('db.connect() needs to be invoked before using getMongo()')
}

export function disconnect(): void {
    client.close();
}
