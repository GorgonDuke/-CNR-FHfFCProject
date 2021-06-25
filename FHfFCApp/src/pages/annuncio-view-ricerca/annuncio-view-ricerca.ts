import { FormModel } from './../../models/FormModel';
import { Coordinates } from './../../models/Geometry';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HelloIonicPage } from '../hello-ionic/hello-ionic';
import { WebServiceProvider } from '../../providers/web-service/web-service';
import { Risposta } from '../../models/Risposta';
import { Utente } from '../../models/Utente';


import { Storage } from '@ionic/storage';
declare var google;
/**
/**
 * Generated class for the AnnuncioViewRicercaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
import { Logger, LogLevel } from 'ask-logger';
const LOGGER = Logger.getLogger('AnnuncioViewRicercaPage')
LOGGER.set_level(LogLevel.DEBUG)

@Component({
  selector: 'page-annuncio-view-ricerca',
  templateUrl: 'annuncio-view-ricerca.html',
})
export class AnnuncioViewRicercaPage {


  @ViewChild('map') mapElement: ElementRef;



  map: any;
  formmodel: FormModel;
  imageFileName: String;
  errorMessage: string;

  utente: Utente;
  iscritto: boolean;

  constructor(public navCtrl: NavController, private storage: Storage, public navParams: NavParams, private alertCtrl: AlertController, public rest: WebServiceProvider) {
    LOGGER.info("[constructor] ID :", navParams.data.risultato._id);
    this.formmodel  = new FormModel();
    rest.getSingoloAnnuncio(navParams.data.risultato._id).subscribe((data: Risposta) => {
      LOGGER.info("[constructor] RISULTATO getSingoloAnnuncio : ", data);
      if (data) {
        this.formmodel = data.valore;
        this.initMap();
        this.imageFileName = WebServiceProvider.URL + "immagini/" + this.formmodel._id;
      }
    });

    this.storage.get("utente").then( (val : Utente) => {

      if ( val) {

        this.utente = val;


      }

    });


  }

  ionViewDidLoad() {



  }

  getcoordinates() {

    let exit: Coordinates[] = [];

    let element = this.formmodel.geometry.coordinates[0];
    for (let c of element) {

      let temp: Coordinates = new Coordinates();

      temp.lat = c[1];
      temp.lng = c[0];

      exit.push(temp);
    }


    return exit;
  }


  initMap() {
    console.log("->", this.imageFileName);

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 11,
      center: { lat: this.formmodel.indirizzo.lat, lng: this.formmodel.indirizzo.lon }
    });


    LOGGER.info("[initMap] coordinates:", this.getcoordinates());


    var position = new google.maps.LatLng(45.476548, 9.235040);
    var museumMarker = new google.maps.Polygon({
      paths: this.getcoordinates(),
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35
    });
    museumMarker.setMap(this.map);
  }


  buttonTapped() {

    let alert = this.alertCtrl.create({
      title: 'Richiesta conferma',
      message: 'Vuoi veramente eliminare il tuo annuncio ?',
      buttons: [
        {
          text: 'Indietro',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Elimina',
          handler: () => {
            this.rest.rimuoviAnnuncio(this.navParams.get("oggetto").id,this.utente)
              .subscribe(
                data => {
                  LOGGER.info("[buttonTapped] my data: ", data);

                },
                error => {
                  LOGGER.error("[buttonTapped]", error);
                  this.errorMessage = <any>error
                });
          }
        }
      ]
    });
    alert.present();
  }
}
