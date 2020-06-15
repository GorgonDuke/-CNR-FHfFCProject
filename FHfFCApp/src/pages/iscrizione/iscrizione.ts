import { Risposta } from "./../../models/Risposta";
import { Component } from "@angular/core";

import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
  ToastController
} from "ionic-angular";
import { Utente } from "./../../models/Utente";
import { Storage } from "@ionic/storage";
import { Toast } from "@ionic-native/toast";
import { WebServiceProvider } from "../../providers/web-service/web-service";
import { HelloIonicPage } from "../hello-ionic/hello-ionic";
/**
 * Generated class for the IscrizionePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-iscrizione",
  templateUrl: "iscrizione.html"
})
export class IscrizionePage {
  esiste: boolean;
  account: Utente = new Utente();
  confermaPassoword: String;
  verifica: boolean;
  iscritto: boolean;
  oldpassword: string;
  oldmail: string;
  privacy: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    public rest: WebServiceProvider,
    private storage: Storage,
    private toast: Toast,
    private alertCtrl: AlertController
  ) {
    this.storage.get("utente").then((val: Utente) => {
      console.log("utente : ", val);
      if (val) {
        this.account = val;
        this.oldpassword = this.account.password;
        this.confermaPassoword = this.account.password;
        this.oldmail = this.account.email;
        this.esiste = true;
        this.privacy = true;
      } else {
        this.esiste = false;
        this.privacy = false;
      }
    });
    this.verifica = false;
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad FormInserimentoPage");
  }

  verificaI1() {
    this.verifica = true;
  }
  verificaI2() {
    if (this.validateEmail(this.account.email)) {
      if (this.account.password) {
        this.rest
          .verificaIscrizione(this.account.email, this.account.password)
          .subscribe((data: Risposta) => {
            if (data.esito) {
              console.log("Utente : ", data);
              this.storage.set("utente", data.valore.utente).then(err => {
                let toast = this.toastCtrl.create({
                  message: "Verifica avvenuta con successo",
                  duration: 3000,
                  position: "bottom"
                });
                toast.present();
                this.navCtrl.setRoot(HelloIonicPage);
              });
            } else {
              let toast = this.toastCtrl.create({
                message: "Errore riprova",
                duration: 3000,
                position: "bottom"
              });
              toast.present();
            }
          });
      } else {
        let toast = this.toastCtrl.create({
          message: "Attenzione campo password vuoto",
          duration: 6000,
          position: "bottom"
        });
        toast.present();  
      }
    } else {
      let toast = this.toastCtrl.create({
        message: "Attenzione email non valida",
        duration: 6000,
        position: "bottom"
      });
      toast.present();
    }
  }

  rimuoviaccount() {
    let alert = this.alertCtrl.create({
      title: "Attenzione",
      subTitle: "Desideri Eliminare il tuo account ?",
      buttons: [
        {
          text: "Indietro",
          role: "cancel",
          handler: () => {
            console.log("Cancel clicked");
          }
        },
        {
          text: "Sì,Elimina",

          handler: () => {
            // let toast = this.toastCtrl.create({
            //   message: this.account.id,
            //   duration: 6000,
            //   position: 'top'
            // });
            // toast.present();

            this.rest
              .eliminaAccount(this.account)
              .subscribe((data: Risposta) => {
                console.log("--->", data);
                if (!data.esito) {
                  let toast = this.toastCtrl.create({
                    message: "Qualcosa è andato storto riprova più tardi",
                    duration: 6000,
                    position: "bottom"
                  });
                  toast.present();
                } else {
                  this.storage.remove("utente");
                  this.navCtrl.setRoot(HelloIonicPage);
                  let toast = this.toastCtrl.create({
                    message: "Utente eliminato",
                    duration: 6000,
                    position: "bottom"
                  });
                  toast.present();
                  this.navCtrl.setRoot(HelloIonicPage);
                }
              });
          }
        }
      ]
    });
    alert.present();
  }

  invia() {
    console.log("SCHIACCIO IL BOTTONE! ");
    if (!this.privacy) {
      let toast = this.toastCtrl.create({
        message: "Attenzione è necessario accettare le norme sulla privacy",
        duration: 6000,
        position: "bottom"
      });
      toast.present();
    } else {
      if (this.validateEmail(this.account.email)) {
        if (this.account.password == this.confermaPassoword) {
          this.rest.postIscrizione(this.account).subscribe(
            (risposta: Risposta) => {
              console.log("-Esito-->", risposta);

              if (risposta.esito) {
                this.account.id = risposta.valore.id;
                this.storage.set("utente", this.account).then(err => {
                  let toast = this.toastCtrl.create({
                    message: "Iscrizione avvenuta con successo",
                    duration: 3000,
                    position: "bottom"
                  });
                  toast.present();
                  this.navCtrl.setRoot(HelloIonicPage);
                });
                // this.toast.show(`Iscrizione avvenuta con successo`, '3000', 'center').subscribe(
                //   toast => {
                //     console.log(toast);
                //   }
                // );
              } else {
                let toast = this.toastCtrl.create({
                  message: risposta.status,
                  duration: 3000,
                  position: "bottom"
                });
                toast.present();
                // this.toast.show(data.error, '5000', 'center').subscribe(
                //   toast => {
                //     console.log(toast);
                //   }
                // );
                // this.navCtrl.setRoot(HelloIonicPage);
              }
            },
            error => {
              console.log("ERROR");
              this.navCtrl.setRoot(HelloIonicPage);
            }
          );
        } else {
          let toast = this.toastCtrl.create({
            message: "Attenzione Le password non coincidono",
            duration: 6000,
            position: "bottom"
          });
          toast.present();
        }
      } else {
        let toast = this.toastCtrl.create({
          message: "Attenzione email non valida",
          duration: 6000,
          position: "bottom"
        });
        toast.present();
      }
    }
  }

  modifica() {
    let alert = this.alertCtrl.create({
      title: "Confermi di voler salvare la modifica ? ",
      inputs: [
        {
          name: "password",
          placeholder: "Password prima della modifica",
          type: "password"
        }
      ],
      buttons: [
        {
          text: "No",
          role: "cancel",
          handler: () => {
            console.log("No clicked");
          }
        },
        {
          text: "Si Salva!",
          handler: data => {
            console.log("Si Salva! clicked");

            if (this.validateEmail(this.account.email)) {
              if (this.account.password == this.confermaPassoword) {
                if (this.oldpassword == data.password) {
                  this.rest
                    .postModifica(this.account, this.oldpassword, this.oldmail)
                    .subscribe(
                      (risposta: Risposta) => {
                        console.log("-Esito-->", risposta);

                        if (risposta.esito) {
                          this.account.id = risposta.valore.id;
                          this.storage.set("utente", this.account).then(err => {
                            let toast = this.toastCtrl.create({
                              message: "Modifica avvenuta con successo",
                              duration: 3000,
                              position: "bottom"
                            });
                            toast.present();
                            this.navCtrl.setRoot(HelloIonicPage);
                          });
                          // this.toast.show(`Iscrizione avvenuta con successo`, '3000', 'center').subscribe(
                          //   toast => {
                          //     console.log(toast);
                          //   }
                          // );
                        } else {
                          let toast = this.toastCtrl.create({
                            message: risposta.status,
                            duration: 3000,
                            position: "bottom"
                          });
                          toast.present();
                        }
                      },
                      error => {
                        console.log("ERROR");
                        this.navCtrl.setRoot(HelloIonicPage);
                      }
                    );
                } else {
                  let toast = this.toastCtrl.create({
                    message: "Attenzione password errata",
                    duration: 6000,
                    position: "bottom"
                  });
                  toast.present();
                }
              } else {
                let toast = this.toastCtrl.create({
                  message: "Attenzione Le password non coincidono",
                  duration: 6000,
                  position: "bottom"
                });
                toast.present();
              }
            } else {
              let toast = this.toastCtrl.create({
                message: "Attenzione email non valida",
                duration: 6000,
                position: "bottom"
              });
              toast.present();
            }
          }
        }
      ]
    });
    alert.present();
  }

  validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
}
