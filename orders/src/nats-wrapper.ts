import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
    private _client?: Stan;
    public get client(): Stan {
        if (!this._client) {
            throw new Error('cannot access to nats client before connecting');
        }
        return this._client;
    }

    connect(clusterId: string, clientId: string, url: string): Promise<void> {
        this._client = nats.connect(clusterId, clientId, { url });

        // bad way to handle
        // this.client.on('close', () => {
        //     console.log('NATS connection closed');
        //     process.exit();
        // });
        // process.on('SIGINT', () => this.client.close());
        // process.on('SIGTERM', () => this.client.close());
        return new Promise((resolve, reject) => {
            this.client?.on('connect', () => {
                console.log('connected to NATS');
                resolve();
            })
            this.client?.on('error', (err) => {
                reject(err);
            })
        })
    }
}

export const natsWraper = new NatsWrapper();