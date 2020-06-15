
import { Geometry } from "./Geometry";



export class Endpointinthedb{
  //  addedd: Date,
  endPoint: Object;
  inserted: String;
  total: String;
};

export interface EndpointinthedbIf {
  //  addedd: Date,
  endPoint: Object,
  inserted: String,
  total: String,
  color: String
};

export interface EndPoint {
  _id : string;
    description : string;
    db_name : string;
    downloadedon : Date;
}

export interface OpenDataIF {
  longitude: string;
  latitude: string;
  nome: string;
  ricerche: string[];
}

export interface EndPointInTheDbWeb {
  
  addedd: Date,
  endPoint: EndPoint,
  inserted: String,
  total: String,
  endPointName : String;
  dacercare : OpenDataIF,
  daAggiungereARicerca : String;
  color : string;
}


declare module namespace {

  

export interface EndpointinthedbVero {
      _id: string;
      collection_name: string;
      counter: number;
      geometry: Geometry;
      human_desc: string;
      human_name: string;
      insertedOn : Date;
      link: string;
      search_values: string;
  }

}

