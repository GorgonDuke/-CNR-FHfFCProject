import { Geometry } from './Geometry';
import { IndirizzoModel } from './IndrizzoModel';
import { I18NHtmlParser } from '@angular/compiler/src/i18n/i18n_html_parser';
export class Utente  {

  public static ANZIANI : string = "anziani";
  public static BAMBINI : string = "bambini";
  public static DISABILI : string = "disabili";

  id: string;
  email: string;
  telefono: string;
  nome: string;
  cognome: string;
  password : string;
  tipo : string;


  public notValid() {

    let errors: Array<string> = new Array();
    if (!this.email) {
      errors.push("Email");
    }
    if (!this.nome) {
      errors.push("Nome");
    }
    if (!this.cognome) {
      errors.push("Cognome");
    }

    
     

    return errors;

  }

}