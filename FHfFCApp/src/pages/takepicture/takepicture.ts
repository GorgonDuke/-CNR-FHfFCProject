import { Risposta } from './../../models/Risposta';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {   NavController, NavParams, AlertController, LoadingController, ToastController, Platform } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { DomSanitizer } from '@angular/platform-browser';
import { FilePath } from '@ionic-native/file-path';
import { HelloIonicPage } from '../hello-ionic/hello-ionic';
import { WebServiceProvider } from '../../providers/web-service/web-service';
import { Utente } from '../../models/Utente';
import { IscrizionePage } from '../iscrizione/iscrizione';
import { Storage } from '@ionic/storage';

import { Logger, LogLevel } from 'ask-logger';
const LOGGER = Logger.getLogger('TakepicturePage')
LOGGER.set_level(LogLevel.DEBUG)
@Component({
  selector: 'page-takepicture',
  templateUrl: 'takepicture.html',

})



export class TakepicturePage {


  imageURI: any;
  imageFileName: any;
  imageNewPath: any;
  imageOldPath: any;
  isApp: boolean;
  toUpload : any;
  filepathb: string;
  public image: string;
  pic: any;
  utente: Utente;
  @ViewChild("filesName") filesName: ElementRef;



  constructor(public navCtrl: NavController,
    private filePath: FilePath,
    private transfer: FileTransfer,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private camera: Camera,
    public plt: Platform,
    private storage: Storage,
    public rest: WebServiceProvider,
    private file: File) {

    if (this.plt.is('core') || this.plt.is('mobileweb')) {
      LOGGER.info("[constructor] IS A BROWSER");
      this.isApp = false;


    } else {
      LOGGER.info("[constructor] IS NOT A BROWSER");
      this.isApp = true;

    }

    this.storage.get('utente').then((val) => {

      this.utente = val;
      if (val == null) {
        let alert = this.alertCtrl.create({
          title: 'Attenzione',
          subTitle: '&Eacute; necessario iscriversi prima',
          buttons: [{
            text: 'Avanti',
            role: 'avanti',
            handler: () => {
              console.log('Avanti Cliccato');
              this.navCtrl.push(IscrizionePage);
            }
          }]
        });
        alert.present();
      }
    });

  }


  private photo_split: String;
  private nativeFilePath: String;

  getImage() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    }

    this.camera.getPicture(options).then((imageData) => {
      LOGGER.info("[getImage] imagedata",imageData);
      LOGGER.info("[getImage] doomsanitaizer",this.domSanitizer.bypassSecurityTrustResourceUrl(imageData));

      this.nativeFilePath = imageData;
      this.imageOldPath = imageData;

      this.filePath.resolveNativePath(imageData)
        .then(filePath => {
          this.imageFileName = filePath;
        });
    }, (err) => {
      LOGGER.error("[getImage]", err);
      this.presentToast(err);

    });

  }

  getFile(event) {
    LOGGER.info("[getFile] event ",event);
    LOGGER.info("[getFile] this.filesName.nativeElement ", this.filesName.nativeElement);
    this.imageOldPath = this.filesName.nativeElement.value;
    this.toUpload = this.filesName.nativeElement.files[0];
    LOGGER.info("[getFile] this.filesName.nativeElement.files.length ", this.filesName.nativeElement.files.length);
    LOGGER.info("[getFile] this.filesName.nativeElement.files[0].name ", this.filesName.nativeElement.files[0].name);

  }

  uploadFile() {
    LOGGER.info("[uploadFile]this.filepathb", this.filepathb);
    if (this.imageOldPath == null) {
      let alert = this.alertCtrl.create({
        title: 'Attenzione',
        subTitle: '&Eacute; necessario allegare un&rsquo;immagine',
        buttons: ['Indietro']
      });
      alert.present();
    } else {
      let loader = this.loadingCtrl.create({
        content: "Uploading..."
      });
      loader.present();

      if (this.isApp) {
        LOGGER.info("[uploadFile] IS A APP");
        const fileTransfer: FileTransferObject = this.transfer.create();

        let options: FileUploadOptions = {
          fileKey: 'file',
          fileName: 'filename.jpg',
          chunkedMode: false,

          headers: {},
          params: {
            formModel: this.navParams.get("formmodel")
          }
        }

        LOGGER.info("[uploadFile]this.imageOldPath:",this.imageOldPath);


        fileTransfer.upload(this.imageOldPath, WebServiceProvider.UPLOADURL, options)
          .then((data) => {

            LOGGER.info("[uploadFile]Code = " + data.responseCode)
            LOGGER.info("[uploadFile]Response = " + data.response)
            LOGGER.info("[uploadFile]Sent = " + data.bytesSent)
            LOGGER.info("[uploadFile]data",data," Uploaded Successfully");
            loader.dismiss();
            this.presentToast("Annuncio caricato!");
            this.navCtrl.setRoot(HelloIonicPage);

          }, (err) => {
            console.log(err);
            loader.dismiss();
            this.presentToast(err);
          });
      } else {
        LOGGER.info("[uploadFile] IS A BROWSWER");
          this.rest.postFile(this.toUpload, this.navParams.get("formmodel"),this.utente ).subscribe( (data:Risposta) =>{
            LOGGER.info("[uploadFile]DATA",data);
            loader.dismiss();
            if (data.esito) {
              this.presentToast("Annuncio caricato!");
              this.navCtrl.setRoot(HelloIonicPage);
            } else {
              this.presentToast(data.status);
            }

          });

      }
    }
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 6000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

}

