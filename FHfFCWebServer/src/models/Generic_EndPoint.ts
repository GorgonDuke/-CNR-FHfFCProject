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
    color : String;         
  
  }


  export interface Generic_EndPoint_Export  {
    _id: String;
    collection_name: String;
    counter: number;
    geometry : Geometry;
    human_desc : String;
    human_name : String;
    insertedOn : Date;
    link : String;
    search_value : String;
    sec : number;
    active : Boolean;
    annunciLat: number;
    annunciLon: number;
    score : number;
    distance : number;
    
  }