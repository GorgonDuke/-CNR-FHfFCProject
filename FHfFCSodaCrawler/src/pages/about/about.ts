import { MappaPage } from './../mappa/mappa';
import { EndpointinthedbVero } from './../../models/SaveOpen';
import { Risposta } from './../../models/Risposta';
import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { WebJobProvider } from '../../providers/web-job/web-job';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  items: EndpointinthedbVero[] = [];
  loader : any;

  constructor(public navCtrl: NavController, public rest: WebJobProvider, public loadingCtrl: LoadingController) {
    
    console.log("ci entro")
    rest.getEndPointsSalvati().subscribe((risposta: Risposta) => {
      if (risposta.esito) {
        this.items = risposta.valore;

        this.items.sort((n1, n2) => {
          if (n1.endPoint.description > n2.endPoint.description) {
            return 1;
          }
          if (n1.endPoint.description < n2.endPoint.description) {
            return -1;
          }

          return 0;
        });

        
      }
    });
  }

  aggiorna() {
    this.rest.getEndPointsSalvati().subscribe((risposta: Risposta) => {
      if (risposta.esito) {
        this.items = risposta.valore;

        this.items.sort((n1, n2) => {
          if (n1.endPoint.description > n2.endPoint.description) {
            return 1;
          }
          if (n1.endPoint.description < n2.endPoint.description) {
            return -1;
          }

          return 0;
        });

        
      }
    });
  }
  clickTipo(event, item : EndpointinthedbVero) {
    this.loader = this.loadingCtrl.create({
      content: "Sto cercando... Ci vuole un po' ..sono tanti"
    });
    this.loader.present();
    this.rest.getEndPointPerCategoria(item.endPoint.db_name).subscribe((risposta : Risposta) => {
      this.loader.dismiss();
      if(risposta.esito) {
        this.navCtrl.push(MappaPage, { risultati: risposta.valore, titolo : item.endPoint.description });
      } else {
        // METTERE UN TOAST
      }
    });

  }

}
