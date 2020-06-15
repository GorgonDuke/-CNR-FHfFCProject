import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import leaflet from 'leaflet';
/**
 * Generated class for the MappaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-mappa',
  templateUrl: 'mappa.html',
})
export class MappaPage {

  @ViewChild('map') mapContainer: ElementRef;
  map: any;
  items: any[];
  titolo : string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    // console.log("->",this.navParams.get("risultati"));
    this.items = this.navParams.get("risultati");
    this.titolo = this.navParams.get("titolo");
  }

  ionViewDidEnter() {
    this.loadmap();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MappaPage');
  }

  loadmap() {
    this.map = leaflet.map("map").fitWorld();
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18
    }).addTo(this.map);


    let markerGroup = leaflet.featureGroup();
    for (let item of this.items) {
      let marker: any = leaflet.marker([item.geometry.coordinates[1], item.geometry.coordinates[0]]).on('click', () => {
        alert('Marker clicked');
      })
      markerGroup.addLayer(marker);
    }

    this.map.addLayer(markerGroup);
    
    this.map.setView([45.585135, 9.281153], 11)

    this.map.locate({
      setView: true,
      maxZoom: 10
    }) 

  }

}
