import { SublistPage } from './../sublist/sublist';
 
import { WebJobProvider } from './../../providers/web-job/web-job';
import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
 

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  items : any[];
  subitems : any[];
  generi : Set<string> = new Set();
  generipage : string[];
  loader : any;

  public static GENERICO : string = "Generico";

  constructor(public navCtrl: NavController,  public loadingCtrl: LoadingController, public rest : WebJobProvider ) {
    console.log("-------------------------------------------");
    let y = "aaaaaaaaaa.bbbbbbbbbbbb";
    let risulato : string[] = y.split('.');
    for ( let x of risulato) {
      console.log("-->", x);
    }
    console.log("-------------------------------------------");
  }


   
  clickTipo(event, categoria: string) {
    console.log("CATEGORIA : ",  categoria);
    this.subitems = this.items.filter((item) => {
      if (categoria === HomePage.GENERICO ) {
        
        return item.theme = undefined;
      } else {
        if (item.theme) {
          return item.theme[0] == categoria;
        } else {
          return false;
        }
        
      }

    });

    this.subitems.sort((n1, n2) => {
      if (n1.title > n2.title) {
        return 1;
      }
      if (n1.title < n2.title) {
        return -1;
      }

      return 0;
    });

    this.navCtrl.push(SublistPage, { risultati: this.subitems});
    
  }

  download() {

    this.loader = this.loadingCtrl.create({
      content: "Sto cercando... Ci vuole un po' ..sono tanti"
    });
    this.loader.present();

    this.rest.getEndPoints().subscribe( (data: any) => {
      console.log("Data",data);
      if (data)  {
        this.items = data.dataset;
        for(let item of this.items) {
          if (item.theme) {
            this.generi.add(item.theme[0])
          } else {
            this.generi.add(HomePage.GENERICO)
          }
          
        }

        this.generipage = Array.from(this.generi);
        this.generipage.sort((n1, n2) => {
          if (n1 > n2) {
            return 1;
          }
          if (n1 < n2) {
            return -1;
          }

          return 0;
        });

        this.loader.dismiss();
       

      }
    })

  }

  prendi () {

    console.log("-------------------------------------------");
    let y = "aaaaaaaaaa bbbbbbbbbbbb";
    let risulato : string[] = y.split('.');
    for ( let x of risulato) {
      console.log("-->", x);
    }
    console.log("-------------------------------------------");
    console.log("Entro : nel prendi")

    this.loader = this.loadingCtrl.create({
      content: "Sto cercando... Ci vuole un po' ..sono tanti"
    });
    this.loader.present();
    this.rest.getOpenData().subscribe( (data) =>  {
      console.log("Errore ?", data.valore.length);
      this.items = data.valore;
      for(let item of this.items) {
        if (item.theme) {
          this.generi.add(item.theme[0])
        } else {
          this.generi.add(HomePage.GENERICO)
        }
        
      }

      this.generipage = Array.from(this.generi);
      this.generipage.sort((n1, n2) => {
        if (n1 > n2) {
          return 1;
        }
        if (n1 < n2) {
          return -1;
        }

        return 0;
      });

      this.loader.dismiss();
     
    })
  }

  salva () {
    console.log("Entro : nel salvataggio")
     this.rest.saveOpenData(this.items).subscribe((data) =>  {
       console.log("Errore ?", data);
     })
  }

}
