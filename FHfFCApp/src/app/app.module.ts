import {AnnuncioViewRicercaPage} from './../pages/annuncio-view-ricerca/annuncio-view-ricerca';
import { DescriptionViewerPage } from './../pages/description-viewer/description-viewer';
import { VisualizeGenericPage } from './../pages/visualize-generic/visualize-generic';
import { RisultatiPage } from './../pages/risultati/risultati';
import { TweetsViewerPage } from './../pages/tweets-viewer/tweets-viewer';

import { AnnunciPage } from './../pages/annunci/annunci';
import { IscrizionePage } from './../pages/iscrizione/iscrizione';
import { FormInserimentoPage } from './../pages/form-inserimento/form-inserimento';
import { TakepicturePage } from '../pages/takepicture/takepicture';
import { FormViewPage } from '../pages/form-view/form-view';

import { IonicStorageModule } from '@ionic/storage';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { GmapsPage } from '../pages/gmap/gmap';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler, Platform } from 'ionic-angular';
import { MyApp } from './app.component';
import { HttpClientModule, HttpClientJsonpModule} from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { Camera } from '@ionic-native/camera';
import { Toast } from '@ionic-native/toast';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent, LatLng,
  CameraPosition,
  MarkerOptions,
  Marker
} from '@ionic-native/google-maps';
import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
 
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { ListPage } from '../pages/list/list';
import { Geolocation } from '@ionic-native/geolocation';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { WebServiceProvider } from '../providers/web-service/web-service';
import { FilePath } from '@ionic-native/file-path';
import { HTTP } from '@ionic-native/http';
import { NativeGeocoder } from '@ionic-native/native-geocoder';
import { GeocoderProvider } from '../providers/geocoder/geocoder';


@NgModule({
  declarations: [
    MyApp,
    HelloIonicPage,
    ItemDetailsPage,
    ListPage,
    GmapsPage,
    TakepicturePage,
    FormInserimentoPage,
    IscrizionePage,
    AnnunciPage,
    FormViewPage,
    RisultatiPage,VisualizeGenericPage,DescriptionViewerPage,TweetsViewerPage,AnnuncioViewRicercaPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    HttpClientJsonpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HelloIonicPage,
    ItemDetailsPage,
    ListPage,
    GmapsPage,
    TakepicturePage,
    FormInserimentoPage,
    IscrizionePage,AnnunciPage,
    FormViewPage,
    RisultatiPage,VisualizeGenericPage,DescriptionViewerPage,TweetsViewerPage,AnnuncioViewRicercaPage
    
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    GoogleMaps,
    File,
    Toast,
    FilePath,
    Geolocation,
    FileTransfer,
    FileTransferObject,
    Camera,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    WebServiceProvider,
    NativeGeocoder,
    GeocoderProvider,
    IonicStorageModule,
    HTTP
  ]
})
export class AppModule { }
