"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Schemas_1 = require("./../schemas/Schemas");
// import * as mongoose from 'mongoose';
const mongoose = require("mongoose");
const Bluebird = require("bluebird");
const Risposta_1 = require("../models/Risposta");
const uuid = require("uuid");
const Subject_1 = require("rxjs/Subject");
const circleToPolygon = require("circle-to-polygon");
const mongoose_1 = require("mongoose");
const Tweetter_1 = require("../models/Tweetter");
const basicAuth = require("basic-auth");
class DbJobs {
    constructor() {
        this.thingSchema = new mongoose_1.Schema({});
        DbJobs._instance = this;
        mongoose.Promise = Bluebird;
        mongoose.connect('mongodb://127.0.0.1:27017/sodatest', {
            useMongoClient: true
        });
        // mongoose.connect('mongodb://127.0.0.1:27017/testsodatest2', {
        //     useMongoClient: true
        // });
        this.tweetsInTheDb = mongoose.model('Tweets', Schemas_1.Tweets_schema, 'Tweets');
        this.generic_EndPointInTheDb = mongoose.model('Generic_EndPoint', Schemas_1.Generic_EndPoint_schema, 'Generic_EndPoint');
        this.accountInTheDb = mongoose.model('Utente', Schemas_1.Account_schema, 'Utente');
        this.annunciInTheDb = mongoose.model('Annunci', Schemas_1.Annunci_schema, 'Annunci');
        this.endPointInTheDb = mongoose.model('EndPointInTheDb', Schemas_1.Endpointinthedb_schema, 'EndPointInTheDb');
    }
    getTweets(gpID) {
        //  let db = mongoose.model('Elenco-CSS-per-disabili', Generic_EndPoint_schema, 'Elenco-CSS-per-disabili');
        let temp = new Subject_1.Subject();
        let valore = decodeURI(gpID);
        this.tweetsInTheDb.find({ $text: { $search: valore } }, { score: { $meta: "textScore" } })
            .sort({ score: { $meta: 'textScore' } }).limit(35).exec((err, res) => {
            // console.log("Risposta  : ", JSON.stringify(res));
            // console.log("Error : ", err);
            if (err) {
                return temp.next(new Risposta_1.Risposta("Errore Tweet", false, null));
            }
            else {
                console.log("********************************************");
                console.log("Numero Tweets  : ", res.length);
                console.log("********************************************");
                let exit = [];
                for (let t of res) {
                    exit.push(new Tweetter_1.TwettExport(t));
                }
                return temp.next(new Risposta_1.Risposta("Risposta Tweet", true, exit));
            }
        });
        // this.tweetsInTheDb.find({ genericEndPointId: gpID }).limit(35).exec((err: String, res: Tweett[]) => {
        //     // console.log("Risposta  : ", JSON.stringify(res));
        //     // console.log("Error : ", err);
        //     if (err) {
        //         return temp.next(new Risposta("Errore Tweet", false, null));
        //     } else {
        //         console.log("********************************************");
        //         console.log("Numero Tweets  : ", res.length);
        //         console.log("********************************************");
        //         let exit: TwettExport[] = [];
        //         for (let t of res) {
        //             exit.push(new TwettExport(t));
        //         }
        //         return temp.next(new Risposta("Risposta Tweet", true, exit));
        //     }
        // });
        return temp.asObservable();
    }
    getSpecificEndPoint(genericId, nomeDb) {
        //  let db = mongoose.model('Elenco-CSS-per-disabili', Generic_EndPoint_schema, 'Elenco-CSS-per-disabili');
        console.log("Nome db ", nomeDb);
        console.log("Generic ID ", genericId);
        let temp = new Subject_1.Subject();
        let Thing;
        try {
            Thing = mongoose.model(nomeDb);
            console.log("E' già istanziato");
        }
        catch (error) {
            console.log("Lo devo istanziare");
            Thing = mongoose.model(nomeDb, this.thingSchema, nomeDb);
        }
        Thing.findOne({ "id": genericId }, (err, res) => {
            console.log("Risposta  : ", JSON.stringify(res));
            console.log("Error : ", err);
            if (err) {
                return temp.next(new Risposta_1.Risposta("Errore", false, null));
            }
            else {
                // delete myObj.test[keyToDelete];
                // res.geometry = undefined;
                // res.id = undefined;
                // res.cnr_id = undefined;
                res = JSON.parse(JSON.stringify(res));
                if (res) {
                    delete res['geometry'];
                    delete res['id'];
                    delete res['location'];
                    delete res['cnr_id'];
                    console.log("********************************************");
                    // console.log("errore ?  : ", delete res['geometry']);
                    console.log("Risposta  : ", JSON.stringify(res, undefined, 4));
                    console.log("********************************************");
                    return temp.next(new Risposta_1.Risposta("Risposta Specific EnPoint ", true, res));
                }
                else {
                    return temp.next(new Risposta_1.Risposta("Risposta Specific EnPoint vuota ", false, null));
                }
            }
        });
        return temp.asObservable();
    }
    ricercaGenerica(testo, categorie, coordinate, distance) {
        console.log("--------------------------------------------------------------------------------");
        console.log("----RICERCA GENERICA------------------------------------------------------------");
        console.log("--------------------------------------------------------------------------------");
        console.log("---------QUERY PARAMETERS : ");
        console.log("---------> Testo : ", testo);
        console.log("---------> Categorie : ", JSON.stringify(categorie));
        console.log("---------> Coordinate : ", JSON.stringify(coordinate));
        console.log("---------> Distance : ", distance);
        console.log("--------------------------------------------------------------------------------");
        let temp = new Subject_1.Subject();
        let semantica = { $text: { $search: testo } };
        let tutto = [];
        tutto.push(semantica);
        let incategorie = [];
        if (categorie) {
            for (let categoria of categorie) {
                let uno = { collection_name: categoria };
                incategorie.push(uno);
            }
        }
        //optional that defaults to 32
        // console.log("-2-",coordinates);
        // let coordinates : Array<number>;
        if (incategorie) {
            if (incategorie.length > 0) {
                tutto.push({ $or: incategorie });
            }
        }
        if (coordinate) {
            if (coordinate.length > 0) {
                let radius = distance * 1000;
                let numberOfEdges = 16;
                console.log("---------CI ENTRO");
                // console.log("-2-",JSON.stringify(circleToPolygon([ 9.330357,45.706937], radius, numberOfEdges)));
                let geo = {
                    geometry: {
                        $geoWithin: {
                            $geometry: {
                                type: "Polygon",
                                coordinates: circleToPolygon([coordinate[0], coordinate[1]], radius, numberOfEdges).coordinates
                            }
                        }
                    }
                };
                tutto.push(geo);
            }
        }
        // let METERS_PER_MILE = 1609.34
        // let geo = { geometry: { $nearSphere: { $geometry: { type: "Point", coordinates: [ 9.330357,45.706937] }, $maxDistance: 5 * METERS_PER_MILE } } }
        this.generic_EndPointInTheDb.find({ $and: tutto }, { score: { $meta: "textScore" } })
            .sort({ score: { $meta: 'textScore' } })
            .limit(100)
            .exec((err2, genericEndPoints) => {
            if (err2) {
                return temp.next(new Risposta_1.Risposta("Errore Server 1A", false, err2));
            }
            else {
                return temp.next(new Risposta_1.Risposta("Errore Server 1A", true, genericEndPoints));
            }
        });
        return temp.asObservable();
    }
    iscriviUtente(req) {
        let temp = new Subject_1.Subject();
        this.accountInTheDb.findOne({ "email": req.utente.email }, (err, utente) => {
            console.log("UtenteC : ", utente);
            console.log("Error : ", err);
            if (utente) {
                return temp.next(new Risposta_1.Risposta("Utente già presente", false, null));
            }
            else {
                console.log("L'utente non c'è");
                let utente = this.accountInTheDb();
                utente._id = uuid.v1();
                utente.email = req.utente.email;
                utente.telefono = req.utente.telefono;
                utente.nome = req.utente.nome;
                utente.cognome = req.utente.cognome;
                utente.password = req.utente.password;
                utente.dataInserimento = new Date;
                utente.attivo = true;
                utente.tipo = req.utente.tipo;
                console.log("Ora salvo : ", utente);
                utente.save((err) => {
                    if (err) {
                        console.log("Errore : ", err);
                        return temp.next(new Risposta_1.Risposta("Errore Server 1A", false, null));
                    }
                    else {
                        console.log("Successo", { "id": utente._id });
                        return temp.next(new Risposta_1.Risposta("Utente Inserito", true, { "id": utente._id }));
                    }
                });
            }
        });
        return temp.asObservable();
    }
    cancellaUtente(id) {
        let temp = new Subject_1.Subject();
        this.accountInTheDb.findOne({ "_id": id }, (err, utente) => {
            if (err) {
                temp.next(new Risposta_1.Risposta("Errore Server 1C", false, null));
            }
            else {
                console.log("UTENTE =  ", utente);
                utente.attivo = false;
                utente.save((err) => {
                    if (err) {
                        console.log("- ERROR 3");
                        temp.next(new Risposta_1.Risposta("Errore Server 2C", false, null));
                    }
                    else {
                        this.annunciInTheDb.find({ "utenteId": id }, (err, annunci) => {
                            if (err) {
                                console.log("- Cancellazione Annunci ERROR ", err);
                            }
                            else {
                                if (annunci) {
                                    for (let annuncio of annunci) {
                                        this.generic_EndPointInTheDb.findOne({ "_id": id }, (err2, genericEndPoint) => {
                                            if (err2) {
                                                console.log("Cancellazione EndPoint ERROR 2 ", err2);
                                            }
                                            else {
                                                if (genericEndPoint) {
                                                    genericEndPoint.active = false;
                                                    genericEndPoint.save((err3) => {
                                                        if (err) {
                                                            console.log("Cancellazione EndPoint ERROR 3 ", err3);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                        annuncio.active = false;
                                        annuncio.save((err) => {
                                            if (err) {
                                                console.log("- ERROR ", err);
                                            }
                                        });
                                    }
                                }
                            }
                        });
                        temp.next(new Risposta_1.Risposta("Utente eliminato", true, null));
                    }
                });
            }
        });
        return temp.asObservable();
    }
    getSingoloAnnuncioById(id) {
        let temp = new Subject_1.Subject();
        this.annunciInTheDb.findOne({ "_id": id, $or: [{ "active": { "$exists": false } }, { "active": true }] }, (err, exit) => {
            console.log("*********************");
            console.log("Errore : " + err);
            console.log(exit);
            console.log("*********************");
            console.log("*********************");
            console.log(exit);
            console.log("*********************");
            return temp.next(new Risposta_1.Risposta("Annunci", true, exit));
        });
        return temp.asObservable();
    }
    getAnnunciById(id) {
        let temp = new Subject_1.Subject();
        this.accountInTheDb.findOne({ "_id": id }, (err, utente) => {
            if (!err && utente) {
                if (utente.attivo) {
                    this.annunciInTheDb.find({ "utenteId": id, $or: [{ "active": { "$exists": false } }, { "active": true }] }, (err, exit) => {
                        console.log("*********************");
                        console.log("Errore : " + err);
                        console.log(exit);
                        console.log("*********************");
                        console.log("*********************");
                        console.log(exit);
                        console.log("*********************");
                        return temp.next(new Risposta_1.Risposta("Annunci", true, exit));
                    });
                }
                else {
                    console.log("*********************");
                    console.log("Errore2 : UTENTE NON ATTIVO");
                    console.log("*********************");
                    let exit = [];
                    return temp.next(new Risposta_1.Risposta("Utente non Attivo", false, exit));
                }
            }
            else {
                console.log("*********************");
                console.log("Errore : ", err);
                console.log("*********************");
                let exit = [];
                return temp.next(new Risposta_1.Risposta(err, false, exit));
            }
        });
        return temp.asObservable();
    }
    cancellaAnnuncio(id) {
        let temp = new Subject_1.Subject();
        this.annunciInTheDb.findOne({ "_id": id }, (err, exit) => {
            if (err) {
                console.log("- Errore Cancella Annuncio 3A");
                temp.next(new Risposta_1.Risposta("Errore server 3A", false, null));
            }
            else {
                exit.active = false;
                exit.save((err) => {
                    if (err) {
                        console.log("- Errore Cancella Annuncio 3B");
                        temp.next(new Risposta_1.Risposta("Errore server 3B", false, null));
                    }
                    else {
                        console.log("OK Cancella Procedo");
                        this.generic_EndPointInTheDb.findOne({ "_id": id }, (err2, exit2) => {
                            if (err2) {
                                console.log("- Errore Cancella Annuncio 3C");
                                temp.next(new Risposta_1.Risposta("Errore server 3C", false, null));
                            }
                            else {
                                exit2.active = false;
                                exit2.save((err3) => {
                                    if (err3) {
                                        console.log("- Errore Cancella Annuncio 3D");
                                        temp.next(new Risposta_1.Risposta("Errore server 3D", false, null));
                                    }
                                    else {
                                        console.log("OK");
                                        temp.next(new Risposta_1.Risposta("Cancellazione avvenuta", true, null));
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        return temp.asObservable();
    }
    getCategorie() {
        let temp = new Subject_1.Subject();
        this.endPointInTheDb.find({}, (err, exit) => {
            console.log("*********************");
            return temp.next(new Risposta_1.Risposta("Categorie", true, exit));
        });
        return temp.asObservable();
    }
    addAnnuncio(obj, filenameId) {
        let temp = new Subject_1.Subject();
        console.log("obj ->", obj.tipoOfferta);
        let annuncio = this.annunciInTheDb();
        annuncio.tipoOfferta = obj.tipoOfferta;
        annuncio.dataInserimento = obj.dataInserimento;
        annuncio.utenteId = obj.utenteId;
        annuncio.organizzazione = obj.organizzazione;
        annuncio.raggio = obj.raggio;
        annuncio.active = true;
        annuncio.geometry = obj.geometry;
        annuncio.descrizione = obj.descrizione;
        annuncio.indirizzo.via = obj.indirizzo.via;
        annuncio.indirizzo.citta = obj.indirizzo.citta;
        annuncio.indirizzo.cap = obj.indirizzo.cap;
        annuncio.indirizzo.lat = obj.indirizzo.lat;
        annuncio.indirizzo.lon = obj.indirizzo.lon;
        annuncio.immagine = filenameId;
        annuncio._id = filenameId;
        let genericEndPoint = this.generic_EndPointInTheDb();
        genericEndPoint._id = filenameId;
        genericEndPoint.collection_name = "Annunci";
        genericEndPoint.counter = 0;
        genericEndPoint.Geometry = obj.geometry;
        genericEndPoint.human_desc = "Annunci";
        genericEndPoint.human_name = obj.tipoOfferta;
        genericEndPoint.counter = 0;
        genericEndPoint.geometry = obj.geometry;
        genericEndPoint.insertedOn = new Date();
        genericEndPoint.annunciLat = obj.indirizzo.lat;
        genericEndPoint.annunciLon = obj.indirizzo.lon;
        genericEndPoint.search_values = obj.indirizzo.citta + " ; " + obj.organizzazione + " ; " + obj.tipoOfferta + " ; " + obj.descrizione;
        genericEndPoint.sec = 0;
        annuncio.save((err) => {
            if (err) {
                temp.next(new Risposta_1.Risposta("Errore server 4A", false, null));
            }
            else {
                genericEndPoint.save((err2) => {
                    if (err2) {
                        temp.next(new Risposta_1.Risposta("Errore server 4B", false, null));
                    }
                    else {
                        temp.next(new Risposta_1.Risposta("Annuncio Inserito", true, { "id": filenameId }));
                    }
                });
            }
        });
        return temp.asObservable();
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new DbJobs();
        }
        return this._instance;
    }
    login(name, password) {
        let temp = new Subject_1.Subject();
        this.accountInTheDb.findOne({ "email": name }, (err, utente) => {
            if (err) {
                console.log("ERRORE : ", err);
                temp.next(false);
            }
            else {
                if (utente) {
                    if (utente.attivo) {
                        if (utente.password === password) {
                            temp.next(true);
                        }
                        else {
                            console.log("Wrong PASSWORD");
                            temp.next(false);
                        }
                    }
                    else {
                        console.log("Wrong NOT ACTIVE");
                        temp.next(false);
                    }
                }
                else {
                    console.log("Wrong Utente");
                    temp.next(false);
                }
            }
        });
        return temp.asObservable();
    }
    authorisation(req, res, next) {
        // res.setHeader("Access-Control-Allow-Origin", "*");
        // res.setHeader("Content-type", "application/json");
        // console.log(res);
        function unauthorized(res) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.status(401).send({ status: 401, message: "Invalid username or password" });
        }
        ;
        var user = basicAuth(req);
        console.log("-user : ", user);
        if (!user || !user.name || !user.pass) {
            console.log("UNAUTHORIZED");
            return unauthorized(res);
        }
        //            console.log('authorisation', this);
        DbJobs.getInstance().login(user.name, user.pass).subscribe((result) => {
            console.log("RISULTOATO : ", result);
            if (result) {
                console.log("AUTHORIZED");
                return next();
            }
            else {
                console.log("Errore in login");
                console.log(result);
                return unauthorized(res);
            }
        });
    }
}
exports.DbJobs = DbJobs;
//# sourceMappingURL=DbJobs.js.map