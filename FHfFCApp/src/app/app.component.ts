import { TweetsViewerPage } from './../pages/tweets-viewer/tweets-viewer';
import { DescriptionViewerPage } from './../pages/description-viewer/description-viewer';
import { VisualizeGenericPage } from './../pages/visualize-generic/visualize-generic';
import { RisultatiPage } from './../pages/risultati/risultati';
import { AnnunciPage } from './../pages/annunci/annunci';
import { IscrizionePage } from './../pages/iscrizione/iscrizione';
import { Component, ViewChild } from '@angular/core';

import { Platform, MenuController, Nav } from 'ionic-angular';

import { FormInserimentoPage } from '../pages/form-inserimento/form-inserimento';
import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { GmapsPage } from '../pages/gmap/gmap';

import { TakepicturePage } from '../pages/takepicture/takepicture';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  rootPage = HelloIonicPage;
  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    
  ) {
    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: 'Home', component: HelloIonicPage },
      { title: 'Ricerca Risorse', component: ListPage },
      // { title: 'Mappa Prova', component: GmapsPage },
      // { title: 'Foto Prova', component: TakepicturePage },
      { title: 'Inserisci Risorsa', component: FormInserimentoPage },
      { title: 'Profilo', component: IscrizionePage },
      { title: 'I miei annunci', component: AnnunciPage}
      // { title: 'PROVA RICERCA', component: RisultatiPage},
      // { title: 'PROVA VISUALIZZA', component: VisualizeGenericPage}
      // { title: 'PROVA DESCRIZIONE', component: DescriptionViewerPage},
      // { title: 'PROVA TWEET', component: TweetsViewerPage}
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }
}
