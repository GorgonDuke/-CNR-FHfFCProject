import { Risposta } from "./models/Risposta";
import { Geometry } from "./models/Geometry";
import {
  FormModel,
  FormModelReturn,
  GeometryReturn,
  FormModelFromWeb
} from "./models/FormModel";
import { Utente, UtenteC, UtenteInDb } from "./models/Utente";
import { Annunci_schema } from "./schemas/Schemas";
import { Account_schema } from "./schemas/Schemas";
import { Generic_EndPoint_schema } from "./schemas/Schemas";
import { Endpointinthedb_schema } from "./schemas/Schemas";
import { ADDRCONFIG } from "dns";
import * as bodyParser from "body-parser";
import express = require("express");
import multer = require("multer");
import uuid = require("uuid");
import { IndirizzoModel } from "./models/IndrizzoModel";
import {
  Generic_EndPoint,
  Generic_EndPoint_Export
} from "./models/Generic_EndPoint";
import { DbJobs } from "./providers/DbJobs";
var path = require("path");
var cors = require("cors");
const pathImages: string = "/home/goserver/images/";

var mime = {
  html: "text/html",
  txt: "text/plain",
  css: "text/css",
  gif: "image/gif",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  js: "application/javascript"
};
var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, pathImages);
  },
  filename: function(req, file, callback) {
    callback(null, uuid.v1() + ".jpg");
  }
});

// var upload = multer({ dest: '/tmp/' })
var upload = multer({ storage: storage }).single("file");
var mongoose = require("mongoose");

mongoose.set("debug", true);

mongoose.Promise = require("bluebird");
mongoose.connect(
  "mongodb://127.0.0.1:27017/sodatest",
  {
    useMongoClient: true
  }
);

var db = mongoose.connection;

var fs = require("fs");

var dir = path.join(__dirname, "public");

var EndPointInTheDb = mongoose.model(
  "EndPointInTheDb",
  Endpointinthedb_schema,
  "EndPointInTheDb"
);
var Generic_EndPointInTheDb = mongoose.model(
  "Generic_EndPointb2",
  Generic_EndPoint_schema,
  "Generic_EndPoint2"
);
var AnnunciInTheDb = mongoose.model("Annunci", Annunci_schema, "Annunci");
var AccountInTheDb = mongoose.model("Utente", Account_schema, "Utente");
var esito: boolean;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function() {
  console.log("siamoconnessi ");
});

let app = express();

// app.use( (req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
// app.options('*', cors());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/getAnnunci/:annuncioId", (request, res) => {
  console.log("AnnuncioId->", request.params.annuncioId);
  // console.log("body received ->", req.body);
  DbJobs.getInstance()
    .getSingoloAnnuncioById(request.params.annuncioId)
    .subscribe((esito: Risposta) => {
      console.log("--------|||---------------------------------------------");
      // console.log("Esito ?  ", esito);
      if (esito) {
        if (esito.status) {
          res.json(esito);
        } else {
          res.json(esito);
        }
      }

      console.log("--------|||---------------------------------------------");
    });
});

app.get(
  "/myannunci/:utenteId",
  DbJobs.getInstance().authorisation,
  (request, res, next) => {
    console.log("My Utente Id ->", request.params.utenteId);
    // console.log("body received ->", req.body);
    DbJobs.getInstance()
      .getAnnunciById(request.params.utenteId)
      .subscribe((esito: Risposta) => {
        console.log("--------|||---------------------------------------------");
        // console.log("Esito ?  ", esito);
        if (esito) {
          if (esito.status) {
            res.json(esito);
          } else {
            res.json(esito);
          }
        }

        console.log("--------|||---------------------------------------------");
      });
  }
);

app.get("/getGeneric/:genericid/:dbname", (request, res) => {
  console.log("Generic Id ->", request.params.genericid);
  console.log("DbName Id ->", request.params.dbname);
  // console.log("body received ->", req.body);
  DbJobs.getInstance()
    .getSpecificEndPoint(request.params.genericid, request.params.dbname)
    .subscribe((esito: Risposta) => {
      console.log("--------|||---------------------------------------------");
      console.log("Esito ?  ", esito);
      if (esito) {
        if (esito.status) {
          res.json(esito);
        } else {
          res.json(esito);
        }
      }

      console.log("--------|||---------------------------------------------");
    });
});

app.get("/tweeet/:genericEndPointID", (request, res) => {
  console.log("My Utente Id ->", request.params.genericEndPointID);
  // console.log("body received ->", req.body);
  DbJobs.getInstance()
    .getTweets(request.params.genericEndPointID)
    .subscribe((esito: Risposta) => {
      console.log("--------|||---------------------------------------------");
      console.log("Esito twitter ?  ", esito);
      if (esito) {
        if (esito.status) {
          res.json(esito);
        } else {
          res.json(esito);
        }
      }

      console.log("--------|||---------------------------------------------");
    });
});

app.get(
  "/ricerca/:testo/:categorie/:coordinate/:distance/:preferenza",
  (request, res) => {
    console.log("Testo da ricercare : ->", request.params.testo);
    console.log("Categorie in cui ricercare : ->", request.params.categorie);
    console.log("coordinate in cui ricercare : ->", request.params.coordinate);
    console.log("distance in cui ricercare : ->", request.params.distance);
    console.log("preferenza : ->", request.params.preferenza);

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
    console.log("coordinate in cui ricercare 2: ->", coordinate);
    console.log("Categorie in cui ricercare 2: ->", categorie);
    // console.log("body received ->", req.body);

    let testo = '"' + request.params.testo + '"';

    if (request.params.preferenza) {
      testo = testo + " " + request.params.preferenza;
    }
    DbJobs.getInstance()
      .ricercaGenerica(testo, categorie, coordinate, request.params.distance)
      .subscribe((esito: Risposta) => {
        console.log("--------|||---------------------------------------------");
        // console.log("Esito ?  ", esito);
        if (esito) {
          if (esito.status) {
            console.log(
              "-*>",
              (<Generic_EndPoint_Export[]>esito.valore).length
            );
            if ((<Generic_EndPoint_Export[]>esito.valore).length == 0) {
              console.log("-*>RIFACCIO LA QUERY");
              let testo2;
              if (request.params.preferenza) {
                testo2 = request.params.testo + " " + request.params.preferenza;
              } else  {
                testo2 = request.params.testo;
              }
              DbJobs.getInstance()
                .ricercaGenerica(
                  testo2,
                  categorie,
                  coordinate,
                  request.params.distance
                )
                .subscribe((esito: Risposta) => {
                  console.log(
                    "--------|||---------------------------------------------"
                  );
                  // console.log("Esito ?  ", esito);
                  if (esito) {
                    if (esito.status) {
                      console.log(
                        "-*>",
                        (<Generic_EndPoint_Export[]>esito.valore).length
                      );

                      res.json(esito);
                    } else {
                      console.log("->", esito.status);
                      res.json(esito);
                    }
                  }

                  console.log(
                    "--------|||---------------------------------------------"
                  );
                });
            } else {
              res.json(esito);
            }
          } else {
            console.log("->", esito.status);
            res.json(esito);
          }
        }

        console.log("--------|||---------------------------------------------");
      });
  }
);

app.get("/immagini/:id", (req, res) => {
  var file = path.join(pathImages + req.params.id + ".jpg");

  var type = mime[path.extname(file).slice(1)] || "text/plain";
  var s = fs.createReadStream(file);
  s.on("open", function() {
    res.set("Content-Type", type);
    s.pipe(res);
  });
  s.on("error", function() {
    res.set("Content-Type", "text/plain");
    res.status(404).end("Not found");
  });
});

app.get(
  "/utente/login/:utenteid",
  DbJobs.getInstance().authorisation,
  (request, res, next) => {
    console.log("VERIFICA UTENTE->", request.params.utenteid);
    DbJobs.getInstance()
      .verificaUtente(request.params.utenteid)
      .subscribe((esito: Risposta) => {
        if (esito) {
          if (esito.status) {
            res.json(esito);
          } else {
            res.json(esito);
          }
        }
      });
  }
);

app.get(
  "/utente/delete/:utenteid",
  DbJobs.getInstance().authorisation,
  (request, res, next) => {
    console.log("DELETE UTENTE ID ->", request.params.utenteid);
    DbJobs.getInstance()
      .cancellaUtente(request.params.utenteid)
      .subscribe((esito: Risposta) => {
        console.log("--------|||---------------------------------------------");
        console.log("Esito ?  ", esito);
        if (esito) {
          if (esito.status) {
            res.json(esito);
          } else {
            res.json(esito);
          }
        }
        console.log("--------|||---------------------------------------------");
      });
  }
);

app.get(
  "/utente/delete/:utenteid",
  DbJobs.getInstance().authorisation,
  (request, res, next) => {
    console.log("DELETE UTENTE ID ->", request.params.utenteid);
    DbJobs.getInstance()
      .cancellaUtente(request.params.utenteid)
      .subscribe((esito: Risposta) => {
        console.log("--------|||---------------------------------------------");
        console.log("Esito ?  ", esito);
        if (esito) {
          if (esito.status) {
            res.json(esito);
          } else {
            res.json(esito);
          }
        }
        console.log("--------|||---------------------------------------------");
      });
  }
);

app.get(
  "/myannunci/delete/:elemetid",
  DbJobs.getInstance().authorisation,
  (request, res, next) => {
    console.log("DELETE ANNUNCI ID ->", request.params.elemetid);
    DbJobs.getInstance()
      .cancellaAnnuncio(request.params.elemetid)
      .subscribe((esito: Risposta) => {
        console.log("--------|||---------------------------------------------");
        console.log("Esito ?  ", esito);
        if (esito) {
          if (esito.status) {
            res.json(esito);
          } else {
            res.json(esito);
          }
        }
        console.log("--------|||---------------------------------------------");
      });
  }
);

// DbJobs.getInstance().rispostaRichiestaCategorie.subscribe((esito: Risposta) => {
//     return esito;

// });

app.get("/endPoints", (req, res) => {
  DbJobs.getInstance()
    .getCategorie()
    .subscribe((esito: Risposta) => {
      console.log("--------|||---------------------------------------------");
      // console.log("Esito ?  ", esito);
      if (esito) {
        if (esito.status) {
          console.log("-ok");
          res.json(esito);
        } else {
          console.log("-NON ok");
          res.json(esito);
        }
      }
      console.log("--------|||---------------------------------------------");
    });
});

// app.get('/endPoints', DbJobs.getInstance().authorisation, (request, res, next) => {

//     DbJobs.getInstance().getCategorie().subscribe((esito: Risposta) => {
//         console.log("--------|||---------------------------------------------");
//         // console.log("Esito ?  ", esito);
//         if (esito) {
//             if (esito.status) {
//                 console.log('-ok');
//                 res.json(esito);
//             } else {
//                 console.log('-NON ok');
//                 res.json(esito);
//             }
//         }
//         console.log("--------|||---------------------------------------------");
//     })

// });

app.post("/iscriviti", (req, res) => {
  console.log("body received ->", req.body);

  DbJobs.getInstance()
    .iscriviUtente(req.body)
    .subscribe((esito: Risposta) => {
      console.log("--------|||---------------------------------------------");
      console.log("Esito ?  ", esito);

      if (esito) {
        if (esito.status) {
          res.json(esito);
          console.log("--------|||OK");
        } else {
          res.json(esito);
          console.log("--------||NON OK");
        }
      }

      console.log("--------|||---------------------------------------------");
    });
});

app.post(
  "/utente/modifica",
  DbJobs.getInstance().authorisation,
  (req, res, next) => {
    DbJobs.getInstance()
      .modificaUtente(req.body)
      .subscribe((esito: Risposta) => {
        console.log("--------|||---------------------------------------------");
        console.log("Esito ?  ", esito);

        if (esito) {
          if (esito.status) {
            res.json(esito);
            console.log("--------|||OK");
          } else {
            res.json(esito);
            console.log("--------||NON OK");
          }
        }

        console.log("--------|||---------------------------------------------");
      });
  }
);

app.post("/offerta/upload", (req, res, next) => {
  console.log("body received ->", req);

  upload(req, res, function(err) {
    console.log("-->", JSON.stringify(req.body.formModel));

    if (!req.file) {
      console.log("body received ->", req.body);

      console.log("No file received");
      return res.send({
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
          console.log(
            "--------|||---------------------------------------------"
          );
          console.log("Esito ?  ", esito);
          if (esito) {
            if (esito.status) {
              res.json(esito);
            } else {
              res.json(esito);
            }
          }

          console.log(
            "--------|||---------------------------------------------"
          );
        });
    }
  });
});

app.listen(3000);
