import { FormModel } from './../../models/FormModel';
import { Coordinates } from './../../models/Geometry';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import leaflet from 'leaflet';
import { WebJobProvider } from '../../providers/web-job/web-job';
import { ContactPage } from '../contact/contact';
import { AnnunciPage } from '../annunci/annunci';
 
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


  formmodel: FormModel;
  imageFileName: String;
  errorMessage: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, public rest: WebJobProvider) {



    this.formmodel = this.navParams.get("risultato");
    console.log('----------------------------------------------------------------------');
    console.log('-|1||->', this.formmodel);
    console.log('----------------------------------------------------------------------');
    console.log('-|||->', this.formmodel.geometry.coordinates);
    console.log('----------------------------------------------------------------------');
  }

  ionViewDidLoad() {
    this.loadmap();


    this.imageFileName = WebJobProvider.SERVER_URL_IMMAGINI + "immagini/" + this.formmodel._id;


  }

  ionViewDidEnter() {

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
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18
    }).addTo(this.map);

    
    this.map.setView([this.formmodel.indirizzo.lat,this.formmodel.indirizzo.lon],12)

    let polygon = leaflet.polygon(this.reverseCoordinate());
    this.map.addLayer(polygon);
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


  // initMap() {
  //   console.log("->", this.imageFileName);
  //   var image = 'assets/imgs/me.png';
  //   this.map = new google.maps.Map(this.mapElement.nativeElement, {
  //     zoom: 6,
  //     center: { lat: this.formmodel.indirizzo.lat, lng: this.formmodel.indirizzo.lon }
  //   });


  //   console.log("-||********||--->", this.getcoordinates());


  //   // var position = new google.maps.LatLng(45.476548, 9.235040);
  //   var museumMarker = new google.maps.Polygon({
  //         paths: this.getcoordinates(),
  //         strokeColor: '#FF0000',
  //         strokeOpacity: 0.8,
  //         strokeWeight: 2,
  //         fillColor: '#FF0000',
  //         fillOpacity: 0.35
  //       });


  //   // var museumMarker = new google.maps.Marker({position: position, 
  //   //   title: "Punto",
  //   //   icon: image,
  //   //   animation: google.maps.Animation.DROP
  //   // });

  //   museumMarker.setMap(this.map);

  //   // Marker({
  //   //   position: position,
  //   //   title: "Punto",
  //   //   icon: image,
  //   //   animation: google.maps.Animation.DROP
  //   // });
  //   // museumMarker.setMap(this.map);
  // }


  buttonTapped() {

    let alert = this.alertCtrl.create({
      title: 'Richiesta conferma',
      message: 'Vuoi veramente eliminare questo annuncio ?',
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
            this.rest.rimuoviAnnuncio(this.formmodel._id)
              .subscribe(
                data => {
                  console.log('my data: ', data);
                  this.navCtrl.setRoot(ContactPage);
                },
                error => this.errorMessage = <any>error);
          }
        }
      ]
    });
    alert.present();
  }

  riattiva() {

    let alert = this.alertCtrl.create({
      title: 'Richiesta conferma',
      message: 'Vuoi veramente riattivare questo annuncio ?',
      buttons: [
        {
          text: 'Indietro',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Riattiva',
          handler: () => {
            this.rest.riattivaAnnuncio(this.formmodel._id)
              .subscribe(
                data => {
                  console.log('my data: ', data);
                  this.navCtrl.setRoot(ContactPage);
                },
                error => this.errorMessage = <any>error);
          }
        }
      ]
    });
    alert.present();
  }



}
