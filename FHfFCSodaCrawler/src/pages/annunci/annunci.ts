import { UtenteC } from './../../models/SaveOpen';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http'; 
import { FormModel } from '../../models/FormModel';
// import { FormViewPage } from '../form-view/form-view';
import { Risposta } from '../../models/Risposta';
import { WebJobProvider } from '../../providers/web-job/web-job';
import { FormViewPage } from '../form-view/form-view';




@Component({
  selector: 'annunci-list',
  templateUrl: 'annunci.html'
})
export class AnnunciPage {
  errorMessage: string;
  testo: string;
  icons: string[];
  items: Array<{ title: string, data: String, imageId: String, tutto: FormModel, id: String }>;
  utente: UtenteC;


  constructor(public navCtrl: NavController, public navParams: NavParams, public rest: WebJobProvider, private alertCtrl: AlertController) {
    this.utente = this.navParams.get("risultati");
    console.log("Utente ->", this.utente)

  }

  ionViewDidLoad() {
    this.items = [];
    this.getAnnunci( );

  }

  itemTapped(item) {
    
    console.log('my data: ', item);

    this.navCtrl.push(FormViewPage, { 'risultato': item.tutto });
  }

  getAnnunci () {
    this.rest.getMyAnnunci(this.utente._id)
      .subscribe(
        (data: Risposta) => {
          console.log('my data: --> ', data);

          
          for (let entry of data.valore) {
            let dataix: String;

            

            dataix = new Date(entry.dataInserimento).toLocaleString();

            this.items.push({

              title: '' + entry.tipoOfferta,
              data: dataix,

              imageId: WebJobProvider.SERVER_URL_IMMAGINI + "immagini/" + entry._id,
              tutto: entry,
              id: entry._id

            });
          }

        },
        error => this.errorMessage = <any>error);
  }






}
