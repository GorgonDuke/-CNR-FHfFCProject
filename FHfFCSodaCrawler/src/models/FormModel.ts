import { Geometry } from './Geometry';
import { IndirizzoModel } from './IndrizzoModel';
import { I18NHtmlParser } from '@angular/compiler/src/i18n/i18n_html_parser';
export class FormModel {
  _id :string;
  utenteId :string;
  dataInserimento : Date;
  organizzazione: string;
  descrizione : string;
  raggio: number;
  tipoOfferta: string;
  indirizzo: IndirizzoModel = new IndirizzoModel();
  geometry : Geometry = new Geometry();
  



  public notValid() {

    let errors: Array<string> = new Array();
    
    if (!this.raggio) {
      errors.push("Area di Offerta");
    }


    if (!this.indirizzo.via) {
      errors.push("Via");
    }

    if (!this.indirizzo.citta) {
      errors.push("Citt&agrave;");
    }

     

    return errors;

  }

}