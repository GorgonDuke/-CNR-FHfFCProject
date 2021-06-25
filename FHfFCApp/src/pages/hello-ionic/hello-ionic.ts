import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { GeocoderProvider } from '../../providers/geocoder/geocoder';
import { NavController , AlertController } from 'ionic-angular';
import { WebServiceProvider } from '../../providers/web-service/web-service';
import { Logger, LogLevel } from 'ask-logger';
const LOGGER = Logger.getLogger('HelloIonicPage')
LOGGER.set_level(LogLevel.DEBUG)
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
      LOGGER.info("[WFS] resutl ",val);
    })
  }

  verifica() {
    this.storage.get('utente').then((val) => {
      LOGGER.info("[verifica] resutl ", val);
    });
  }

  cancella() {
    this.storage.remove('utente');
  }


}
