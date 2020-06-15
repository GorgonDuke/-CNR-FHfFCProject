import { FormModel } from './../../models/FormModel';
import { Coordinates } from './../../models/Geometry';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HelloIonicPage } from '../hello-ionic/hello-ionic';
import { WebServiceProvider } from '../../providers/web-service/web-service';
import { Storage } from '@ionic/storage';
import leaflet from 'leaflet';
import { Utente } from '../../models/Utente';
/**
 * Generated class for the FormViewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-form-view',
  templateUrl: 'form-view.html',
})


export class FormViewPage {

  @ViewChild('map') mapContainer: ElementRef;
  map: any;
  utente: Utente;
  iscritto: boolean;
  pippo : string;
  formmodel: FormModel;
  imageFileName: String;
  errorMessage: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, public rest: WebServiceProvider, private storage: Storage) {



    this.formmodel = this.navParams.get("risultato");
    this.imageFileName = WebServiceProvider.URL + "immagini/" + this.formmodel._id;
  //  this.pippo = JSON.stringify(this.formmodel);

    this.storage.get("utente").then((val: Utente) => {
      console.log('utente: ', val);
      if (val) {
        this.utente = val;
      }

    });
    console.log('----------------------------------------------------------------------');
    console.log('-|1||->', this.formmodel);
    console.log('----------------------------------------------------------------------');
    console.log('-|||->', this.formmodel.geometry.coordinates);
    console.log('----------------------------------------------------------------------');
  }

  ionViewDidLoad() {
    this.loadmap();


    


  }

  reverseCoordinate() {
    let ar: any[] = this.formmodel.geometry.coordinates;
    let exit: any[] = []
    for (let x of ar[0]) {

      exit.push([x[1], x[0]]);
    }
    return exit;

  }

  loadmap() {
    try {
      this.map = leaflet.map("map").fitWorld();
    } catch (error) {
      console.log("->", error);
    }
    leaflet
    .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attributions:
        'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18
    })
    .addTo(this.map);

    this.map.setView([this.formmodel.indirizzo.lat, this.formmodel.indirizzo.lon], 11)

    let polygon = leaflet.polygon(this.reverseCoordinate());
    this.map.addLayer(polygon);
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
            this.rest.rimuoviAnnuncio(this.formmodel._id, this.utente)
              .subscribe(
                data => {
                  console.log('my data: ', data);
                  this.navCtrl.setRoot(HelloIonicPage);
                },
                error => this.errorMessage = <any>error);
          }
        }
      ]
    });
    alert.present();
  }


}
