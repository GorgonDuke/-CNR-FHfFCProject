import { Geometry } from './Geometry';
import { IndirizzoModel } from './IndrizzoModel'; 
import * as mongoose from 'mongoose';
export interface Utente  {

  id: String;
  email: String;
  telefono: String;
  nome: String;
  cognome: String;
  password : String;
  dataIscrizione : Date;
  attivo : boolean;
  tipo : String;
 

}

export interface UtenteInDb extends mongoose.Document  {
 
  _id: String;
  email: String;
  telefono: String;
  nome: String;
  cognome: String;
  password : String;
  dataIscrizione : Date;
  attivo : boolean;
  tipo : String;
 

}


export class UtenteC implements Utente {
  id: String;
  email: String;
  telefono: String;
  nome: String;
  cognome: String;
  password: String;
  dataIscrizione: Date;
  attivo: boolean;
  tipo : String;
  
 

}