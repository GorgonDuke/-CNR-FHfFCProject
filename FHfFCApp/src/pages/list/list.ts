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

    console.log("--- AGGIORNAMENTO ", new Date());

    if (this.plt.is("core") || this.plt.is("mobileweb")) {
      console.log("È UN BROWSER");
      this.isApp = false;
      console.log("--------------------------------------");
    } else {
      console.log("NON È UN BROWSER");
      this.isApp = true;
    }

    this.storage.get("utente").then((val: Utente) => {
      // console.log(val);
      if (val == null) {
        this.iscritto = false;
        this.getCountries();
      } else {
        this.account = val;
        console.log("->", JSON.stringify(this.account));

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
    console.log("-->", this.tipoRicerca);
    if (this.tipoRicerca == ListPage.INDIRIZZO) {
      this.visualizzaIndirizzo = true;
      console.log("-->", this.tipoRicerca);
    } else {
      if (this.plt.is("core") || this.plt.is("mobileweb")) {
        console.log("È UN BROWSER");
        this.isApp = false;
        console.log("--------------------------------------");
        if (this.b_lat) {
          this.coordinates[0] = this.b_lon;
          this.coordinates[1] = this.b_lat;
        } else {
          this.coordinates[0] = this.D_LON;
          this.coordinates[1] = this.D_LAT;
        }
      } else {
        console.log("NON È UN BROWSER");
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
            // this.geolocationPosition = position,
            try {
              console.log("POSITIO", position);
              console.log("POSITIO", position.coords.latitude);
              console.log("POSITIO", position.coords.longitude);

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
                console.log("Permission Denied");
                this.coordinates[0] = 9.223779;
                this.coordinates[1] = 45.479987;
                break;
              case 2:
                console.log("Position Unavailable");
                this.coordinates[0] = 9.223779;
                this.coordinates[1] = 45.479987;
                break;
              case 3:
                console.log("Timeout");
                this.coordinates[0] = 9.223779;
                this.coordinates[1] = 45.479987;
                break;
            }
          }
        );
      } else {
        console.log("Posizione NON TROVATA WEB");
        this.coordinates[1] = 45.479987;
      }
    } else {
      this.geolocation
        .getCurrentPosition()
        .then(resp => {
          console.log("Posizione trovata ");
          this.coordinates[0] = resp.coords.longitude;
          this.coordinates[1] = resp.coords.latitude;
        })
        .catch(error => {
          if (window.navigator && window.navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition(
              position => {
                // this.geolocationPosition = position,
                try {
                  console.log("POSITIO", position);
                  console.log("POSITIO", position.coords.latitude);
                  console.log("POSITIO", position.coords.longitude);

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
                    console.log("Permission Denied");
                    this.coordinates[0] = 9.223779;
                    this.coordinates[1] = 45.479987;
                    break;
                  case 2:
                    console.log("Position Unavailable");
                    this.coordinates[0] = 9.223779;
                    this.coordinates[1] = 45.479987;
                    break;
                  case 3:
                    console.log("Timeout");
                    this.coordinates[0] = 9.223779;
                    this.coordinates[1] = 45.479987;
                    break;
                }
              }
            );
          } else {
            console.log("Posizione NON TROVATA WEB");
            this.coordinates[1] = 45.479987;
          }
          console.log("Error getting location", error);
        });
    }
  }

  getCountries() {
    // this.rest.getCategorie();
    this.rest.getCategorie().subscribe(
      (data: Risposta) => {
        console.log("my data: ", data);

        //    var endPoint = <EndpointinthedbIf> data

        console.log("-------------------------");
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
        console.log(JSON.stringify(this.items));
        console.log("TIPO ", this.account.tipo);
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
        console.log("-ERROR : ", JSON.stringify(a));
      }

      return exit;
    } else {
      return 1;
    }
  }

  // getCountries() {
  //   // this.rest.getCategorie();
  //   this.rest.getCategorie().subscribe(
  //     (data: Risposta) => {
  //       console.log("my data: ", data);

  //       //    var endPoint = <EndpointinthedbIf> data

  //       console.log("-------------------------");
  //       let temp: Endpointinthedb[] = data.valore;
  //       for (let entry of temp) {
  //         this.items.push({
  //           title: "" + entry.endPoint.description,
  //           conferma: true,
  //           tutti: false,
  //           dbname: entry.endPoint.db_name,
  //           color: entry.color,
  //           tipo : entry.tipo,
  //           pertinence :   compareTwoStrings(entry.tipo.toLowerCase(), this.account.tipo.toLowerCase())
  //         });
  //       }
  //       console.log(JSON.stringify(this.items));
  //       console.log("TIPO ", this.account.tipo);
  //       this.ordinaDistanza()
  //     },
  //     error => (this.errorMessage = <any>error)
  //   );

  // }

  itemTapped(event, item: EndPoint) {
    // if(item) {
    console.log("ITEM : ", JSON.stringify(item));
    // } else {
    //   console.log('ITEM : NULL');
    // }

    console.log("EVENT : ", JSON.stringify(event));

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
    // if(item) {
    console.log("ITEM f : ", JSON.stringify(item));
    item.conferma = !item.conferma;
    console.log("EVENT f: ", JSON.stringify(event));

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
    console.log("------ìììì-----------------------");
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
    console.log("Evvvia!", this.testo);

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
        // if (this.isApp) {
        //   this.nativeGeocoder
        //     .forwardGeocode(this.indirizzo.getStringIndirizzo())
        //     .then((datas: NativeGeocoderForwardResult[]) => {
        //       let data = datas[0];
        //       // let coordinates: Array<number>;
        //       this.coordinates[0] = +data.longitude;
        //       this.coordinates[1] = +data.latitude;
        //       this.indirizzo.lon = +data.longitude;
        //       this.indirizzo.lat = +data.latitude;

        //       this.rest
        //         .getRisultato(
        //           this.testo,
        //           categorie,
        //           this.coordinates,
        //           this.distanza
        //         )
        //         .subscribe((data: Risposta) => {
        //           loader.dismiss();
        //           // this.items = data.valore;

        //           let valori: GenericEndPoint[] = data.valore;
        //           console.log("-> VALORI 1:  ->", valori);
        //           if (valori.length > 0) {
        //             this.navCtrl.push(RisultatiPage, {
        //               risultati: data.valore,
        //               coordinate: this.coordinates,
        //               distanza: this.distanza,
        //               categorie: this.items
        //             });
        //           } else {
        //             let alert = this.alertCtrl.create({
        //               title: "ATTENZIONE",
        //               subTitle: "Nessun risultato trovato",
        //               buttons: ["Indietro"]
        //             });

        //             alert.present();
        //           }
        //         });
        //     })
        //     .catch((error: any) => {
        //       loader.dismiss();

        //       let alert = this.alertCtrl.create({
        //         title: "Errore",
        //         subTitle: error + "",
        //         buttons: ["Indietro"]
        //       });
        //       alert.present();
        //     });
        // } else {
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
                  // this.items = data.valore;
                  let valori: GenericEndPoint[] = data.valore;
                  console.log("-> VALORI 2:  ->", valori);
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
        console.log("Tutti : ", tutti);
        console.log("Categorie", JSON.stringify(categorie));
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

              // this.items = data.valore;
              let valori: GenericEndPoint[] = data.valore;
              console.log("-> VALORI 3:  ->", valori);
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
