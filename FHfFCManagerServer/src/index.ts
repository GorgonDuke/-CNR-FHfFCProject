import { Risposta } from './models/Risposta';
import { Geometry } from './models/Geometry';
import { FormModel, FormModelReturn, GeometryReturn, FormModelFromWeb } from './models/FormModel';
import { Utente, UtenteC, UtenteInDb } from './models/Utente';
import { Annunci_schema } from './schemas/Schemas';
import { Account_schema } from './schemas/Schemas';
import { Generic_EndPoint_schema } from './schemas/Schemas';
import { Endpointinthedb_schema } from './schemas/Schemas';
import { ADDRCONFIG } from 'dns';
import * as bodyParser from "body-parser";
import express = require('express');
import multer = require('multer');
import uuid = require('uuid');
import { IndirizzoModel } from './models/IndrizzoModel';
import { Generic_EndPoint } from './models/Generic_EndPoint';
import { DbJobs } from './providers/DbJobs';
var path = require('path');

var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, '/tmp/');
    },
    filename: function (req, file, callback) {
        callback(null, uuid.v1() + ".jpg");
    }
});

// var upload = multer({ dest: '/tmp/' })
var upload = multer({ storage: storage }).single('file');
var mongoose = require('mongoose');


mongoose.set('debug', true);

mongoose.Promise = require('bluebird');
// mongoose.connect('mongodb://127.0.0.1:27017/sodatest', {
    mongoose.connect('mongodb://127.0.0.1:27017/testsodatest', {
    useMongoClient: true
});

var db = mongoose.connection;

var fs = require('fs');

var dir = path.join(__dirname, 'public');

var EndPointInTheDb = mongoose.model('EndPointInTheDb', Endpointinthedb_schema, 'EndPointInTheDb');
var Generic_EndPointInTheDb = mongoose.model('Generic_EndPointb2', Generic_EndPoint_schema, 'Generic_EndPoint2');
var AnnunciInTheDb = mongoose.model('Annunci', Annunci_schema, 'Annunci');
var AccountInTheDb = mongoose.model('Utente', Account_schema, 'Utente');
var esito: boolean;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
    console.log("siamoconnessi ");
});

let app = express();


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/test', (request, res) => {
    res.json(new Date());
});

app.get('/getAnnunci/:annuncioId', (request, res) => {
    console.log("AnnuncioId->", request.params.annuncioId);
    // console.log("body received ->", req.body);
    DbJobs.getInstance().getSingoloAnnuncioById(request.params.annuncioId).subscribe((esito: Risposta) => {

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

app.get('/myannunci/:utenteId', (request, res) => {
    console.log("My Utente Id ->", request.params.utenteId);
    // console.log("body received ->", req.body);
    DbJobs.getInstance().getAnnunciById(request.params.utenteId).subscribe((esito: Risposta) => {

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

app.get('/getGeneric/:genericid/:dbname', (request, res) => {
    
    console.log("Generic Id ->", request.params.genericid);
    console.log("DbName Id ->", request.params.dbname);
    // console.log("body received ->", req.body);
    DbJobs.getInstance().getSpecificEndPoint(request.params.genericid,request.params.dbname).subscribe((esito: Risposta) => {

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

app.get('/tweeet/:genericEndPointID', (request, res) => {
    console.log("My Utente Id ->", request.params.genericEndPointID);
    // console.log("body received ->", req.body);
    DbJobs.getInstance().getTweets(request.params.genericEndPointID).subscribe((esito: Risposta) => {

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

app.get('/ricerca/:testo/:categorie/:coordinate/:distance', (request, res) => {
    console.log("Testo da ricercare : ->", request.params.testo);
    console.log("Categorie in cui ricercare : ->", request.params.categorie);
    console.log("coordinate in cui ricercare : ->", request.params.coordinate);
    console.log("distance in cui ricercare : ->", request.params.distance);

    let categorie: string[] = [];
    if (request.params.categorie) {
        categorie =JSON.parse(request.params.categorie);
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
    DbJobs.getInstance().ricercaGenerica(request.params.testo, categorie, coordinate, request.params.distance).subscribe((esito: Risposta) => {

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

app.get('/immagini/:id', (req, res) => {

    var file = path.join('/tmp/' + req.params.id + '.jpg');


    var type = mime[path.extname(file).slice(1)] || 'text/plain';
    var s = fs.createReadStream(file);
    s.on('open', function () {
        res.set('Content-Type', type);
        s.pipe(res);
    });
    s.on('error', function () {
        res.set('Content-Type', 'text/plain');
        res.status(404).end('Not found');
    });
});

app.get('/utente/delete/:utenteid', (request, res) => {
    console.log("DELETE UTENTE ID ->", request.params.utenteid);
    DbJobs.getInstance().cancellaUtente(request.params.utenteid).subscribe((esito: Risposta) => {
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

app.get('/utente/reactivate/:utenteid', (request, res) => {
    console.log("DELETE UTENTE ID ->", request.params.utenteid);
    DbJobs.getInstance().riattivaUtente(request.params.utenteid).subscribe((esito: Risposta) => {
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

app.get('/myannunci/delete/:elemetid', (request, res) => {
    console.log("DELETE ANNUNCI ID ->", request.params.elemetid);
    DbJobs.getInstance().cancellaAnnuncio(request.params.elemetid).subscribe((esito: Risposta) => {
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
app.get('/myannunci/reactivate/:elemetid', (request, res) => {
    console.log("DELETE ANNUNCI ID ->", request.params.elemetid);
    DbJobs.getInstance().riattivaAnnuncio(request.params.elemetid).subscribe((esito: Risposta) => {
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

app.post('/salvaOpenData', (req, res) => {
    console.log("salvaOpenData ANNUNCI ID ->");
    // let categorie: any[] = [];
    // if (req.body.opengeo) {
    //     categorie =JSON.parse(req.body.opengeo);
    // }
    // console.log("salvaOpenData ANNUNCI ID ->", categorie);
    DbJobs.getInstance().saveElencoSoda(req.body.opengeo).subscribe((esito: Risposta) => {
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

app.post('/salaGenericEndpoint', (req, res) => {
    // let categorie: any[] = [];
    // if (req.body.opengeo) {
    //     categorie =JSON.parse(req.body.opengeo);
    // }
    // console.log("salvaOpenData ANNUNCI ID ->", categorie);
    DbJobs.getInstance().saveEndPoint(req.body.endpoint, req.body.valori ).subscribe((esito: Risposta) => {
        console.log("--------||salaGenericEndpoint||---------------------------------------------");
        console.log("Esito ?  ", esito);

    console.log("--------|-------------------------------------------------------------------");
    console.log("req.body.endpoint ->", req.body.endpoint);
    console.log("--------|-------------------------------------------------------------------");
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

app.get('/prendiOpenData', (req, res) => {
    console.log("prendiOpenData ANNUNCI ID ->");
    // let categorie: any[] = [];
    // if (req.body.opengeo) {
    //     categorie =JSON.parse(req.body.opengeo);
    // }
    // console.log("salvaOpenData ANNUNCI ID ->", categorie);
    DbJobs.getInstance().prendiElencoSoda().subscribe((esito: Risposta) => {
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

app.get('/prendiEndPointSalvati', (req, res) => {
    console.log("prendiOpenData ANNUNCI ID ->");
    // let categorie: any[] = [];
    // if (req.body.opengeo) {
    //     categorie =JSON.parse(req.body.opengeo);
    // }
    // console.log("salvaOpenData ANNUNCI ID ->", categorie);
    DbJobs.getInstance().prendiEndPointInTheDb().subscribe((esito: Risposta) => {
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


app.get('/prendiEndPointPerCategoria/:endPoint', (req, res) => {

    console.log("DELETE prendiEndPointPerCategoria ->", req.params.endPoint);
    
    // let categorie: any[] = [];
    // if (req.body.opengeo) {
    //     categorie =JSON.parse(req.body.opengeo);
    // }
    // console.log("salvaOpenData ANNUNCI ID ->", categorie);
    DbJobs.getInstance().prendiGenericEndPointPerCategoria(req.params.endPoint).subscribe((esito: Risposta) => {
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
app.get('/prendiUtenti', (req, res) => {
    console.log("prendiOpenData ANNUNCI ID ->");
    // let categorie: any[] = [];
    // if (req.body.opengeo) {
    //     categorie =JSON.parse(req.body.opengeo);
    // }
    // console.log("salvaOpenData ANNUNCI ID ->", categorie);
    DbJobs.getInstance().prendiUtenti().subscribe((esito: Risposta) => {
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



// DbJobs.getInstance().rispostaRichiestaCategorie.subscribe((esito: Risposta) => {
//     return esito;


// });


app.get('/endPoints', (request, res) => {

    DbJobs.getInstance().getCategorie().subscribe((esito: Risposta) => {
        console.log("--------|||---------------------------------------------");
        // console.log("Esito ?  ", esito);
        if (esito) {
            if (esito.status) {
                console.log('-ok');
                res.json(esito);
            } else {
                console.log('-NON ok');
                res.json(esito);
            }
        }
        console.log("--------|||---------------------------------------------");
    })


});

app.post('/iscriviti', (req, res) => {

    console.log("body received ->", req.body);

    DbJobs.getInstance().iscriviUtente(req.body).subscribe((esito: Risposta) => {


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

app.post('/offerta/upload', (req, res) => {



    upload(req, res, function (err) {

        console.log("-->",JSON.stringify(req.body.formModel));

        if (!req.file) {
            console.log("body received ->", req.body);

            console.log("No file received");
            return res.send({
                success: false
            });

        } else {
            let obj: FormModelFromWeb = JSON.parse(req.body.formModel);


            DbJobs.getInstance().addAnnuncio(obj, req.file.filename.substring(0, req.file.filename.length - 4)).subscribe((esito: Risposta) => {

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
    })
});


app.listen(3002);
