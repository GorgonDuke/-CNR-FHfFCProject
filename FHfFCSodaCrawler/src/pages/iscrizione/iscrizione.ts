import { AnnunciPage } from './../annunci/annunci';
import { ContactPage } from './../contact/contact';
import { UtenteC } from './../../models/SaveOpen';
import { Risposta } from './../../models/Risposta';
import { Component } from '@angular/core';

import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
 
 
import { Toast } from '@ionic-native/toast';
import { WebJobProvider } from '../../providers/web-job/web-job';
/**
 * Generated class for the IscrizionePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-iscrizione',
  templateUrl: 'iscrizione.html',
})




export class IscrizionePage {
  esiste: boolean;
  account: UtenteC;
  confermaPassoword: String;
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private toastCtrl: ToastController, 
    public rest: WebJobProvider, 
    private toast: Toast, 
    private alertCtrl: AlertController) {
   
      this.account = this.navParams.get("risultati");
      console.log("utente : ", this.account);
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FormInserimentoPage');
  }
  vediAnnunci() {
    this.navCtrl.push(AnnunciPage, { risultati: this.account});
  }

  rimuoviaccount() {
    let alert = this.alertCtrl.create({
      title: 'Attenzione',
      subTitle: 'Desideri Eliminare questo account ?',
      buttons: [{
        text: 'Indietro',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }, {
        text: 'Sì,Elimina',

        handler: () => {
          // let toast = this.toastCtrl.create({
          //   message: this.account.id,
          //   duration: 6000,
          //   position: 'top'
          // });
          // toast.present();

          this.rest.eliminaAccount(this.account._id).subscribe((data:Risposta) => {

            console.log("--->", data);
            if (!data.esito) {
              let toast = this.toastCtrl.create({
                message: "Qualcosa è andato storto riprova più tardi",
                duration: 6000,
                position: 'bottom'
              });
              toast.present();
            } else {
               
              this.navCtrl.setRoot(ContactPage);
              let toast = this.toastCtrl.create({
                message: "Utente eliminato",
                duration: 6000,
                position: 'bottom'
              });
              toast.present();
              this.navCtrl.setRoot(ContactPage);
            }


          });
       








        }

      }]
    });
    alert.present();
  }

  riattivaaccount() {
    let alert = this.alertCtrl.create({
      title: 'Attenzione',
      subTitle: 'Desideri riattivare questo account ?',
      buttons: [{
        text: 'Indietro',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }, {
        text: 'Sì,Riattiva',

        handler: () => {
          // let toast = this.toastCtrl.create({
          //   message: this.account.id,
          //   duration: 6000,
          //   position: 'top'
          // });
          // toast.present();

          this.rest.riattivaAccount(this.account._id).subscribe((data:Risposta) => {

            console.log("--->", data);
            if (!data.esito) {
              let toast = this.toastCtrl.create({
                message: "Qualcosa è andato storto riprova più tardi",
                duration: 6000,
                position: 'bottom'
              });
              toast.present();
            } else {
               
              this.navCtrl.setRoot(ContactPage);
              let toast = this.toastCtrl.create({
                message: "Utente riattivato",
                duration: 6000,
                position: 'bottom'
              });
              toast.present();
              this.navCtrl.setRoot(ContactPage);
            }


          });
       








        }

      }]
    });
    alert.present();
  }

 
  validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

}
