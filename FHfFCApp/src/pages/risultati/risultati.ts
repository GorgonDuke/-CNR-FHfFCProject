import { GenericEndPoint } from "./../../models/GenericEndPoint";
import { Geolocation } from "@ionic-native/geolocation";
import { Component, ViewChild, ElementRef } from "@angular/core/";
import { NavController, NavParams, Platform } from "ionic-angular";
import { WebServiceProvider } from "../../providers/web-service/web-service";
import { VisualizeGenericPage } from "../visualize-generic/visualize-generic";
import { Coordinates, Geometry } from "../../models/Geometry";

import * as circleToPolygon from "circle-to-polygon";
import leaflet from "leaflet";
import { EndPoint } from "../../models/EndPoint";
/**
 * Generated class for the RisultatiPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var google;

@Component({
  selector: "page-risultati",
  templateUrl: "risultati.html"
})
export class RisultatiPage {
  categorie: EndPoint[];
  markerCluster: any;
  markers: any = [];
  items: GenericEndPoint[] = [];
  coordinates: number[] = [];
  @ViewChild("map")
  mapContainer: ElementRef;
  map: any;
  stile: string;
  stilew: string;
  stilew2: string;
  score: boolean;
  markerGroup = leaflet.featureGroup();
  distanza: number;
  origine: Coordinates = new Coordinates();
  isApp: boolean;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public rest: WebServiceProvider,
    private geolocation: Geolocation,
    public plt: Platform
  ) {
    // let categorie : string [] = ['Unita-di-Offerta-Sociale-Prima-Infanzia','Elenco-CSS-per-disabili'];
    console.log("co", this.navParams.get("coordinate"));
    this.coordinates = this.navParams.get("coordinate");
    this.distanza = this.navParams.get("distanza");
    this.categorie = this.navParams.get("categorie");
    console.log("-> CATEGORIE -> ", this.categorie);
    this.origine.lat = this.coordinates[1];
    this.origine.lng = this.coordinates[0];
    this.score = true;

    if (this.plt.is("core") || this.plt.is("mobileweb")) {
      this.isApp = false;
      this.stile = "600px";
      this.stilew = "50%";
      this.stilew2 = "50%";
    } else {
      console.log("NON È UN BROWSER");
      this.isApp = true;
      this.stile = "500px";
      this.stilew = "100%";
      this.stilew2 = "0%";
    }
  }

  ordinaDistanza() {
    this.items.sort((a, b) => {
      if (a.distance < b.distance) return -1;
      if (a.distance > b.distance) return 1;
      return 0;
    });
    this.score = false;
    this.disegnaMarker();
  }
  ordinaScore() {
    this.items.sort((a, b) => {
      if (a.score < b.score) return 1;
      if (a.score > b.score) return -1;
      return 0;
    });
    this.score = true;
    this.disegnaMarker();
  }

  getColor(nome: string) {
    let found: EndPoint = this.categorie.find(x => x.dbname == nome);
    if (found) {
      return found.color;
    } else {
      return "#000000";
    }
  }

  calculateDistance(lat1: number, lat2: number, lon1: number, lon2: number) {
    let p = 0.017453292519943295; // Math.PI / 180
    let c = Math.cos;
    let a =
      0.5 -
      c((lat1 - lat2) * p) / 2 +
      (c(lat2 * p) * c(lat1 * p) * (1 - c((lon1 - lon2) * p))) / 2;
    let dis = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    return Math.round(dis * 10) / 10;
  }

  removeItem(gep: GenericEndPoint) {
    let itemFound = this.items.find(
      (itemEf: GenericEndPoint) => itemEf._id === gep._id
    );
    if (itemFound) {
      const index: number = this.items.indexOf(itemFound);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
    }
  }

  ionViewDidLoad() {
    this.items = this.navParams.get("risultati");
    this.items.sort((a, b) => {
      if (a.score < b.score) return 1;
      if (a.score > b.score) return -1;
      return 0;
    });
    console.log("ITEMS->", JSON.stringify(this.items));

    let itemsToRemove : GenericEndPoint[] = [];

    for (let item of this.items) {
      item.score = Math.round(item.score * 100) / 100;
      if (item.annunciLat) {

        
        item.distance = this.calculateDistance(
          item.annunciLat,
          this.origine.lat,
          item.annunciLon,
          this.origine.lng
        );
        if (item.distance > this.distanza) {
          itemsToRemove.push(item);
        }
      } else {
        item.distance = this.calculateDistance(
          item.geometry.coordinates[1],
          this.origine.lat,
          item.geometry.coordinates[0],
          this.origine.lng
        );
        if (item.distance > this.distanza) {
          itemsToRemove.push(item);
        }
      }
    }

    for ( let item of itemsToRemove) {
      console.log("Removed -> ", JSON.stringify(item))
      this.removeItem(item);
    }

    this.initMap();

    // this.geolocation.getCurrentPosition().then((resp) => {
    //   this.origine.lat = +resp.coords.latitude;
    //   this.origine.lng = +resp.coords.longitude;
    //

    // }).catch((error) => {
    //   console.log('Error getting location', error);
    // });
  }

  getcoordinates(geometry: Geometry) {
    let exit: Coordinates[] = [];

    let element = geometry.coordinates[0];
    for (let c of element) {
      let temp: Coordinates = new Coordinates();

      temp.lat = c[1];
      temp.lng = c[0];

      exit.push(temp);
    }
    console.log("Poligono : ", exit);

    return exit;
  }

  reverseCoordinate(geometry: Geometry) {
    let ar: any[] = geometry.coordinates;
    let exit: any[] = [];
    for (let x of ar[0]) {
      exit.push([x[1], x[0]]);
    }
    return exit;
  }

  initMap() {
    try {
      this.map = leaflet.map("map").fitWorld();
    } catch (error) {
      console.log("->", error);
    }
    if (!this.origine.lat) {
      this.origine.lat = 45.479987;
      this.origine.lng = 9.223779;
    }

    leaflet
      .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attributions:
          'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18
      })
      .addTo(this.map);

    this.map.setView([this.origine.lat, this.origine.lng], 12);
    // this.map = new google.maps.Map(this.mapElement.nativeElement, {
    //   zoom: 10,
    //   center: this.origine
    // });

    let coordinates: Array<number>;
    coordinates = [this.origine.lng, this.origine.lat]; //[lon, lat]

    let geometry: Geometry = new Geometry();
    geometry = circleToPolygon(coordinates, this.distanza * 1000, 16);
    console.log("GEOMETRY -> ", geometry);
    let polygon = leaflet.polygon(this.reverseCoordinate(geometry));
    this.map.addLayer(polygon);

    this.disegnaMarker();

    this.map.addLayer(this.markerGroup);
  }

  itemTapped(event, item) {
    this.navCtrl.push(VisualizeGenericPage, {
      risultato: item,
      coordinate: this.coordinates
    });
    console.log("HO CLICCATO : ", item);
  }

  disegnaMarker() {
    this.markerGroup.clearLayers();
    let counter: number = 0;
    for (let element of this.items) {
      element.image = "assets/imgs/" + counter + ".png";
      // let position;
      let museumMarker: any;

      const myCustomColour = this.getColor(element.collection_name);
      element.color = myCustomColour;
      const markerHtmlStyles = `
        background-color: ${myCustomColour};
        width: 3rem;
        height: 3rem;
        display: block;
        text-align: center;     
      
        position: relative;
        color: white;
        transform: rotate(45deg);
        border-radius: 3rem 3rem 0;        
        border: 1px solid #FFFFFF`;

      let greenIcon = leaflet.divIcon({
        className: "my-custom-pin",
        iconAnchor: [0, 24],
        labelAnchor: [-6, 0],
        popupAnchor: [0, -36],
        html: `<span style="${markerHtmlStyles}" >${counter}</span>`
      });

      // transform: rotate(45deg);
      // left: -1.5rem;
      // left: -1.5rem;
      // top: -1.5rem;
      // let greenIcon = leaflet.icon({
      //   iconUrl: 'assets/imgs/' + counter + '.png',
      //   iconSize: [15, 15], // size of the icon
      //   iconAnchor: [0, 0], // point of the icon which will correspond to marker's location

      // });

      if (element.collection_name === "Annunci") {
        if (element.annunciLat) {
          museumMarker = leaflet.marker(
            [element.annunciLat, element.annunciLon],
            { icon: greenIcon }
          );
        }
      } else {
        museumMarker = leaflet.marker(
          [element.geometry.coordinates[1], element.geometry.coordinates[0]],
          { icon: greenIcon }
        );
      }

      if (museumMarker) {
        museumMarker.on("click", () => {
          this.navCtrl.push(VisualizeGenericPage, {
            risultato: element,
            coordinate: this.coordinates
          });
          console.log("HO CLICCATO : ", element);
        });
        this.markerGroup.addLayer(museumMarker);
      }

      counter = counter + 1;
    }

    let marker: any = leaflet
      .marker([this.origine.lat, this.origine.lng])
      .on("click", () => {
        alert("Sei qui");
      });
    this.markerGroup.addLayer(marker);
  }
}
