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
    console.log("ID : ", navParams.data.risultato._id);
    this.formmodel  = new FormModel();
    rest.getSingoloAnnuncio(navParams.data.risultato._id).subscribe((data: Risposta) => {
      console.log("RISULTATO data : ", data);
      if (data) {
        this.formmodel = data.valore;
        this.initMap();
        this.imageFileName = WebServiceProvider.URL + "immagini/" + this.formmodel._id;
      }
    });

    this.storage.get("utente").then( (val : Utente) => {
      console.log('utente: ',val);
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


    console.log("-||********||--->", this.getcoordinates());


    var position = new google.maps.LatLng(45.476548, 9.235040);
    var museumMarker = new google.maps.Polygon({
      paths: this.getcoordinates(),
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35
    });


    // var museumMarker = new google.maps.Marker({position: position, 
    //   title: "Punto",
    //   icon: image,
    //   animation: google.maps.Animation.DROP
    // });

    museumMarker.setMap(this.map);

    // Marker({
    //   position: position,
    //   title: "Punto",
    //   icon: image,
    //   animation: google.maps.Animation.DROP
    // });
    // museumMarker.setMap(this.map);
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
                  console.log('my data: ', data);

                },
                error => this.errorMessage = <any>error);
          }
        }
      ]
    });
    alert.present();
  }
}
