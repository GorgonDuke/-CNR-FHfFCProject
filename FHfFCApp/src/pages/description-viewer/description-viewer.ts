import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { WebServiceProvider } from '../../providers/web-service/web-service';
import { Risposta } from '../../models/Risposta';
import { compareTwoStrings } from "string-similarity";
/**
 * Generated class for the DescriptionViewerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


import { Logger, LogLevel } from 'ask-logger';
const LOGGER = Logger.getLogger('DescriptionViewerPage')
LOGGER.set_level(LogLevel.DEBUG)
@Component({
  selector: 'page-description-viewer',
  templateUrl: 'description-viewer.html',
})
export class DescriptionViewerPage {

  generic: string;
  desc: { key: string, valore: string }[] = [];



  constructor(public navCtrl: NavController, public navParams: NavParams, public rest: WebServiceProvider) {
    LOGGER.info("[constructor] Parameters : ",navParams.data.risultato);
    this.rest.getGeneric(navParams.data.risultato._id,navParams.data.risultato.collection_name).subscribe((res: any) => {
      for (let x in res.valore) {
        this.desc.push({ key: x.replace(new RegExp("_", 'g')," "), valore: res.valore[x] });
      }
      this.desc.sort((a, b) => {
        if (this.compare2String(a.key) < this.compare2String(b.key)) return 1;
        if (this.compare2String(a.key) > this.compare2String(b.key))return -1;
        return 0;
      });
    });
  }

  compare2String( a : string) {
      return compareTwoStrings(a.toLowerCase(), "insegna;nome;ragione;sociale;descrizione");
  }




  ionViewDidLoad() {

  }

  syntaxHighlight(json) {

    json = JSON.stringify(json, undefined, 1);

    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }

}
