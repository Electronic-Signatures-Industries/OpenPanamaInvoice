import { sign } from '@erebos/secp256k1';
import { Subject } from 'rxjs';


export interface SmartCardConnectorEvent {
    eventName: string;
    payload: any;
}

export class SmartCardConnector {
    pcsc: any;
    state: any;
    SCARD_STATE_EMPTY: number;
    reader: any;
    SCARD_STATE_PRESENT: number;
    SCARD_SHARE_SHARED: any;

    constructor(
        public events: Subject<SmartCardConnectorEvent> = new Subject<SmartCardConnectorEvent>()
    ) {
        this.pcsc = pcsc();
        this.pcsc.on('reader', this.onReader);
    }



    async onReader(reader) {
        this.reader = reader;
        console.log('New reader detected', reader.name);
        reader.on('error', err => this.events.next({
            eventName: 'error',
            payload: err
        }));
        reader.on('status', async status => await this.onStatus(status));
        reader.on('end', () => this.events.next({
            eventName: 'removed',
            payload: null,
        }));


        pcsc.on('error', function (err) {
            console.log('PCSC error', err.message);
        });
    }

    connect() {
        return new Promise(
            (resolve, reject) => {
                this.reader.connect({ share_mode: this.SCARD_SHARE_SHARED }, (err, protocol) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(protocol);
                    }
                });

            }
        );
    }

    disconnect() {
        return new Promise(
            (resolve, reject) => {
                this.reader.disconnect(this.reader.SCARD_LEAVE_CARD, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve('Disconnected');
                    }
                });
            }
        );
    }

    transmit(protocol: any) {
        return new Promise(
            (resolve, reject) => {
                this.reader.transmit(new Buffer([0x00, 0xB0, 0x00, 0x00, 0x20]), 40, protocol, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve('Data received', data);
                        this.reader.close();
                        this.pcsc.close();
                    }
                });
            }
        );
    }
    async onStatus(status: any) {
        /* check what has changed */
        const changes = this.state ^ status.state;
        if (changes) {
            if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
                await this.disconnect();
            } else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
                console.log("card inserted");/* card inserted */
                try {
                    const protocol = await this.connect();
                    const response = await this.transmit(protocol);
                    this.events.next({ eventName: 'transmit', payload: response });
                } catch (err) {
                    this.events.next({ eventName: 'error', payload: err });
                }
            }
        }

    }
}


export class SmartCardConnectorPKCS11 {
    module: string;
    constructor(private keyId?: string) {
        this.keyId = keyId;
        this.module = '/usr/local/lib/softhsm/libsofthsm2.so';
    }


    async getSlots() {
        const axios = require('axios');
        const slots = await axios('http://localhost:8080/sc/get_slots');
        return Object.keys(slots.data).map(k => {
            return { value: JSON.parse(slots.data[k]), key:  JSON.parse(slots.data[k]).slotDescription };
        });
    }

    async sign(index: string, data: Buffer) {

    }

}