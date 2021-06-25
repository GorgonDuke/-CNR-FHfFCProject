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


import { Logger, LogLevel } from 'ask-logger';
const LOGGER = Logger.getLogger('AnnunciPage')
LOGGER.set_level(LogLevel.DEBUG)

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


    this.items = [];
    this.storage.get("utente").then( (val : Utente) => {
      LOGGER.info("[ionViewDidLoad] utente:");
      if ( val) {

        this.utente = val;

        this.getAnnunci();

      }

    });








  }
  itemTapped(item) {

    LOGGER.info("[itemTapped] data:", item);

    this.navCtrl.push(FormViewPage, { 'risultato': item.tutto });
  }

  getAnnunci( ) {
    this.rest.getMyAnnunci(this.utente)
      .subscribe(
      (data:Risposta) => {
          LOGGER.info("[getAnnunci] data:", data);
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
