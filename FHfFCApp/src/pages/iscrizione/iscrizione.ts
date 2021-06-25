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
import { Logger, LogLevel } from 'ask-logger';
const LOGGER = Logger.getLogger('IscrizionePage')
LOGGER.set_level(LogLevel.DEBUG)
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
      // LOGGER.info("[CONST] utente : ", val);
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
    LOGGER.info("[ionViewDidLoad] IscrizionePage");
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
              LOGGER.info("[verificaI2] Utente : ", data);
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
            LOGGER.info("[rimuoviaccount] Cancel clicked");
          }
        },
        {
          text: "Sì,Elimina",

          handler: () => {
            this.rest
              .eliminaAccount(this.account)
              .subscribe((data: Risposta) => {
                LOGGER.info("[rimuoviaccount] risposta : ", data);
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
    LOGGER.info("[invia]");
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
              LOGGER.info("[invia] result", risposta);

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
              LOGGER.error("[invia] error",error);
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
            LOGGER.info("[modifica] No clicked");
          }
        },
        {
          text: "Si Salva!",
          handler: data => {
            LOGGER.info("[modifica] save clicked");

            if (this.validateEmail(this.account.email)) {
              if (this.account.password == this.confermaPassoword) {
                if (this.oldpassword == data.password) {
                  this.rest
                    .postModifica(this.account, this.oldpassword, this.oldmail)
                    .subscribe(
                      (risposta: Risposta) => {
                        LOGGER.info("[modifica] result", risposta);
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
                        LOGGER.error("[modifica] error", error);
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
