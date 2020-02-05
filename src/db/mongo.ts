import * as mongo from 'mongodb';

const dbName = process.env.DB_MONGO_NAME || 'adexValidator'

export default class MongoHelper {
    static client: mongo.MongoClient;
 
    public static connect(url: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            mongo.MongoClient.connect(url, {useNewUrlParser: true}, (err, client: mongo.MongoClient) => {
                if (err) {
                    reject(err);
                } else {
                    MongoHelper.client = client;
                    resolve(client);
                }
            });
        });
    }

    public getMongo() {
        if (MongoHelper.client) return MongoHelper.client.db(dbName)
        throw new Error('db.connect() needs to be invoked before using getMongo()')
    }

    public disconnect(): void {
        MongoHelper.client.close();
    }
}