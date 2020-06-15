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

export class UtenteExport  {
  id: String;
  email: String;
  telefono: String;
  nome: String;
  cognome: String;
  password: String;
  dataIscrizione: Date;
  attivo: boolean;
  tipo : String;

  constructor(id: String,
    email: String,
    telefono: String,
    nome: String,
    cognome: String,
    password: String,
    dataIscrizione: Date,
    attivo: boolean,
    tipo : String) {
        this.id = id;
        this.email = email;
        this.telefono = telefono;
        this.nome = nome;
        this.cognome = cognome;
        this.password = password;
        this.dataIscrizione = dataIscrizione;
        this.attivo = attivo;
        this.tipo = tipo;
    }

  
  
 

}