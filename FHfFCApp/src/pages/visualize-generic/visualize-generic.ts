import { FormViewPage } from './../form-view/form-view';
import { GmapsPage } from './../gmap/gmap';
import { TweetsViewerPage } from './../tweets-viewer/tweets-viewer';
import { DescriptionViewerPage } from './../description-viewer/description-viewer';
import { TwettExport } from './../../models/Tweets';
import { Component } from '@angular/core';
import {   NavController, NavParams } from 'ionic-angular';
import { WebServiceProvider } from '../../providers/web-service/web-service';
import { Risposta } from '../../models/Risposta';
import { AnnuncioViewRicercaPage } from '../annuncio-view-ricerca/annuncio-view-ricerca';

/**
 * Generated class for the VisualizeGenericPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-visualize-generic',
  templateUrl: 'visualize-generic.html',
})
export class VisualizeGenericPage {
  parametri: any;
  par: any;
  descrizione: any;
  gmap: any;
  tweets: any;
  ntweet: number;
  items : TwettExport[];
  constructor(public navCtrl: NavController, public navParams: NavParams, public rest: WebServiceProvider) {
    console.log("RISULTATO : ", navParams.data.risultato);
    if (navParams.data.risultato.collection_name === "Annunci") {
     
      
      this.descrizione = AnnuncioViewRicercaPage;
    } else {
      this.descrizione = DescriptionViewerPage;
      
      
    }
   


    this.tweets = TweetsViewerPage;
    this.gmap = GmapsPage;
    this.parametri = { risultato: navParams.data.risultato, coordinate : navParams.data.coordinate};
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VisualizeGenericPage');
  }


}
