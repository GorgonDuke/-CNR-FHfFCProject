import { EndPoint } from './../../models/SaveOpen';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { OpenData, EndpointinthedbVero } from '../../models/SaveOpen'
import { WebJobProvider } from '../../providers/web-job/web-job';
/**
 * Generated class for the ListaElementiPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-lista-elementi',
  templateUrl: 'lista-elementi.html',
})
export class ListaElementiPage {
  titolo : string;
  elementi: any[];
  headers: Array<string> = [];
  indirizzo: string;
  protoEndPoint: any;
  tipo : string ;

  openData: OpenData = new OpenData();
  loader: any;
  items: Array<Array<string>> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public rest: WebJobProvider, public loadingCtrl: LoadingController) {
    this.indirizzo = this.navParams.get("indirizzo");
    this.elementi = this.navParams.get("risultati");
    this.protoEndPoint = this.navParams.get("element");
    this.titolo = this.protoEndPoint.title;
    this.openData.color = "#FFFFFF"
    if (this.elementi) {
      let elemento: any = this.elementi[0];
      for (let x in elemento) {
        if (typeof elemento[x] === "string") {
          this.headers.push(x);
        } else {
          for (let a in elemento[x]) {
            this.headers.push(x + "." + a);
          }
        }

      }
      console.log("Risultato : ", this.headers);
      for (let y of this.elementi) {
        let oggetto: string[] = [];
        for (let z in y) {
          if (typeof y[z] === 'string') {
            oggetto.push(y[z]);
          } else {
            for (let a in y[z]) {
              oggetto.push(y[z][a]);
            }

          }

        }
        this.items.push(oggetto);
      }
    }


  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ListaElementiPage');
  }

  download() {

    this.loader = this.loadingCtrl.create({
      content: "Sto scaricando ..attendi"
    });
    this.loader.present();

    let e: EndpointinthedbVero = new EndpointinthedbVero();
    //   endP.human_name = this.protoEndPoint.title;
    console.log("Prima : ", this.protoEndPoint.title)
    let x: string = this.protoEndPoint.title.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    console.log("Normalizzazione : ", x)
    let y: string = x.replace(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/gi, "")
    console.log("Replace1 : ", y);
    let z: string = y.replace(new RegExp(" ", 'g'), "-");
    console.log("Replace2 : ", z);
    e.added = new Date();
    let ep: EndPoint = new EndPoint();
    ep._id = this.indirizzo;
    ep.db_name = z;
    ep.description = this.protoEndPoint.title;
    ep.downloadedon = new Date();
    e.endPoint = ep;
    e.color = this.openData.color;
    
    e.endPointName = this.protoEndPoint.title;
    let toSearch: string = "";
    let is1: boolean = true;
    for (let a of this.protoEndPoint.keyword) {
      if (is1) {
        toSearch = a;
        is1 = false;
      } else {
        toSearch = toSearch + ";" + a;
      }
    }
    e.dacercare = this.openData;
    
    if (this.tipo) {
      e.daAggiungereARicerca = toSearch + this.tipo; 
      
    } else {
      e.daAggiungereARicerca = toSearch; 
    }



    console.log("Risultato : ", e);

    this.rest.getAllSinglePoints(this.indirizzo).subscribe((data: any[]) => {

      this.rest.salaGenericEndpoint(e,data).subscribe((risposta ) => {
        console.log("Risposta  : ", risposta);
        this.navCtrl.popToRoot() 
      })

      this.loader.dismiss();


    });

  }


}
