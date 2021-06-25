import { Geolocation } from '@ionic-native/geolocation';
import { IscrizionePage } from './../iscrizione/iscrizione';
import { TakepicturePage } from './../takepicture/takepicture';

import { FormModel } from './../../models/FormModel';
import { Utente } from './../../models/Utente';
import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import * as circleToPolygon from 'circle-to-polygon';
import { IonicPage, NavController, NavParams, AlertController, Platform } from 'ionic-angular';
import { GeocoderProvider } from '../../providers/geocoder/geocoder';
import { NativeGeocoder,   NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';
import { WebServiceProvider } from '../../providers/web-service/web-service';

/**
 * Generated class for the FormInserimentoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

import { Logger, LogLevel } from 'ask-logger';
const LOGGER = Logger.getLogger('FormInserimentoPage')
LOGGER.set_level(LogLevel.DEBUG)
@Component({
  selector: 'page-form-inserimento',
  templateUrl: 'form-inserimento.html',
})

export class FormInserimentoPage {
  isApp: boolean;
  regioneselected: string;
  regioni: Array<string> = ["Lombardia", "Piemonte"];
  provinciaselected: Array<string>;
  provinciaItems: Array<string>;
  provinceLombardia: Array<string> = ['Bergamo', 'Brescia', 'Como', 'Cremona', 'Lecco', 'Lodi', 'Mantova', 'Milano', 'Monza e Brianza', 'Pavia', 'Sondrio', 'Varese'];
  provincePiemonte: Array<string> = ['Alessandria', 'Asti', 'Biella', 'Cuneo', 'Novara', 'Torino', 'Verbano Cusio Ossola', 'Vercelli'];
  campiDiEsercizio: Array<String> = ['Aiuto generico', 'Assistenza Anziani', 'Care Giver', 'Baby Sitter', 'Spesa a Domicilio'];

  raggi: Array<Object> = [['2 km', 2], ['5 km', 5], ['10 km', 10], ['20 km', 20], ['50 km', 50], ['100 km', 100], ['200 km', 200], ['Ovunque In Lombardia', 500]];

  items: Array<{ title: string, tutti: boolean }>;
  utente: Utente;
  formmodel: FormModel = new FormModel();

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private storage: Storage,
    private nativeGeocoder: NativeGeocoder,
    private toast: Toast,
    public plt: Platform,
    public rest: WebServiceProvider) {
    if (this.plt.is('core') || this.plt.is('mobileweb')) {
      LOGGER.info("[constructor] È UN BROWSER");
      this.isApp = false;
    } else {
      LOGGER.info("[constructor] NON È UN BROWSER");
      this.isApp = true;

    }


    this.storage.get('utente').then((val) => {
      LOGGER.info("[constructor] utente ");
      this.utente = val;
      if (val == null) {
        let alert = this.alertCtrl.create({
          title: 'Attenzione',
          subTitle: '&Eacute; necessario iscriversi prima',
          buttons: [{
            text: 'Avanti',
            role: 'avanti',
            handler: () => {
              LOGGER.info("[constructor]Avanti Cliccato");
              this.navCtrl.push(IscrizionePage);
            }
          }]
        });
        alert.present();
      }
    });

  }

  regionTapped(event) {
    LOGGER.info("[regionTapped]", event);
    if (event === this.regioni[0]) {
      this.provinciaItems = this.provinceLombardia;
    } else {
      this.provinciaItems = this.provincePiemonte;
    }
  }
  provinciaTapped(event) {
    LOGGER.info("[provinciaTapped]", event);
  }

  buttonTapped() {

    this.storage.get('utente').then((val) => {
      LOGGER.info("[buttonTapped]",val);
      this.utente = val;
      if (val == null) {
        let alert = this.alertCtrl.create({
          title: 'Attenzione',
          subTitle: '&Eacute; necessario iscriversi prima',
          buttons: [{
            text: 'Avanti',
            role: 'avanti',
            handler: () => {
              this.navCtrl.push(IscrizionePage);
            }
          }]
        });
        alert.present();
      }
    });


    this.formmodel.utenteId = this.utente.id;
    LOGGER.info("[buttonTapped]", this.formmodel);
    if (this.formmodel.notValid().length > 0) {
      let errorText: string;
      let isfirst: boolean = true;
      for (let entry of this.formmodel.notValid()) {
        if (isfirst) {
          errorText = entry;
          isfirst = false;
        } else {
          errorText = errorText + ", " + entry;
        }
      }
      let alert = this.alertCtrl.create({
        title: 'Attenzione',
        subTitle: 'I campi obbligatori : ' + errorText + ' non sono stati compilati',
        buttons: ['Indietro']
      });
      alert.present();
    } else {

      LOGGER.info("[buttonTapped]this.formmodel.indirizzo.getStringIndirizzo() :",this.formmodel.indirizzo.getStringIndirizzo());

      this.formmodel.dataInserimento = new Date();




      if (this.isApp) {
        this.rest.getGeocoding(this.formmodel.indirizzo.getStringIndirizzoNoGoogle()+"%20italy")
        .subscribe((data) => {

          LOGGER.info("[buttonTapped] A getGeocoding:",data);
          let coordinates: Array<number>;
          coordinates = [+data[0].lon, +data[0].lat];
          this.formmodel.indirizzo.lon = +data[0].lon;
          this.formmodel.indirizzo.lat = +data[0].lat;
            let radius: Number = this.formmodel.raggio * 1000;                           // in meters
            let numberOfEdges: Number = 16;
            this.formmodel.geometry = circleToPolygon(coordinates, radius, numberOfEdges);
            this.navCtrl.push(TakepicturePage, { formmodel: this.formmodel });
          })
      } else {
        this.rest.getGeocoding(this.formmodel.indirizzo.getStringIndirizzoNoGoogle()+"%20italy")
        .subscribe((data) => {
          LOGGER.info("[buttonTapped] B getGeocoding:", data);
          let coordinates: Array<number>;
          coordinates = [+data[0].lon, +data[0].lat]; //[lon, lat]
          this.formmodel.indirizzo.lon = +data[0].lon;
          this.formmodel.indirizzo.lat = +data[0].lat;
          let radius: Number = this.formmodel.raggio * 1000;                           // in meters
          let numberOfEdges: Number = 16;                     //optional that defaults to 32
          this.formmodel.geometry = circleToPolygon(coordinates, radius, numberOfEdges);
          this.navCtrl.push(TakepicturePage, { formmodel: this.formmodel });
        })

      }
    }




  }

  ionViewDidLoad() {
    LOGGER.info("[ionViewDidLoad] FormInserimentoPage");
  }

}
