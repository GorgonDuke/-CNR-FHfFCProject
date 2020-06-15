
export class OpenData {
    longitude: string;
    latitude: string;
    color: string;
    nome: string;
    ricerche: string[] = [];
}
export interface OpenDataIF {
    longitude: string;
    latitude: string;
    color: string;
    nome: string;
    ricerche: string[];
}
export class Geometry{
    //  addedd: Date,
    coordinates : Array<number>;
    type: String;    
  };
export class EndPoint {
    _id : string;
    description : string;
    db_name : string;
    downloadedon : Date;

}

export class EndpointinthedbVero {

    _id : string;
    added : Date;
    endPointName : String;
    endPoint : EndPoint;
    dacercare : OpenDataIF;
    daAggiungereARicerca : string;
    color : string;
    // _id: string;
    // collection_name: string;
    // counter: number;
    // geometry: Geometry = new Geometry;
    // human_desc: string;
    // human_name: string;
    // insertedOn : Date;
    // link: string;
    // search_values: string;
}
export class UtenteC   {
    _id: string;
    email: String;
    telefono: String;
    nome: String;
    cognome: String;
    password: String;
    dataIscrizione: Date;
    attivo: boolean;
    tipo : String;
    
   
  
  }