export class Risposta {
    status: string;
    esito: boolean;
    data : Date;
    valore : object;


    constructor(status: string, esito : boolean, value : object) {
        this.data = new Date();
        this.status = status;
        this.esito = esito;
        this.valore = value;
    }
    
}