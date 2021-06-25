'use strict';
import * as mongoose from 'mongoose';
import * as mongooseGeoJSONSchema from 'mongoose-geojson-schema';
import { Tweett } from '../models/Tweetter'


export var Annunci_schema = new mongoose.Schema({
  _id: String,
  utenteId: String,
  dataInserimento: Date,
  organizzazione: String,
  raggio: Number,
  tipoOfferta: String,
  descrizione: String,
  indirizzo: {
    via: String,
    citta: String,
    cap: String,
    lat: Number,
    lon: Number
  },
  geometry: Object,
  immagine: String,
  active: Boolean
});

export var Endpointinthedb_schema = new mongoose.Schema({
  _id: String,
  addedd: Date,
  endPoint: Object,
  inserted: String,
  total: String
});

export var Account_schema = new mongoose.Schema({
  _id: String,
  email: String,
  telefono: String,
  nome: String,
  cognome: String,
  password: String,
  dataIscrizione: Date,
  attivo: Boolean,
  tipo: String

});


export let Generic_EndPoint_schema = new mongoose.Schema({
  _id: String,
  collection_name: String,
  counter: Number,
  geometry: Object,
  human_desc: String,
  human_name: String,
  insertedOn: Date,
  link: String,
  search_values
  : String,
  sec: Number,
  active: Boolean,
  annunciLat: Number,
  annunciLon: Number

});



export let Tweets_schema = new mongoose.Schema({
  genericEndPointId: String,
  status: {
    text: String,
    createdAt: String,
    user: {
      name: String,
      screenName: String,
      profileImageUrl: String,
      profileImageUrlHttps: String,
    },
    lang: String
  }

});


// export let Generic_EndPoint_schema = new mongoose.Schema({
//   _id: String,
//   collection_name: String,
//   counter: Number,
//   geometry: Object,
//   human_desc : String,
//   human_name : String,
//   insertedOn : Date,
//   link : String,
//   search_value : String,
//   sec : Number,
//   active : Boolean
// });