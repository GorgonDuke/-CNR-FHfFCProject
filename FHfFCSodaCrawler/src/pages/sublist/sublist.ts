import { ListaElementiPage } from './../lista-elementi/lista-elementi';
import { TabsPage } from './../tabs/tabs';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { WebJobProvider } from '../../providers/web-job/web-job';

/**
 * Generated class for the SublistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-sublist',
  templateUrl: 'sublist.html',
})
export class SublistPage {
  subitems: any[];
  loader : any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public rest: WebJobProvider,  public loadingCtrl: LoadingController) {

    this.subitems = this.navParams.get("risultati");
  }

  indietro() {
    this.navCtrl.push(TabsPage);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SublistPage');
  }

  clickElemento(event, elemento: any) {

    this.loader = this.loadingCtrl.create({
      content: "Sto scaricando ..attendi"
    });
    this.loader.present();

    try {
      let landing: string = elemento.landingPage;

      let elements: string[] = landing.split("/");

      this.rest.getSinglePoints(elements[elements.length-1]).subscribe( (data) => {
        this.loader.dismiss();
        this.navCtrl.push(ListaElementiPage, { risultati: data, indirizzo : elements[elements.length-1], element : elemento });
      });
    } catch (err) {
      this.loader.dismiss();
      console.log("Errore : ", err);
    }

  }

}
