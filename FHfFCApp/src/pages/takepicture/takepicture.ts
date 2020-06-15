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
      console.log('È UN BROWSER');
      this.isApp = false;


    } else {
      console.log('NON È UN BROWSER');
      this.isApp = true;

    }

    this.storage.get('utente').then((val) => {
      console.log(val);
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

  // options: CameraOptions = {
  //   quality: 100,
  //   saveToPhotoAlbum: false,
  //   correctOrientation: true,
  //   destinationType: this.camera.DestinationType.DATA_URL,
  //   encodingType: this.camera.EncodingType.JPEG,
  //   mediaType: this.camera.MediaType.PICTURE
  // }


  getImage() {




    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      // allowEdit: true,
      // saveToPhotoAlbum: false,
      // correctOrientation: true
    }

    this.camera.getPicture(options).then((imageData) => {

      console.log("--------------------------------");
      console.log(imageData);
      console.log(this.domSanitizer.bypassSecurityTrustResourceUrl(imageData));
      console.log("--------------------------------");
      this.nativeFilePath = imageData;
      this.imageOldPath = imageData;

      this.filePath.resolveNativePath(imageData)
        .then(filePath => {
          console.log("--------------------------------");

          this.imageFileName = filePath;
          // console.log(this.imageURI);
          // console.log("-------------**-------------------");

          // let sourceDirectory = this.imageURI.substring(0, this.imageURI.lastIndexOf('/') + 1);
          // let sourceFileName = this.imageURI.substring(this.imageURI.lastIndexOf('/') + 1, this.imageURI.length);
          // sourceFileName = sourceFileName.split('?').shift();
          // this.file.copyFile(sourceDirectory, sourceFileName, this.file.externalApplicationStorageDirectory, sourceFileName).then((result: any) => {


          //   this.imageNewPath = result.nativeURL;

          //   console.log("-***************-------------------****************-");
          //   console.log(this.imageNewPath);
          //   console.log("-***************-------------------****************-");

          //   }, (err) => {
          //     alert(JSON.stringify(err));
          //   })
        });

      // if (imageData.substring(0, 21) == "content://com.android") {
      // this.photo_split = imageData.split("%3A");
      // imageData = imageData.replace("%", "%25");
      //   this.imageFileName = "content://media/external/images/media/" + this.photo_split[1];
      //   this.imageURI = "content://media/external/images/media/" + this.photo_split[1];
      // } else {

      // }




    }, (err) => {
      console.log(err);

      this.presentToast(err);

    });

  }

  getFile(event) {
    console.log("-|->", JSON.stringify(event));
    // let  file : File = $event.target.files[0];
    // console.log("-|2->", JSON.stringify(file));


    console.log("-|3->", JSON.stringify(this.filesName));
    console.log("-|3->", this.filesName.nativeElement);
    this.imageOldPath = this.filesName.nativeElement.value;
    this.toUpload = this.filesName.nativeElement.files[0];
    console.log("-|4->", this.filesName.nativeElement.files.length);
    console.log("-|4->", this.filesName.nativeElement.files[0].name);
    // console.log(this.pic);
  }

  uploadFile() {
    console.log("-->", this.filepathb);
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
        console.log("--------------------------------------------------------------------");
        console.log("E' un app");
        console.log("--------------------------------------------------------------------");
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
        console.log("-*******************************-");
        console.log(this.imageOldPath);
        console.log("-*******************************-");
        // fileTransfer.upload(this.imageOldPath, 'http://192.168.1.8:3000/offerta/upload', options)
        fileTransfer.upload(this.imageOldPath, WebServiceProvider.UPLOADURL, options)
          .then((data) => {

            console.log("Code = " + data.responseCode)
            console.log("Response = " + data.response)
            console.log("Sent = " + data.bytesSent)
            console.log(data + " Uploaded Successfully");
            console.log("->", data);
            // this.imageFileName = "http://192.168.0.7:8080/static/images/ionicfile.jpg"
            loader.dismiss();
            this.presentToast("Annuncio caricato!");
            this.navCtrl.setRoot(HelloIonicPage);
            // this.navCtrl.push();
          }, (err) => {
            console.log(err);
            loader.dismiss();
            this.presentToast(err);
          });
      } else {

        console.log("--------------------------------------------------------------------");
        console.log("NON E' un app  ++++++++++++++++++");
        console.log("--------------------------------------------------------------------");
          this.rest.postFile(this.toUpload, this.navParams.get("formmodel"),this.utente ).subscribe( (data:Risposta) =>{
            console.log("----Risposta--->",JSON.stringify(data));
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

  // onTakePicture() {
  //   const options: CameraOptions = {
  //     quality: 100,
  //     destinationType: this.camera.DestinationType.DATA_URL,
  //     saveToPhotoAlbum: true,
  //     mediaType: this.camera.MediaType.PICTURE
  //   }


  //   console.log(JSON.stringify(this.navParams.get("formmodel")));
  //   this.camera.getPicture(options).then((imageData) => {
  //     this.image = 'data:image/jpeg;base64,' + imageData;
  //   }, (err) => {
  //     this.displayErrorAlert(err);
  //   });
  // }

  // displayErrorAlert(err) {
  //   console.log(err);
  //   let alert = this.alertCtrl.create({
  //     title: 'Error',
  //     subTitle: 'Error while trying to capture picture',
  //     buttons: ['OK']
  //   });
  //   alert.present();
  // }






