import { Component } from '@angular/core';
import { Utente } from './../../models/Utente';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { WebServiceProvider } from '../../providers/web-service/web-service';
import { FormModel } from '../../models/FormModel';
import { FormViewPage } from '../form-view/form-view';
import { Risposta } from '../../models/Risposta';




@Component({
  selector: 'annunci-list',
  templateUrl: 'annunci.html'
})
export class AnnunciPage {
  errorMessage: string;
  testo: string;
  icons: string[];
  items: Array<{ title: string, data: String, imageId: String, tutto: FormModel, id: String }>;
  utente: Utente;
  iscritto: boolean;


  constructor(public navCtrl: NavController, private storage: Storage, public navParams: NavParams, public rest: WebServiceProvider, private alertCtrl: AlertController) {
  }

  ionViewDidLoad() {

    // this.storage.get('utente').then((val) => {
    //   console.log(val);
    //   this.utente = val;
    //   if (val != null) {
    //     this.getAnnunci('4cca9850-fb84-11e7-aead-b3af175e376b');    
    //   }
    // });

    // this.getAnnunci("8a49e920-0c40-11e8-bf1b-eb7251a3c3bf");
    this.items = [];
    this.storage.get("utente").then( (val : Utente) => {
      console.log('utente: ',val);
      if ( val) {

        this.utente = val;
        
        this.getAnnunci();
        
      } 

    });








  }
  itemTapped(item) {


    console.log('my data: ', item);

    this.navCtrl.push(FormViewPage, { 'risultato': item.tutto });
  }

  getAnnunci( ) {
    this.rest.getMyAnnunci(this.utente)
      .subscribe(
      (data:Risposta) => {
        console.log('my data: --> ', data);

        //    var endPoint = <EndpointinthedbIf> data

        // console.log("-------------------------");
        for (let entry of data.valore) {
          let dataix: String;

          dataix = new Date(entry.dataInserimento).toLocaleString();

          this.items.push({

            title: '' + entry.tipoOfferta,
            data: dataix,

            imageId:  WebServiceProvider.URL + "immagini/" + entry._id,
            tutto: entry,
            id: entry._id

          });
        }

      },
      error => this.errorMessage = <any>error);
  }






}
