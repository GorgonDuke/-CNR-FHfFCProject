import { FormModel } from './FormModel';
import { Geometry } from './Geometry';
import { IndirizzoModel } from './IndrizzoModel'; 
import * as mongoose from 'mongoose';
export interface FormModel extends mongoose.Document {
  utenteId: string;
  dataInserimento : Date;
  organizzazione: string;
  raggio: number;
  descrizione : string;
  tipoOfferta: string;
  indirizzo: IndirizzoModel;
  geometry : Geometry ;
  active : boolean;
  

  
}
 

export class FormModelReturn {
  id : string;
  utenteId: string;
  dataInserimento : Date;
  organizzazione: string;
  raggio: number;
  descrizione : string;
  tipoOfferta: string;
  indirizzo: IndirizzoModel;
  geometry :  GeometryReturn  = new GeometryReturn();
  active : boolean;

  
}

export class GeometryReturn {
  coordinates : Array<number>; 
  type: String;
}

export interface FormModelFromWeb {
  utenteId: string;
  dataInserimento : Date;
  organizzazione: string;
  raggio: number;
  descrizione : string;
  tipoOfferta: string;
  indirizzo: IndirizzoModel;
  geometry : Geometry ;
  active : boolean;
  

}
 
