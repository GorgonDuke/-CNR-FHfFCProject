import { IndirizzoModel } from "./../../models/IndrizzoModel";
import { RisultatiPage } from "./../risultati/risultati";
import { Component } from "@angular/core";

import {
  NavController,
  NavParams,
  Platform,
  LoadingController
} from "ionic-angular";
import { AlertController } from "ionic-angular";
import { Geolocation } from "@ionic-native/geolocation";
import { Storage } from "@ionic/storage";
// import { HttpClient } from '@angular/common/http';
import { WebServiceProvider } from "../../providers/web-service/web-service";
import { Risposta } from "../../models/Risposta";
import { EndPoint } from "../../models/EndPoint";
import { Endpointinthedb } from "../../models/Endpointinthedb";
import {
  NativeGeocoder,
  NativeGeocoderForwardResult
} from "@ionic-native/native-geocoder";
import { compareTwoStrings } from "string-similarity";
import { Utente } from "../../models/Utente";
import { GenericEndPoint } from "../../models/GenericEndPoint";
import { Logger, LogLevel } from 'ask-logger';
const LOGGER = Logger.getLogger('ListPage')
LOGGER.set_level(LogLevel.DEBUG)
@Component({
  selector: "page-list",
  templateUrl: "list.html"
})
export class ListPage {
  public static GPS: string = "GPS";
  public static INDIRIZZO: string = "INDIRIZZO";

  isApp: boolean;
  errorMessage: string;
  testo: string;
  coordinates: number[] = [];
  icons: string[];
  items: EndPoint[];
  distanza: number;
  avanzata: boolean;

  tipoRicerca: string;
  indirizzo: IndirizzoModel;
  visualizzaIndirizzo: boolean;
  account: Utente = new Utente();
  iscritto: boolean;
  b_lat: number;
  b_lon: number;
  D_LON: number = 9.223779;
  D_LAT: number = 45.479987;
  private preferenza: string = "";

  constructor(
    public navCtrl: NavController,
    private nativeGeocoder: NativeGeocoder,
    private storage: Storage,
    public navParams: NavParams,
    public rest: WebServiceProvider,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private geolocation: Geolocation,
    public plt: Platform
  ) {
    this.distanza = 10;
    this.avanzata = false;
    this.iscritto = false;

    this.tipoRicerca = ListPage.GPS;
    this.indirizzo = new IndirizzoModel();
    this.visualizzaIndirizzo = false;



    if (this.plt.is("core") || this.plt.is("mobileweb")) {
      LOGGER.info("[constructor] È UN BROWSER");
      this.isApp = false;
    } else {
      LOGGER.info("[constructor] NON È UN BROWSER");
      this.isApp = true;
    }

    this.storage.get("utente").then((val: Utente) => {
      // console.log(val);
      if (val == null) {
        this.iscritto = false;
        this.getCountries();
      } else {
        this.account = val;
        LOGGER.info("[constructor] ACCOUNT ", this.account);
        this.getCountries();
        this.iscritto = true;
        switch (this.account.tipo) {
          case "BAMBINI":
            this.preferenza = "infanzia bambini minori";
            break;
          case "ANZIANI":
            this.preferenza = "anziani terza eta nonni";
            break;
          case "DISABILI":
            this.preferenza = "disabile handicap ";
            break;
        }
      }
    });

    this.items = [];

    this.items.push({
      title: "Tutti",
      conferma: true,
      tutti: true,
      dbname: null,
      color: null,
      tipo: null,
      pertinence: 10
    });
  }

  ordinaDistanza() {
    if (this.account) {
      if (this.account.tipo) {
        this.items.sort((a, b) => {
          if (a.pertinence < b.pertinence) return 1;
          if (a.pertinence > b.pertinence) return -1;
          return 0;
        });
      }
    }
  }

  avanzataTapped() {
    this.avanzata = !this.avanzata;
  }

  tipoTapped() {
    LOGGER.info("[tipoTapped] research type: ", this.tipoRicerca);
    if (this.tipoRicerca == ListPage.INDIRIZZO) {
      this.visualizzaIndirizzo = true;

    } else {
      if (this.plt.is("core") || this.plt.is("mobileweb")) {
        LOGGER.info("È UN BROWSER");
        this.isApp = false;

        if (this.b_lat) {
          this.coordinates[0] = this.b_lon;
          this.coordinates[1] = this.b_lat;
        } else {
          this.coordinates[0] = this.D_LON;
          this.coordinates[1] = this.D_LAT;
        }
      } else {
        LOGGER.info("[tipoTapped] NON È UN BROWSER");
        this.isApp = true;
      }
      this.visualizzaIndirizzo = false;
    }
  }

  ionViewDidLoad() {
    if (!this.isApp) {
      if (window.navigator && window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(
          position => {
            try {
              LOGGER.info("[ionViewDidLoad] A Position:", position);
              this.b_lat = position.coords.latitude;
              this.b_lon = position.coords.longitude;

              this.coordinates[0] = this.b_lon;
              this.coordinates[1] = this.b_lat;
            } catch (err) {
              this.coordinates[0] = 9.223779;
              this.coordinates[1] = 45.479987;
            }
          },
          error => {
            switch (error.code) {
              case 1:
                LOGGER.info("[ionViewDidLoad] A Permission Denied");
                this.coordinates[0] = 9.223779;
                this.coordinates[1] = 45.479987;
                break;
              case 2:
                LOGGER.info("[ionViewDidLoad] A Position Unavailable");
                this.coordinates[0] = 9.223779;
                this.coordinates[1] = 45.479987;
                break;
              case 3:
                LOGGER.info("[ionViewDidLoad] A Timeout");
                this.coordinates[0] = 9.223779;
                this.coordinates[1] = 45.479987;
                break;
            }
          }
        );
      } else {
        LOGGER.warn("[ionViewDidLoad] A Posizione NON TROVATA WEB");
        this.coordinates[1] = 45.479987;
      }
    } else {
      this.geolocation
        .getCurrentPosition()
        .then(resp => {
          LOGGER.info("[ionViewDidLoad] B Posizione trovata ");
          this.coordinates[0] = resp.coords.longitude;
          this.coordinates[1] = resp.coords.latitude;
        })
        .catch(error => {
          if (window.navigator && window.navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition(
              position => {
                // this.geolocationPosition = position,
                try {
                  LOGGER.info("[ionViewDidLoad] B POSITION",  position);

                  this.b_lat = position.coords.latitude;
                  this.b_lon = position.coords.longitude;

                  this.coordinates[0] = this.b_lon;
                  this.coordinates[1] = this.b_lat;
                } catch (err) {
                  this.coordinates[0] = 9.223779;
                  this.coordinates[1] = 45.479987;
                }
              },
              error => {
                switch (error.code) {
                  case 1:
                    LOGGER.info("[ionViewDidLoad] B Permission Denied");
                    this.coordinates[0] = 9.223779;
                    this.coordinates[1] = 45.479987;
                    break;
                  case 2:
                    LOGGER.info("[ionViewDidLoad] B Position Unavailable");
                    this.coordinates[0] = 9.223779;
                    this.coordinates[1] = 45.479987;
                    break;
                  case 3:
                    LOGGER.info("[ionViewDidLoad] B Timeout");
                    this.coordinates[0] = 9.223779;
                    this.coordinates[1] = 45.479987;
                    break;
                }
              }
            );
          } else {
            LOGGER.warn("[ionViewDidLoad] B NON TROVATA WEB");
            this.coordinates[1] = 45.479987;
          }

        });
    }
  }

  getCountries() {
    // this.rest.getCategorie();
    this.rest.getCategorie().subscribe(
      (data: Risposta) => {
        LOGGER.info("[getCountries] getCategorie: ", data);

        let temp: Endpointinthedb[] = data.valore;
        for (let entry of temp) {
          this.items.push({
            title: "" + entry.endPoint.description,
            conferma: true,
            tutti: false,
            dbname: entry.endPoint.db_name,
            color: entry.color,
            tipo: entry.tipo,
            pertinence: this.compare2String(entry.tipo)
          });
        }
        LOGGER.info("[getCountries] items",this.items);
        LOGGER.info("[getCountries] items",this.account.tipo);
        this.ordinaDistanza();
      },
      error => (this.errorMessage = <any>error)
    );
  }

  compare2String(a: string) {
    if (this.iscritto) {
      let exit: number = 0;
      try {
        exit = compareTwoStrings(a.toLowerCase(), this.account.tipo.toLowerCase());
      } catch (e) {
        LOGGER.error("[compare2String]",e);
      }

      return exit;
    } else {
      return 1;
    }
  }


  itemTapped(event, item: EndPoint) {

    LOGGER.info("[itemTapped] ITEM : ",item);

    if (item.tutti) {
      for (let entry of this.items) {
        entry.conferma = item.conferma;
      }
    } else {
      if (this.checkFullItems()) {
        for (let entry of this.items) {
          if (entry.tutti) {
            entry.conferma = true;
          }
        }
      } else {
        for (let entry of this.items) {
          if (entry.tutti) {
            entry.conferma = false;
          }
        }
      }
    }
  }

  firefoxTapped(event, item: EndPoint) {

    LOGGER.info("[firefoxTapped] : ",  item);
    item.conferma = !item.conferma;

    if (item.tutti) {
      for (let entry of this.items) {
        entry.conferma = item.conferma;
      }
    } else {
      if (this.checkFullItems()) {
        for (let entry of this.items) {
          if (entry.tutti) {
            entry.conferma = true;
          }
        }
      } else {
        for (let entry of this.items) {
          if (entry.tutti) {
            entry.conferma = false;
          }
        }
      }
    }
  }

  checkEmptyItems() {
    var exit: boolean;
    exit = true;
    for (let obj of this.items) {
      if (obj.conferma) {
        exit = false;
      }
    }
    return exit;
  }

  checkFullItems() {
    var exit: boolean;

    exit = true;
    for (let obj of this.items) {
      if (!obj.tutti) {
        console.log("->", obj.title, " - ", obj.conferma);
        if (!obj.conferma) {
          exit = false;
        }
      }
    }
    return exit;
  }

  buttonTapped() {


    if (this.checkEmptyItems()) {
      let alert = this.alertCtrl.create({
        title: "ATTENZIONE",
        subTitle: "Non si è selezionata alcuna categoria.",
        buttons: ["Indietro"]
      });

      alert.present();
      // array empty or does not exist
    } else {
      let loader = this.loadingCtrl.create({
        content: "Sto cercando..."
      });

      setTimeout(() => {
        loader.dismiss();
      }, 10000);

      loader.present();
      let categorie: string[] = [];
      let tutti: boolean = false;
      let i = 0;
      while (i < this.items.length && !tutti) {
        if (this.items[i].tutti) {
          tutti = this.items[i].conferma;
        } else {
          if (this.items[i].conferma) {
            categorie.push(this.items[i].dbname);
          }
        }
        i++;
      }

      if (tutti) {
        categorie = [];
      }

      if (this.tipoRicerca == ListPage.INDIRIZZO) {
        this.rest
          .getGeocoding(this.indirizzo.getStringIndirizzoNoGoogle())
          .subscribe(data => {
            console.log("risulato -> ", JSON.stringify(data));
            try {
              this.coordinates = [+data[0].lon, +data[0].lat]; //[lon, lat]
              this.indirizzo.lon = +data[0].lon;
              this.indirizzo.lat = +data[0].lat;

              this.rest
                .getRisultato(
                  this.testo,
                  categorie,
                  this.coordinates,
                  this.distanza,
                  this.preferenza
                )
                .subscribe((data: Risposta) => {
                  loader.dismiss();
                  let valori: GenericEndPoint[] = data.valore;
                  LOGGER.info("[buttonTapped] A VALORI :", valori);
                  if (valori.length > 0) {
                    this.navCtrl.push(RisultatiPage, {
                      risultati: data.valore,
                      coordinate: this.coordinates,
                      distanza: this.distanza,
                      categorie: this.items
                    });
                  } else {
                    let alert = this.alertCtrl.create({
                      title: "ATTENZIONE",
                      subTitle: "Nessun risultato trovato",
                      buttons: ["Indietro"]
                    });

                    alert.present();
                  }
                });
            } catch (err) {
              loader.dismiss();
              let alert = this.alertCtrl.create({
                title: "Errore",
                subTitle: "Non sono riuscito a geolocalizzarti",
                buttons: ["Indietro"]
              });
              alert.present();
            }
          });
        // }
      } else {
        LOGGER.info("[buttonTapped] Tutti : ", tutti);
        LOGGER.info("[buttonTapped] Categorie", categorie);
        if (this.testo) {
          this.rest
            .getRisultato(
              this.testo,
              categorie,
              this.coordinates,
              this.distanza,
              this.preferenza
            )
            .subscribe((data: Risposta) => {
              loader.dismiss();
              let valori: GenericEndPoint[] = data.valore;
              LOGGER.info("[buttonTapped] B VALORI :", valori);
              if (valori.length > 0) {
                this.navCtrl.push(RisultatiPage, {
                  risultati: data.valore,
                  coordinate: this.coordinates,
                  distanza: this.distanza,
                  categorie: this.items
                });
              } else {
                let alert = this.alertCtrl.create({
                  title: "ATTENZIONE",
                  subTitle: "Nessun risultato trovato",
                  buttons: ["Indietro"]
                });

                alert.present();
              }
            });
        } else {
          loader.dismiss();
          let alert = this.alertCtrl.create({
            title: "ATTENZIONE",
            subTitle: "Non si è inserito nessun argomento",
            buttons: ["Indietro"]
          });
          alert.present();
        }
      }
    }
  }
}
