import { Component } from '@angular/core';
import {   NavController, NavParams, LoadingController } from 'ionic-angular';
import { TwettExport } from './../../models/Tweets';
import { Risposta } from '../../models/Risposta';
import { ToastController } from 'ionic-angular';
import { WebServiceProvider } from '../../providers/web-service/web-service';
/**
 * Generated class for the TweetsViewerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
import { Logger, LogLevel } from 'ask-logger';
const LOGGER = Logger.getLogger('TweetsViewerPage')
LOGGER.set_level(LogLevel.DEBUG)
@Component({
  selector: 'page-tweets-viewer',
  templateUrl: 'tweets-viewer.html',
})
export class TweetsViewerPage {
  items: TwettExport[];
  downloaded: boolean = false;
  // visualizza : boolean = false;

  generic: string;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public rest: WebServiceProvider) {


    let toast = this.toastCtrl.create({
      message: 'Time Out, riprovare più tardi',
      duration: 3000,
      position: 'bottom'
    });

    let loader = this.loadingCtrl.create({
      content: "Sto cercando..."

    });


    loader.onDidDismiss(() => {
      LOGGER.info('[constructor] Dismissed loading');
      if (!this.downloaded) {
         toast.present();
      }
    });

    loader.present();

    setTimeout(() => {
      loader.dismiss();
    }, 10000);

    LOGGER.info("[constructor] PARAMETRI : ", navParams.data.risultato);


    this.rest.getTweets(encodeURI(navParams.data.risultato.human_desc)).subscribe((res: Risposta) => {
      this.downloaded = true;
      loader.dismiss();
      // this.visualizza = true;
      LOGGER.info("[constructor] Twetter: ", res);
      // this.generic = JSON.stringify(res, undefined,"\t");
      this.items = res.valore;

    });



  }

  ionViewDidLoad() {
    LOGGER.info("[ionViewDidLoad] TweetsViewerPage");
  }

}
