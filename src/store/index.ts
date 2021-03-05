import IonStore from "./ion_store";

export class Store {
    ionStore: IonStore;

    constructor() {
        this.ionStore = new IonStore(this);
    }
}

const store = new Store();

export default store;