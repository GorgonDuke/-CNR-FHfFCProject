import { Geometry } from './Geometry';
import * as mongoose from 'mongoose';

export interface Generic_EndPoint extends mongoose.Document {
    _id: String;
    collection_name: String;
    counter: Number;
    geometry : Geometry;
    human_desc : String;
    human_name : String;
    insertedOn : Date;
    link : String;
    search_value : String;
    sec : Number;
    active : Boolean;
    annunciLat: Number;
    annunciLon: Number;
     
  
  }
export class GenericEndPointObj {
  _id: String;
  collection_name: String;
  counter: Number;
  geometry: Object;
  human_desc: String;
  human_name: String;
  insertedOn: Date;
  search_values : String;
  sec: Number;
  active: Boolean;
  annunciLat: Number;
  annunciLon: Number;
  
}