import { Client, Signal } from "src/sdk";
import { IonConnector } from 'src/sdk/ion';
const serverConfig = require("config/config.json")

const getUrl: () => string = () => {
    const is_dev_mode = process.env.NODE_ENV == "development";
    let proto = is_dev_mode ? "ws" : "wss";
    proto = "http"
    const url = proto + "://" + serverConfig.serverIp;
    return url;
}

class SfuProxy {

    private static instance: SfuProxy;
    private client_: IonConnector;
    private url_: string;

    private constructor() {
        const url = getUrl();
        this.client_ = new IonConnector(url);
    }

    public getDefaultClient: () => IonConnector = () => {
        return this.client_;
    }

    public createNewClient: () => IonConnector = () => {
        return new IonConnector(getUrl());
    }

    public getUrl: () => string = () => {
        return this.url_;
    }

    public getSfuSignal: () => Client = () => {
        return this.client_.sfu;
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new SfuProxy();
        }
        return this.instance;
    }
}

export { SfuProxy };
