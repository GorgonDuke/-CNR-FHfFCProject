import { Geometry } from './Geometry';

export class GenericEndPoint {
    _id: string;
    collection_name: string;
    counter: Number;
    geometry: Geometry;
    human_desc: String;
    human_name: String;
    insertedOn: Date;
    link: String;
    search_value: String;
    sec: Number;
    active: Boolean;
    image : string;
    annunciLat: number;
    annunciLon: number;
    color : String;       
    score : number;
    order : Number;
    distance : number;
};