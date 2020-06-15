import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HttpClientModule, HttpClientJsonpModule} from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { AboutPage } from '../pages/about/about';
import {SublistPage} from '../pages/sublist/sublist';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { IscrizionePage} from '../pages/iscrizione/iscrizione'
import { TabsPage } from '../pages/tabs/tabs';
import { MappaPage} from '../pages/mappa/mappa'
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { WebJobProvider } from '../providers/web-job/web-job';
import { ListaElementiPage } from '../pages/lista-elementi/lista-elementi';
import { Toast } from '@ionic-native/toast';
import { FormViewPage } from '../pages/form-view/form-view';
import { ColorPickerModule } from 'ngx-color-picker'; 
import { AnnunciPage } from './../pages/annunci/annunci';
@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    SublistPage,
    MappaPage,
    AnnunciPage,
    IscrizionePage,
    ListaElementiPage,
    FormViewPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    ColorPickerModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    MappaPage,
    SublistPage,
    AnnunciPage,
    IscrizionePage,
    ListaElementiPage,
    FormViewPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Toast,
    WebJobProvider
  ]
})
export class AppModule {}
