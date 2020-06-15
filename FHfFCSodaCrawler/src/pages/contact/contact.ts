import { IscrizionePage } from './../iscrizione/iscrizione';
import { UtenteC } from './../../models/SaveOpen';
import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { WebJobProvider } from '../../providers/web-job/web-job';
import { Risposta } from '../../models/Risposta';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  items: UtenteC[];
  allitems: UtenteC[];

  loader: any;
  constructor(public navCtrl: NavController, public rest: WebJobProvider, public loadingCtrl: LoadingController) {
    this.refresh();
  }

  refresh() {
    this.loader = this.loadingCtrl.create({
      content: "Sto scaricando ..attendi"
    });
    this.loader.present();
    try {
      this.rest.getUtenti().subscribe((risposta: Risposta) => {

        this.loader.dismiss();
        if (risposta.esito) {
          this.items = risposta.valore;

          this.items.sort((n1, n2) => {
            if (n1.email > n2.email) {
              return 1;
            }
            if (n1.email < n2.email) {
              return -1;
            }

            return 0;
          });
          this.allitems = this.items;


        }
      });
    } catch (error) {
      this.loader.dismiss();
    }
  }

  filterItems(ev: any) {

    console.log('-->', JSON.stringify(ev));
    let val = ev.target.value;
    console.log('-->', val);

    if (val && val.trim() !== '') {
      this.items = this.allitems.filter((item) => {
        return item.email.toLowerCase().includes(val.toLowerCase());
      });

    } else {
      this.items = this.allitems;
    }
  }


  clickElemento(item: UtenteC) {

    this.navCtrl.push(IscrizionePage, { risultati: item });
  }

}
