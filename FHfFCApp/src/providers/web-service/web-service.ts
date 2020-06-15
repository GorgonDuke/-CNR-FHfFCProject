import { Observable } from 'rxjs/Observable';

import { FormModel } from './../../models/FormModel';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { DomSanitizer } from '@angular/platform-browser';

import { Utente } from '../../models/Utente';
// import { Risposta } from '../../models/Risposta';
// import { ResponseContentType, RequestOptionsArgs, RequestOptions } from '@angular/http';
/*
  Generated class for the WebServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class WebServiceProvider {

  // private categorieURL = 'http://localhost:3000/endPoints';
  // private iscrizioneURL = 'http://localhost:3000/iscriviti';

  // public static URL : string = 'http://127.0.0.1:3000/';
  public static URL: string = 'https://fhffcapp.it/endPoints/';
  // public static URL: string = 'http://192.168.1.12:3000/';
  // public static URL: string = 'http://10.0.5.17:3000/';
  // public static URL : string = 'http://192.168.1.9:3000/';

  public static UPLOADURL = WebServiceProvider.URL + 'offerta/upload';
  private categorieURL = WebServiceProvider.URL + 'endPoints';
  private genericURL = WebServiceProvider.URL + 'getGeneric/';
  private tweetURL = WebServiceProvider.URL + 'tweeet/'
  private verificaURL = WebServiceProvider.URL + 'utente/login/'
  private iscrizioneURL = WebServiceProvider.URL + 'iscriviti';
  private modificaURL = WebServiceProvider.URL + 'utente/modifica';
  private iMieiAnnunciUrl = WebServiceProvider.URL + 'myannunci/';
  private singoloAnnuncioUrl = WebServiceProvider.URL + 'getAnnunci/';
  private iRimuoviAnnunciUrl = WebServiceProvider.URL + 'myannunci/delete/';
  private iAccountUrl = WebServiceProvider.URL + 'utente/delete/';
  private risulati = WebServiceProvider.URL + "ricerca/";
  private getPositionByIp = "http://ip-api.com/json";


  // private TEMP_URL: string = "http://ugbd.get-it.it/proxy/?proxyTo=http://ugbd.get-it.it/geoserver/wms?version=1.1.0&transparent=TRUE&format=image%2Fpng&srs=EPSG%3A4326&bbox=14.05072%2C%2040.82471%2C%2014.30817%2C%2040.91915&service=WMS&request=GetMap&styles=&layers=geonode%3ANAPOLI_DEFORMAZIONE_MAP&width=256&height=256"


  
  private TEMP_URL: string = "https://ugbd.get-it.it/proxy/cesium/aHR0cDovL3VnYmQuZ2V0LWl0Lml0L2dlb3NlcnZlci9nZW9ub2RlL3dtcz9zZXJ2aWNlPVdNUyZ2ZXJzaW9uPTEuMS4wJnJlcXVlc3Q9R2V0TWFwJmxheWVycz1nZW9ub2RlOk5BUE9MSV9ERUZPUk1BWklPTkVfTUFQJnN0eWxlcz0mYmJveD0xNC4wNTA3Miw0MC44MjQ3MSwxNC4zMDgxNyw0MC45MTkxNSZ3aWR0aD04OTkmaGVpZ2h0PTMzMCZzcnM9RVBTRzo0MzI2JmZvcm1hdD1pbWFnZS9wbmc=?";

  // private TEMP_URL:string = "http://ugbd.get-it.it/proxy/?proxyTo=http://ugbd.get-it.it/geoserver/geonode/wms&REQUEST=GetFeatureInfo&EXCEPTIONS=application%2Fvnd.ogc.se_xml&BBOX=13.953422%2C40.788963%2C14.405468%2C40.954897&SERVICE=WMS&INFO_FORMAT=application/json&QUERY_LAYERS=geonode%3ANAPOLI_DEFORMAZIONE_MAP&FEATURE_COUNT=50&Layers=geonode%3ANAPOLI_DEFORMAZIONE_MAP&WIDTH=899&HEIGHT=330&format=image%2Fpng&styles=&srs=EPSG%3A4326&version=1.1.1&x=585&y=207";

  // private altetnativeGeocoding = "http://www.datasciencetoolkit.org/maps/api/geocode/json?sensor=false&address="
  private altetnativeGeocoding = "https://nominatim.openstreetmap.org/search/";

  // via%20Ugo%20Foscolo%20Monticello%20italy?
  private altetnativeGeocoding2 = "?format=json&addressdetails=1&limit=1&polygon_svg=1";

  constructor(public http: HttpClient, private _sanitizer: DomSanitizer) {
    console.log('Hello WebServiceProvider Provider');

  }


  


  postFile(fileToUpload: File, formModel: FormModel,account: Utente)  {

    const formData: FormData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    formData.append('formModel', JSON.stringify(formModel));
    let auth: string = account.email + ":" + account.password;

    let httpHeaders = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', "Basic " + btoa(auth));
    // let auth: string = account.email + ":" + account.password;
    console.log('-------------------POSTFILE---------------------------------');
    console.log("Auth -> ", auth);
    // console.log('xxx---> ', auth);
    // let httpHeaders = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', "Basic " + btoa(auth));
 
    
    return this.http
      .post(WebServiceProvider.UPLOADURL, formData )
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }


  getWFS()  {
    console.log('xxx---> ', this.TEMP_URL);

    // let httpHeader7s = new HttpHeaders().set('Content-Type', 'image/png');
    return this.http.get(this.TEMP_URL, { responseType: 'blob' }).map(blob => {
      console.log("Blob", blob)
      var urlCreator = window.URL;
      return this._sanitizer.bypassSecurityTrustUrl(urlCreator.createObjectURL(blob));
    })


    // .map(this.fornisciRisposta)
    // .catch(this.handleError);
  }


  getGeocoding(indirizzo: string)  {
    console.log('xx11111x---> ', this.altetnativeGeocoding + indirizzo + this.altetnativeGeocoding2);
    return this.http.get(this.altetnativeGeocoding + indirizzo + this.altetnativeGeocoding2)
      .map(this.fornisciRisposta)
      .catch(this.handleError);
    // return this.http.jsonp(this.altetnativeGeocoding + indirizzo + this.altetnativeGeocoding, 'callback')
    // .map(this.fornisciRisposta)
    // .catch(this.handleError);
  }

  getPosition()  {
    console.log('xxx---> ', this.getPositionByIp);
    return this.http.get(this.getPositionByIp)
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }


  getCategorie()  {

    console.log("Categorie URL : ", this.categorieURL)

    // let auth: string = account.email + ":" + account.password;

    // let httpHeaders = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', "Basic " + btoa(auth));
    // headers.append('Content-Type', 'application/json; charset=utf-8');
    // console.log('xxx---> ', this.categorieURL);
    // console.log('xxx-2--> ', httpHeaders);
    // console.log('xxx-"Authorization"--> ', httpHeaders.get('Authorization'));
    // console.log('xxx-btoa("username:password")--> ', btoa(auth));
    return this.http.get(this.categorieURL)
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }

  getSingoloAnnuncio(id: string)  {
    console.log('xxx---> ', this.singoloAnnuncioUrl);
    return this.http.get(this.singoloAnnuncioUrl + id)
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }


  getGeneric(id: string, dbname: string)  {
    console.log('xxx---> ', this.genericURL);
    return this.http.get(this.genericURL + id + "/" + dbname)
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }

  getTweets(id: string)  {
    console.log('xxx---> ', this.tweetURL);
    return this.http.get(this.tweetURL + id)
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }


  getRisultato(frase: string, categorie: string[], coordinate: number[], distanza: number,preferenza: string )  {

    console.log('xxx---> ', this.risulati + frase + "/" + JSON.stringify(categorie) + "/" + JSON.stringify(coordinate) + "/" + distanza + "/" + preferenza);

    return this.http.get(this.risulati + frase + "/" + JSON.stringify(categorie) + "/" + JSON.stringify(coordinate) + "/" + distanza + "/" + preferenza)
      .map(this.fornisciRisposta)
      .catch(this.handleError);

  }

  verificaIscrizione(user: string, pass : string)  {
    let auth: string = user + ":" + pass;
    let httpHeaders = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', "Basic " + btoa(auth));
    return this.http.get(this.verificaURL  + user, { headers: httpHeaders })
    .map(this.fornisciRisposta)
    .catch(this.handleError);
  }

  getMyAnnunci(account: Utente)  {

    let auth: string = account.email + ":" + account.password;

    let httpHeaders = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', "Basic " + btoa(auth));
    return this.http.get(this.iMieiAnnunciUrl + account.id, { headers: httpHeaders })
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }
  rimuoviAnnuncio(id: string, account: Utente)  {
    let auth: string = account.email + ":" + account.password;

    let httpHeaders = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', "Basic " + btoa(auth));
    return this.http.get(this.iRimuoviAnnunciUrl + id, { headers: httpHeaders })
      .map(this.fornisciRisposta)
      .catch(this.handleError);
  }

  eliminaAccount(account: Utente)  {
    let auth: string = account.email + ":" + account.password;

    let httpHeaders = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', "Basic " + btoa(auth));
    return this.http.get(this.iAccountUrl + account.id, { headers: httpHeaders })
      .map((res: Response) => res)
      .catch(this.handleError);
  }

  postIscrizione(account: Utente) {
    let auth: string = account.email + ":" + account.password;

    let httpHeaders = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', "Basic " + btoa(auth));

    return this.http.post(this.iscrizioneURL, {
      headers: httpHeaders,
      utente: account
    })
      .map((res: Response) => res)
      .catch((error: any) => Observable.throw(error.json().error || 'Server error')); //...errors if any

  }

  postModifica(account: Utente, oldpass : string, oldmail : string) {
    let auth: string = oldmail + ":" +  oldpass ;
    console.log("UP ->", auth);
    let httpHeaders = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', "Basic " + btoa(auth));

    return this.http.post(this.modificaURL, {
      utente: account
    },  {headers: httpHeaders})
      .map((res: Response) => res)
      .catch((error: any) => Observable.throw(error.json().error || 'Server error')); //...errors if any

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
