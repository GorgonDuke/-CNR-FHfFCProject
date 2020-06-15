import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { NativeGeocoder,
  NativeGeocoderReverseResult,
  NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';

/*
  Generated class for the GeocoderProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GeocoderProvider {

  constructor(public http   : Http, private _GEOCODE  : NativeGeocoder) {}


  // reverseGeocode(lat : number, lng : number) : Promise<any>
  // {
  //    return new Promise((resolve, reject) =>
  //    {
  //       this._GEOCODE.reverseGeocode(lat, lng)
  //       .then((result : NativeGeocoderReverseResult) =>
  //       {
  //          let str : string   = `The reverseGeocode address is ${result.} in ${result.countryCode}`;
  //          resolve(str);
  //       })
  //       .catch((error: any) =>
  //       {
  //          reject(error);
  //       });
  //    });
  // }

  calculateDistance(lat1 : number, lat2 : number, lon1 : number, lon2 : number ) {
    let p = 0.017453292519943295;    // Math.PI / 180
    let c = Math.cos;
    let a = 0.5 - c((lat1-lat2) * p) / 2 + c(lat2 * p) *c((lat1) * p) * (1 - c(((lon1- lon2) * p))) / 2;
    let dis = (12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
    return dis;
  }


  forwardGeocode(keyword : string) : Promise<any>
  {
     return new Promise((resolve, reject) =>
     {
        this._GEOCODE.forwardGeocode(keyword)
        .then((coordinates : NativeGeocoderForwardResult[]) =>
        {
           let str : string   = `The coordinates are latitude=${coordinates[0].latitude} and longitude=${coordinates[0].longitude}`;
           resolve(str);
        })
        .catch((error: any) =>
        {
           reject(error);
        });
     });
  }

}
