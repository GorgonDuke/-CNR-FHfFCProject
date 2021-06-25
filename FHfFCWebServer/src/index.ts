import { Risposta } from "./models/Risposta";
import {
 
  FormModelFromWeb
} from "./models/FormModel";
 
import * as bodyParser from "body-parser";
import express = require("express");
import multer = require("multer");
import uuid = require("uuid");
import {
 
  Generic_EndPoint_Export
} from "./models/Generic_EndPoint";
import { DbJobs } from "./providers/DbJobs";
import CONFIG from '../config/config.json';
import {  getLogger } from "log4js";
const LOGGER = getLogger("[MAIN]");
LOGGER.level = "debug"



const path = require("path");
const cors = require("cors"); 

const mime = {
  html: "text/html",
  txt: "text/plain",
  css: "text/css",
  gif: "image/gif",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  js: "application/javascript"
};
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, CONFIG.pathImages);
  },
  filename: function (req, file, callback) {
    callback(null, uuid.v1() + ".jpg");
  }
});

const upload = multer({ storage: storage }).single("file");

var fs = require("fs");


let app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/getAnnunci/:annuncioId", (request, res) => {
  LOGGER.info("/getAnnunci AnnuncioId->", request.params.annuncioId);
  DbJobs.getInstance()
    .getSingoloAnnuncioById(request.params.annuncioId)
    .subscribe((esito: Risposta) => {
      if (esito) {
        if (esito.status) {
          LOGGER.info("/getAnnunci [OUT]", esito)
          res.status(200).json(esito);

        } else {
          LOGGER.error("/getAnnunci [OUT]", esito)
          res.status(500).json(esito);
        }
      }
    });
});

app.get(
  "/myannunci/:utenteId",
  DbJobs.getInstance().authorisation,
  (request, res, next) => {
    LOGGER.info("/myannunci My Utente Id ->", request.params.utenteId);
    DbJobs.getInstance()
      .getAnnunciById(request.params.utenteId)
      .subscribe((esito: Risposta) => {
        if (esito) {
          if (esito.status) {
            LOGGER.info("/myannunci [OUT]", esito)
            res.status(200).json(esito);
          } else {
            LOGGER.error("/myannunci [OUT]", esito)
            res.status(500).json(esito);
          }
        }
      });
  }
);

app.get("/getGeneric/:genericid/:dbname", (request, res) => {
  LOGGER.info("/getGeneric Generic Id ->", request.params.genericid);
  LOGGER.info("/getGeneric DbName Id ->", request.params.dbname);
  DbJobs.getInstance()
    .getSpecificEndPoint(request.params.genericid, request.params.dbname)
    .subscribe((esito: Risposta) => {
      if (esito) {
        if (esito.status) {
          LOGGER.info("/getGeneric [OUT]", esito)
          res.status(200).json(esito);
        } else {
          LOGGER.error("/getGeneric [OUT]", esito)
          res.status(500).json(esito);
        }
      } else {
        LOGGER.error("/getGeneric [OUT]")
        res.status(500);
      }
 
    });
});

app.get("/tweeet/:genericEndPointID", (request, res) => {
  LOGGER.info("/tweeet My Utente Id ->", request.params.genericEndPointID);
  DbJobs.getInstance()
    .getTweets(request.params.genericEndPointID)
    .subscribe((esito: Risposta) => {
     
     
      if (esito) {
        if (esito.status) {
          LOGGER.info("/tweeet [OUT]", esito)
          res.status(200).json(esito);
        } else {
          LOGGER.error("/tweeet [OUT]", esito)
          res.status(500).json(esito);
        }
      } else {
        LOGGER.error("/tweeet [OUT]")
        res.status(500);
      }

      
    });
});

app.get(
  "/ricerca/:testo/:categorie/:coordinate/:distance/:preferenza",
  (request, res) => {
    LOGGER.info("/ricerca Text to search : ->", request.params.testo);
    LOGGER.info("/ricerca Categories of search : ->", request.params.categorie);
    LOGGER.info("/ricerca Coordinate : ->", request.params.coordinate);
    LOGGER.info("/ricerca Distance : ->", request.params.distance);
    LOGGER.info("/ricerca Preferences : ->", request.params.preferenza);

    let categorie: string[] = [];
    if (request.params.categorie) {
      categorie = JSON.parse(request.params.categorie);
    }
    let coordinate: number[] = [];
    if (request.params.coordinate) {
      if (!(request.params.coordinate === "undefined")) {
        coordinate = JSON.parse(request.params.coordinate);
      }
    }
    LOGGER.info("/ricerca Coordinate [after]: ->", coordinate);
    LOGGER.info("/ricerca Categories [after]: ->", categorie);
    

    let testo = '"' + request.params.testo + '"';

    if (request.params.preferenza) {
      testo = testo + " " + request.params.preferenza;
    }
    DbJobs.getInstance()
      .ricercaGenerica(testo, categorie, coordinate, +request.params.distance)
      .subscribe((esito: Risposta) => {
        
        if (esito) {
          if (esito.status) {
            LOGGER.info("/ricerca [ricercaGenerica] ",(<Generic_EndPoint_Export[]>esito.valore).length);
            if ((<Generic_EndPoint_Export[]>esito.valore).length == 0) {
              LOGGER.info("/ricerca [ricercaGenerica] Re do search");
              let testo2;
              if (request.params.preferenza) {
                testo2 = request.params.testo + " " + request.params.preferenza;
              } else {
                testo2 = request.params.testo;
              }
              DbJobs.getInstance()
                .ricercaGenerica(
                  testo2,
                  categorie,
                  coordinate,
                  +request.params.distance
                )
                .subscribe((esito: Risposta) => {
                  if (esito) {
                    if (esito.status) {
                      LOGGER.info("/ricerca [ricercaGenerica] ",
                        (<Generic_EndPoint_Export[]>esito.valore).length
                      );
                      res.status(200).json(esito);
                    } else {
                      LOGGER.warn("/ricerca C[ricercaGenerica] status ", esito.status);
                      res.status(404).json(esito);
                    }
                  }
                });
            } else {
              LOGGER.warn("/ricerca B[ricercaGenerica] status",esito);
              res.status(404).json(esito);
            }
          } else {
            LOGGER.warn("/ricerca A[ricercaGenerica] status", esito.status);
            res.status(404).json(esito);
          }
        }
      });
  }
);

app.get("/immagini/:id", (req, res) => {
  const file = path.join(CONFIG.pathImages + req.params.id + ".jpg");

  const type = mime[path.extname(file).slice(1)] || "text/plain";
  const s = fs.createReadStream(file);
  LOGGER.info("/immagini/", req.params.id);
  s.on("open", function () {
    res.set("Content-Type", type);
    s.pipe(res);
  });
  s.on("error", function () {
    res.set("Content-Type", "text/plain");
    res.status(500).end("Not found");
  });
});

app.get(
  "/utente/login/:utenteid",
  DbJobs.getInstance().authorisation,
  (request, res, next) => {
    LOGGER.info("/utente/login/", request.params.utenteid);
    
    DbJobs.getInstance()
      .verificaUtente(request.params.utenteid)
      .subscribe((esito: Risposta) => {
        if (esito) {
          if (esito.status) {
            LOGGER.info("/utente/login/ [LOGGED]", request.params.utenteid);
            res.status(200).json(esito);
          } else {
            LOGGER.warn("/utente/login/ B[unauthorized]", request.params.utenteid);
            res.status(401).json(esito);
          }
        } else {
          LOGGER.warn("/utente/login/ A[unauthorized]", request.params.utenteid);
          res.status(401).json(esito);
        }
      });
  }
);

app.get(
  "/utente/delete/:utenteid",
  DbJobs.getInstance().authorisation,
  (request, res, next) => {
    LOGGER.info("/utente/delete ->", request.params.utenteid);
    DbJobs.getInstance()
      .cancellaUtente(request.params.utenteid)
      .subscribe((esito: Risposta) => {
      
         
        if (esito) {
          if (esito.status) {
            LOGGER.info("/utente/delete [DELETED]", request.params.utenteid);
            res.status(200).json(esito);
          } else {
            LOGGER.warn("/utente/delete B[NOT DELETED]", request.params.utenteid);
            res.status(400).json(esito);
          }
        } else {
          LOGGER.warn("/utente/delete A[NOT DELETED]", request.params.utenteid);
          res.status(500).json(esito);
        }
      });
  }
);


app.get(
  "/myannunci/delete/:elemetid",
  DbJobs.getInstance().authorisation,
  (request, res, next) => {
    LOGGER.info("/myannunci/delete ->", request.params.elemetid);
    DbJobs.getInstance()
      .cancellaAnnuncio(request.params.elemetid)
      .subscribe((esito: Risposta) => {
        if (esito) {
          if (esito.status) {
            LOGGER.info("/myannunci/delete [DELETED]", request.params.elemetid);
            res.status(200).json(esito);
          } else {
            LOGGER.warn("/myannunci/delete B[NOT DELETED]", request.params.elemetid);
            res.status(400).json(esito);
          }
        } else {
          LOGGER.warn("/myannunci/delete A[NOT DELETED]", request.params.elemetid);
          res.status(500).json(esito);
        }
        
      });
  }
);


app.get("/endPoints", (req, res) => {
  DbJobs.getInstance()
    .getCategorie()
    .subscribe((esito: Risposta) => {
      LOGGER.info("/endPoints");
      if (esito) {
        if (esito.status) {
          LOGGER.info("/endPoints", esito);
          res.status(200).json(esito);
        } else {
          LOGGER.warn("/endPoints B", esito);
          res.status(400).json(esito);
        }
      } else {
        LOGGER.warn("/endPoints A", esito);
        res.status(500).json(esito);
      }
      
    });
});
 
app.post("/iscriviti", (req, res) => {
   
  LOGGER.info("/iscriviti", req.body);
  DbJobs.getInstance()
    .iscriviUtente(req.body)
    .subscribe((esito: Risposta) => {
      if (esito) {
        if (esito.status) {
          LOGGER.info("/iscriviti B", esito);
          res.status(200).json(esito);
        } else {
          LOGGER.warn("/iscriviti A", esito);
          res.status(400).json(esito);
        }
      } else {
        LOGGER.warn("/iscriviti", esito);
        res.status(500).json(esito);
      }
    });
});

app.post(
  "/utente/modifica",
  DbJobs.getInstance().authorisation,
  (req, res, next) => {
    LOGGER.info("/utente/modifica", req.body);
    DbJobs.getInstance()
      .modificaUtente(req.body)
      .subscribe((esito: Risposta) => {
        if (esito) {
          if (esito.status) {
            LOGGER.info("/utente/modifica", esito);
            res.status(200).json(esito);
          } else {
            LOGGER.warn("/utente/modifica B", esito);
            res.status(400).json(esito);
          }
        } else {
          LOGGER.warn("/utente/modifica A", esito);
          res.status(500).json(esito);
        }
      });
  }
);

app.post("/offerta/upload", (req, res, next) => {
  LOGGER.info("/offerta/upload", req);

  upload(req, res, function (err) {
    LOGGER.info("/offerta/upload",  req.body.formModel );
    if (!req.file) {
      
      LOGGER.info("/offerta/upload No file received");
      return res.status(500).send({
        success: false
      });
    } else {
      let obj: FormModelFromWeb = JSON.parse(req.body.formModel);

      DbJobs.getInstance()
        .addAnnuncio(
          obj,
          req.file.filename.substring(0, req.file.filename.length - 4)
        )
        .subscribe((esito: Risposta) => {
          if (esito) {
            if (esito.status) {
              LOGGER.info("/offerta/upload", esito);
              res.status(200).json(esito);
            } else {
              LOGGER.warn("/offerta/upload B", esito);
              res.status(400).json(esito);
            }
          } else {
            LOGGER.warn("/offerta/upload A", esito);
            res.status(500).json(esito);
          }
        });
    }
  });
});

 
app.listen(CONFIG.port, () => {
  LOGGER.info("⚡️[" + CONFIG.server_name + "]: Server is running at https://localhost:" + CONFIG.port + " - " + new Date().toISOString());
})