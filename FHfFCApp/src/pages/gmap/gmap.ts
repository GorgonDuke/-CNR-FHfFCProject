
import { Component, ViewChild, ElementRef } from "@angular/core/";
import { Geolocation } from '@ionic-native/geolocation';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { Coordinates } from '../../models/Geometry'
import { WebServiceProvider } from "../../providers/web-service/web-service";
import { Risposta } from "../../models/Risposta";
declare var google;

@Component({
  selector: 'gmap',
  templateUrl: 'gmap.html'


})


export class GmapsPage {
  @ViewChild('directionsPanel') directionsPanel: ElementRef;
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  coordinates: number[] = [];
  origine: Coordinates = new Coordinates();
  destinazione: Coordinates = new Coordinates();

  constructor(public navCtrl: NavController, public navParams: NavParams, private geolocation: Geolocation, public rest: WebServiceProvider) {


    console.log("PARAMETRI : ", navParams.data.risultato);
    console.log("NAME : ", navParams.data.risultato.collection_name);
    if (navParams.data.risultato.collection_name === "Annunci") {
      console.log(" E' ANNUNCI");
      rest.getSingoloAnnuncio(navParams.data.risultato._id).subscribe((res: Risposta) => {

        if (res) {
          this.destinazione.lat = +res.valore.indirizzo.lat;
          this.destinazione.lng = +res.valore.indirizzo.lon;
        }
      });

    } else {
      console.log("NON E' ANNUNCI");
      this.destinazione.lat = +navParams.data.risultato.geometry.coordinates[1];
      this.destinazione.lng = +navParams.data.risultato.geometry.coordinates[0];
    }
    this.coordinates = this.navParams.get("coordinate");


    this.origine.lat = this.coordinates[1];
    this.origine.lng = this.coordinates[0];

  }

  ionViewDidLoad() {

    this.initMap();
    this.startNavigating();
    // this.geolocation.getCurrentPosition().then((resp) => {
    //   this.origine.lat = +resp.coords.latitude;
    //   this.origine.lng=  +resp.coords.longitude;
    //   
    //  }).catch((error) => {
    //    console.log('Error getting location', error);
    //  });


  }

  initMap() {

    var image = 'assets/imgs/me.png';
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 7,
      center: this.origine
    });

    var position = new google.maps.LatLng(this.origine.lat, this.origine.lng);
    var museumMarker = new google.maps.Marker({
      position: position,
      title: "Punto",
      icon: image,
      animation: google.maps.Animation.DROP
    });

    museumMarker.setMap(this.map);
  }



  startNavigating() {

    let directionsService = new google.maps.DirectionsService;
    let directionsDisplay = new google.maps.DirectionsRenderer;

    directionsDisplay.setMap(this.map);
    directionsDisplay.setPanel(this.directionsPanel.nativeElement);

    directionsService.route({
      origin: this.origine,
      destination: this.destinazione,
      travelMode: google.maps.TravelMode['DRIVING']
    }, (res, status) => {

      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(res);
      } else {
        console.warn(status);
      }

    });

  }


}
