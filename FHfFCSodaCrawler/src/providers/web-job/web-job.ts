import { EndPoint, EndpointinthedbVero } from './../../models/SaveOpen';

import { HttpClient } from '@angular/common/http';
import { Injectable, enableProdMode } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as soda from 'soda-js';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
/*
  Generated class for the WebJobProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/



@Injectable()
export class WebJobProvider {


  public static URL: string = 'https://www.dati.lombardia.it/data.json';
  // public static SERVER_URL: string = 'http://192.168.1.10:3002/';
  public static SERVER_URL: string = 'http://127.0.0.1:3002/';
  public static SERVER_URL_IMMAGINI: string = 'http://192.168.1.10:3000/';
  public static SODA_URL: string = 'dati.lombardia.it';
  constructor(public http: HttpClient) {
    console.log('Hello WebJobProvider Provider');
  }


  getEndPoints(): Observable<any> {

    return this.http.get(WebJobProvider.URL)
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }
 
  getEndPointsSalvati(): Observable<any> {
    console.log("->",WebJobProvider.SERVER_URL+'prendiEndPointSalvati');
    return this.http.get(WebJobProvider.SERVER_URL+'prendiEndPointSalvati')
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }

  getUtenti(): Observable<any> {

    return this.http.get(WebJobProvider.SERVER_URL+'prendiUtenti')
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }
  eliminaAccount(id : string): Observable<any> {
    return this.http.get(WebJobProvider.SERVER_URL+"utente/delete/"+ id)
      .map((res: Response) => res)
      .catch(this.handleError);
  }

  riattivaAccount(id : string): Observable<any> {
    return this.http.get(WebJobProvider.SERVER_URL+"utente/reactivate/"+ id)
      .map((res: Response) => res)
      .catch(this.handleError);
  }
  

  getMyAnnunci(utenteId : string): Observable<any> {
    return this.http.get(WebJobProvider.SERVER_URL+ 'myannunci/' +utenteId)
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }

  rimuoviAnnuncio(id : string): Observable<any> {
    return this.http.get(WebJobProvider.SERVER_URL+'myannunci/delete/'+ id)
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }

  riattivaAnnuncio(id : string): Observable<any> {
    return this.http.get(WebJobProvider.SERVER_URL+'myannunci/reactivate/'+ id)
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }

  getEndPointPerCategoria(categoria: string): Observable<any> {

    return this.http.get(WebJobProvider.SERVER_URL+'prendiEndPointPerCategoria/' + categoria)
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }
  getOpenData(): Observable<any> {

    return this.http.get(WebJobProvider.SERVER_URL+ 'prendiOpenData')
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }
  

  salaGenericEndpoint(endpoint: EndpointinthedbVero, data: any[]): Observable<any> {
    console.log("Provo a salvare numero documentio : ", data.length);
    console.log("------------------------------------------------------------");
    console.log(WebJobProvider.SERVER_URL + "salaGenericEndpoint");
    console.log("------------------------------------------------------------");

    return this.http.post(WebJobProvider.SERVER_URL + "salaGenericEndpoint", {
      endpoint: endpoint,
      valori : data
    }).map(this.fornisciRisposta)
      .catch(this.handleError);
  }
  saveOpenData(data: any[]): Observable<any> {
    console.log("Provo a salvare numero documentio : ", data.length);
    console.log("------------------------------------------------------------");
    console.log(WebJobProvider.SERVER_URL + "salvaOpenData");
    console.log("------------------------------------------------------------");

    return this.http.post(WebJobProvider.SERVER_URL + "salvaOpenData", {
      opengeo: data
    }).map(this.fornisciRisposta)
      .catch(this.handleError);
  }

  getSinglePoints(id: string): Observable<any> {

    let temp: Subject<any> = new Subject<any>();

    let consumer = new soda.Consumer(WebJobProvider.SODA_URL);

    consumer.query()
      .withDataset(id)
      .limit(15)
      .getRows()
      .on('success', (rows) => {
        temp.next(rows);
      }).on('error', (error) => { return [] });

    return temp.asObservable();
    // return this.http.get(url)
    // .map(this.fornisciRisposta)
    // .catch(this.handleError);
  }

  getAllSinglePoints(id: string): Observable<any> {

    let temp: Subject<any> = new Subject<any>();

    let consumer = new soda.Consumer(WebJobProvider.SODA_URL);

    consumer.query()
      .withDataset(id)
      .getRows()
      .on('success', (rows) => {
        temp.next(rows);
      }).on('error', (error) => { return [] });

    return temp.asObservable();
  }



  private fornisciRisposta(res: Response) {
    let body: Response = res;
    return body;
  }


  private handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const err = error || '';
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

}
