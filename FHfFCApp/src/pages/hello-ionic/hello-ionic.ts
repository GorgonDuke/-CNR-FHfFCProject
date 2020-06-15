import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { GeocoderProvider } from '../../providers/geocoder/geocoder';
import { NavController , AlertController } from 'ionic-angular';
import { WebServiceProvider } from '../../providers/web-service/web-service';

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})

// Questo è il nome a cui fa ruiferimento' in app.component.ts
export class HelloIonicPage {

  public geocoded: boolean;
  public results: string;


  constructor(public navCtrl    : NavController, public _GEOCODE: GeocoderProvider, private alertCtrl: AlertController,private storage: Storage, public rest: WebServiceProvider) {

  }

  wfs() {
    this.rest.getWFS().subscribe( (val) => {
      console.log("RISULTATO",val);
    })
  }

  verifica() {
    this.storage.get('utente').then((val) => {
      console.log(val);
      console.log(val.email);
    });
  }

  cancella() {
    this.storage.remove('utente');
  }


}
