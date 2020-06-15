export class IndirizzoModel{
    //  addedd: Date,
    
    via: string;
    citta : string;
    cap: string;
    lat : number;
    lon : number;

    getStringIndirizzo() {
      if (this.cap) {
        return this.via + " , " + this.citta + " , " + this.cap;
      } else {
        return this.via + " , " + this.citta;
      }
    }

    getStringIndirizzoNoGoogle() {
      if (this.cap) {


        return this.via.replace(new RegExp(" ", 'g'),"+") + "+" + this.citta.replace(new RegExp(" ", 'g'),"+") + "+" + this.cap;
      } else {
        return this.via.replace(new RegExp(" ", 'g'),"+") + "+" + this.citta.replace(new RegExp(" ", 'g'),"+");
      }
    }
    
  };