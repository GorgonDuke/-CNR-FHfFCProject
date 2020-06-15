export class Geometry{
    //  addedd: Date,
    coordinates : any;
    type: String;    


    reverseCoordinate() {
      let ar: any[] = this.coordinates;
      let exit: any[] = []
      for (let x of ar[0]) {
  
        exit.push([x[1], x[0]]);
      }
      return exit;
  
    }
  };



  export class Coordinates {
    lat: number;
    lng: number;
  }
  
  