
import { Account_schema, Tweets_schema, Generic_EndPoint_schema, Annunci_schema, Endpointinthedb_schema } from './../schemas/Schemas';

// import * as mongoose from 'mongoose';
import mongoose = require('mongoose');
import Bluebird = require("bluebird");
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';
import { Risposta } from "../models/Risposta";
import uuid = require('uuid');
import { Utente, UtenteC, UtenteInDb, UtenteExport } from '../models/Utente';
import { FormModel, FormModelReturn, FormModelFromWeb } from '../models/FormModel';
import { Generic_EndPoint, Generic_EndPoint_Export } from '../models/Generic_EndPoint';
import { EndpointinthedbIf } from '../models/Endpointinthedb';
import { Subject } from 'rxjs';
import * as circleToPolygon from 'circle-to-polygon';
import { Schema } from 'mongoose';
import { ObjectId, ObjectID } from 'bson';
import * as omit from 'lodash/omit';
import { Tweett, TwettExport } from '../models/Tweetter';
import * as basicAuth from 'basic-auth';
export class DbJobs {


    private static _instance: DbJobs;
    private thingSchema = new Schema({});
    // public rispostaIscrizione: BehaviorSubject<Risposta> = new BehaviorSubject(null);
    // public rispostaCancellazione: BehaviorSubject<Risposta> = new BehaviorSubject(null);
    // public rispostaRichiestaAnnunci: BehaviorSubject<Risposta> = new BehaviorSubject(null);
    // public rispostaCancellaAnnuncio: BehaviorSubject<Risposta> = new BehaviorSubject(null);

    // public rispostaRichiestaCategorieSubject : Subject<Risposta> = new Subject<Risposta>();
    // public rispostaRichiestaCategorie: Observable<Risposta> = new Observable(null);
    // public rispostaInvioAnnuncio: BehaviorSubject<Risposta> = new BehaviorSubject(null);

    private generic_EndPointInTheDb;
    private tweetsInTheDb;
    private annunciInTheDb;
    private endPointInTheDb;

    private accountInTheDb;



    public getTweets(gpID: string): Observable<Risposta> {
        //  let db = mongoose.model('Elenco-CSS-per-disabili', Generic_EndPoint_schema, 'Elenco-CSS-per-disabili');
        let temp: Subject<Risposta> = new Subject<Risposta>();

        let valore  = decodeURI(gpID);
        this.tweetsInTheDb.find({ $text: { $search: valore } }, { score: { $meta: "textScore" } }, )
        .sort({ score: { $meta: 'textScore' } }).limit(35).exec((err: String, res: Tweett[]) => {
            // console.log("Risposta  : ", JSON.stringify(res));
            // console.log("Error : ", err);
            if (err) {
                return temp.next(new Risposta("Errore Tweet", false, null));

            } else {
    
                console.log("********************************************");
                console.log("Numero Tweets  : ", res.length);
                console.log("********************************************");
                let exit: TwettExport[] = [];

                for (let t of res) {
                    exit.push(new TwettExport(t));
                }
                return temp.next(new Risposta("Risposta Tweet", true, exit));

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



    public getSpecificEndPoint(genericId: string, nomeDb: string): Observable<any> {
        //  let db = mongoose.model('Elenco-CSS-per-disabili', Generic_EndPoint_schema, 'Elenco-CSS-per-disabili');

        console.log("Nome db ", nomeDb);
        console.log("Generic ID ", genericId);
        let temp: Subject<any> = new Subject<any>();
        let Thing;
        try {
            Thing = mongoose.model(nomeDb)
            console.log("E' già istanziato");
        } catch (error) {
            console.log("Lo devo istanziare");
            Thing = mongoose.model(nomeDb, this.thingSchema, nomeDb);

        }


        Thing.findOne({ "id": genericId }, (err: String, res: any) => {
            console.log("Risposta  : ", JSON.stringify(res));
            console.log("Error : ", err);
            if (err) {
                return temp.next(new Risposta("Errore", false, null));

            } else {

                // delete myObj.test[keyToDelete];

                // res.geometry = undefined;

                // res.id = undefined;

                // res.cnr_id = undefined;

                res = JSON.parse(JSON.stringify(res));
                if (res) {
                    delete res['geometry'];
                    delete res['id']
                    delete res['location']
                    delete res['cnr_id']
                    console.log("********************************************");
                    // console.log("errore ?  : ", delete res['geometry']);
                    console.log("Risposta  : ", JSON.stringify(res, undefined, 4));
                    console.log("********************************************");
                    return temp.next(new Risposta("Risposta Specific EnPoint ", true, res));
                } else {
                    return temp.next(new Risposta("Risposta Specific EnPoint vuota ", false, null));
                }

            }
        });
        return temp.asObservable();


    }

    calculateDistance(lat1: number, lat2: number, lon1: number, lon2: number) {
        let p = 0.017453292519943295; // Math.PI / 180
        let c = Math.cos;
        let a =
          0.5 -
          c((lat1 - lat2) * p) / 2 +
          (c(lat2 * p) * c(lat1 * p) * (1 - c((lon1 - lon2) * p))) / 2;
        let dis = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
        return Math.round(dis * 10) / 10;
    }
    
    public ricercaGenerica(testo: string, categorie: string[], coordinate: number[], distance: number ): Observable<Risposta> {
        console.log("--------------------------------------------------------------------------------");
        console.log("----RICERCA GENERICA------------------------------------------------------------");
        console.log("--------------------------------------------------------------------------------");
        console.log("---------QUERY PARAMETERS : ");
        console.log("---------> Testo : ", testo);
        console.log("---------> Categorie : ", JSON.stringify(categorie));
        console.log("---------> Coordinate : ", JSON.stringify(coordinate));
        console.log("---------> Distance : ", distance);
        console.log("--------------------------------------------------------------------------------");


        // if (coordinate.length == 0) {
        //      coordinate.push(9.223779);
        //      coordinate.push(45.479987);
        // }
        // testo = "\"" + testo +"\"";
        // console.log("Testo : ", testo );
        console.log("Coordinate >", JSON.stringify(coordinate));
        let temp: Subject<Risposta> = new Subject<Risposta>();
        let semantica = { $text: { $search: testo } }

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
                let radius: number = distance * 1000;
                let numberOfEdges: number = 16;
                console.log("---------CI ENTRO");
                // console.log("-2-",JSON.stringify(circleToPolygon([ 9.330357,45.706937], radius, numberOfEdges)));
                let geo = {
                    geometry: {

                        $geoIntersects: {
                        // $geoWithin: {
                            $geometry: {
                                type: "Polygon",
                                coordinates: circleToPolygon([coordinate[0], coordinate[1]], radius, numberOfEdges).coordinates
                            }
                        }
                    }
                }
                tutto.push(geo);
            }
        }

        // let METERS_PER_MILE = 1609.34
        // let geo = { geometry: { $nearSphere: { $geometry: { type: "Point", coordinates: [ 9.330357,45.706937] }, $maxDistance: 5 * METERS_PER_MILE } } }

        this.generic_EndPointInTheDb.find({ $and: tutto }, { score: { $meta: "textScore" } }, )
            .sort({ score: { $meta: 'textScore' } })
            // .limit(100)
            .exec(
                (err2: String, genericEndPoints: Generic_EndPoint_Export[]) => {
                    if (err2) {
                        return temp.next(new Risposta("Errore Server 1A", false, err2));
                    } else {


                        for (let item of genericEndPoints) {
                            if (item.annunciLat) {
                              item.distance = this.calculateDistance(
                                item.annunciLat,
                                coordinate[1],
                                item.annunciLon,
                                coordinate[0]
                              );
                            } else {
                              item.distance = this.calculateDistance(
                                item.geometry.coordinates[1],
                                coordinate[1],
                                item.geometry.coordinates[0],
                                coordinate[0]
                              );
                            }
                          }
                        if (distance > 15) {
                            genericEndPoints.sort((a, b) => {
                                if (a.distance < b.distance) return -1;
                                if (a.distance > b.distance) return 1;
                                return 0;
                              });
                              console.log("- lo ordino per distanza ");

                              for (let item of genericEndPoints) {
                                console.log("->", item.distance);
                              }

                        }
                        

                        if (genericEndPoints.length >= 50) {
                            console.log("-E' MAGGIORE DI 1000");
                            genericEndPoints = genericEndPoints.slice(0, 50);
                        }
                        for (let item of genericEndPoints) {
                            console.log("->" + item.human_name +" -d> " + item.distance);
                          }
                        console.log("-lUNGHEZZA : " + genericEndPoints.length);
                        return temp.next(new Risposta("OK", true, genericEndPoints));
                    }

                }
            )

        return temp.asObservable();
    }


    public verificaUtente(req): Observable<Risposta> {
        console.log("Utente : ", req)
        let temp: Subject<Risposta> = new Subject<Risposta>();
        this.accountInTheDb.findOne({ "email": req}, (err: String, utente: UtenteInDb) => {
            console.log(JSON.stringify(err));
            console.log(JSON.stringify(utente));
            let exit : UtenteExport = new UtenteExport(utente.id, utente.email, utente.telefono,utente.nome,utente.cognome, utente.password, utente.dataIscrizione, utente.attivo, utente.tipo);

                return temp.next(new Risposta("Utente già presente", true, { "utente": exit }));

        });
        return temp.asObservable();
    }


    public iscriviUtente(req): Observable<Risposta> {

        let temp: Subject<Risposta> = new Subject<Risposta>();

        this.accountInTheDb.findOne({ "email": req.utente.email }, (err: String, utente: UtenteC) => {
            console.log("UtenteC : ", utente);
            console.log("Error : ", err);
            if (utente) {
                return temp.next(new Risposta("Utente già presente", false, null));

            } else {
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
                utente.save((err: String) => {
                    if (err) {
                        console.log("Errore : ", err);
                        return temp.next(new Risposta("Errore Server 1A", false, null));

                    } else {
                        console.log("Successo", { "id": utente._id });
                        return temp.next(new Risposta("Utente Inserito", true, { "id": utente._id }));

                    }

                })
            }
        });
        return temp.asObservable();
    }

    public modificaUtente(req): Observable<Risposta> {

        let temp: Subject<Risposta> = new Subject<Risposta>();

        this.accountInTheDb.findOne({ "_id": req.utente.id }, (err: String, utente: UtenteInDb) => {
            console.log("UtenteC : ", utente);
            console.log("Error : ", err);
            if (utente) {
               
             
                utente.email = req.utente.email;
                utente.telefono = req.utente.telefono;
                utente.nome = req.utente.nome;
                utente.cognome = req.utente.cognome;
                utente.password = req.utente.password;
                utente.tipo = req.utente.tipo;

                console.log("Ora salvo : ", utente);
                utente.save((err: String) => {
                    if (err) {
                        console.log("Errore : ", err);
                        return temp.next(new Risposta("Errore Server 1A", false, null));

                    } else {
                        console.log("Successo", { "id": utente._id });
                        return temp.next(new Risposta("Utente Inserito", true, { "id": utente._id }));

                    }

                })

            } else {

                return temp.next(new Risposta("Utente NON presente", false, null));
                
            }
        });
        return temp.asObservable();
    }


    public cancellaUtente(id: string): Observable<Risposta> {

        let temp: Subject<Risposta> = new Subject<Risposta>();
        console.log("ID ", id)
        this.accountInTheDb.findOne({ "_id": id }, (err: String, utente: UtenteInDb) => {

            if (err) {
                temp.next(new Risposta("Errore Server 1C", false, null));
            } else {
                console.log("UTENTE =  ", utente)
                utente.attivo = false;
                utente.save((err) => {
                    if (err) {
                        console.log("- ERROR 3");
                        temp.next(new Risposta("Errore Server 2C", false, null));
                    } else {


                        this.annunciInTheDb.find({ "utenteId": id }, (err: String, annunci: FormModel[]) => {
                            if (err) {
                                console.log("- Cancellazione Annunci ERROR ", err);
                            } else {
                                if (annunci) {
                                    for (let annuncio of annunci) {

                                        this.generic_EndPointInTheDb.findOne({ "_id": id }, (err2: String, genericEndPoint: Generic_EndPoint) => {

                                            if (err2) {
                                                console.log("Cancellazione EndPoint ERROR 2 ", err2);
                                            } else {
                                                if (genericEndPoint) {

                                                    genericEndPoint.active = false;
                                                    genericEndPoint.save((err3) => {
                                                        if (err) {
                                                            console.log("Cancellazione EndPoint ERROR 3 ", err3);
                                                        }
                                                    })

                                                }
                                            }
                                        }
                                        );
                                        annuncio.active = false;
                                        annuncio.save((err) => {
                                            if (err) {
                                                console.log("- ERROR ", err);
                                            }
                                        })

                                    }
                                }
                            }
                        });


                        temp.next(new Risposta("Utente eliminato", true, null));

                    }
                });
            }


        });
        return temp.asObservable();
    }

    public getSingoloAnnuncioById(id: string): Observable<Risposta> {
        let temp: Subject<Risposta> = new Subject<Risposta>();
        this.annunciInTheDb.findOne({ "_id": id, $or: [{ "active": { "$exists": false } }, { "active": true }] }, (err: String, exit: FormModelReturn) => {

            console.log("*********************");
            console.log("Errore : " + err)
            console.log(exit)

            console.log("*********************");

            console.log("*********************");
            console.log(exit);
            console.log("*********************");
            return temp.next(new Risposta("Annunci", true, exit));


        });
        return temp.asObservable();
    }

    public getAnnunciById(id: string): Observable<Risposta> {

        let temp: Subject<Risposta> = new Subject<Risposta>();

        this.accountInTheDb.findOne({ "_id": id }, (err: string, utente: UtenteC) => {

            if (!err && utente) {
                if (utente.attivo) {
                    this.annunciInTheDb.find({ "utenteId": id, $or: [{ "active": { "$exists": false } }, { "active": true }] }, (err: String, exit: FormModelReturn[]) => {

                        console.log("*********************");
                        console.log("Errore : " + err)
                        console.log(exit)

                        console.log("*********************");

                        console.log("*********************");
                        console.log(exit);
                        console.log("*********************");
                        return temp.next(new Risposta("Annunci", true, exit));


                    });
                } else {
                    console.log("*********************");
                    console.log("Errore2 : UTENTE NON ATTIVO");
                    console.log("*********************");
                    let exit: FormModelReturn[] = [];
                    return temp.next(new Risposta("Utente non Attivo", false, exit));

                }
            } else {
                console.log("*********************");
                console.log("Errore : ", err);
                console.log("*********************");
                let exit: FormModelReturn[] = [];
                return temp.next(new Risposta(err, false, exit));

            }
        });
        return temp.asObservable();

    }

    public cancellaAnnuncio(id: string): Observable<Risposta> {

        let temp: Subject<Risposta> = new Subject<Risposta>();
        this.annunciInTheDb.findOne({ "_id": id }, (err: string, exit: FormModel) => {
            if (err) {
                console.log("- Errore Cancella Annuncio 3A");
                temp.next(new Risposta("Errore server 3A", false, null));
            } else {
                exit.active = false;
                exit.save((err) => {
                    if (err) {
                        console.log("- Errore Cancella Annuncio 3B");
                        temp.next(new Risposta("Errore server 3B", false, null));
                    } else {
                        console.log("OK Cancella Procedo");
                        this.generic_EndPointInTheDb.findOne({ "_id": id }, (err2: string, exit2: Generic_EndPoint) => {
                            if (err2) {
                                console.log("- Errore Cancella Annuncio 3C");
                                temp.next(new Risposta("Errore server 3C", false, null));
                            } else {
                                exit2.active = false;
                                exit2.remove((err3) => {
                                    if (err3) {
                                        console.log("- Errore Cancella Annuncio 3D");
                                        temp.next(new Risposta("Errore server 3D", false, null));
                                    } else {
                                        console.log("OK");
                                        temp.next(new Risposta("Cancellazione avvenuta", true, null));
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

    public getCategorie(): Observable<Risposta> {
        let temp: Subject<Risposta> = new Subject<Risposta>();

        this.endPointInTheDb.find({}, (err: String, exit: EndpointinthedbIf[]) => {


            console.log("*********************");
            return temp.next(new Risposta("Categorie", true, exit))

        });

        return temp.asObservable();

    }

    public addAnnuncio(obj: FormModelFromWeb, filenameId: string): Observable<Risposta> {

        let temp: Subject<Risposta> = new Subject<Risposta>();

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



        annuncio.save((err: String) => {
            if (err) {
                temp.next(new Risposta("Errore server 4A", false, null));
            } else {
                genericEndPoint.save((err2: String) => {
                    if (err2) {
                        temp.next(new Risposta("Errore server 4B", false, null));
                    } else {
                        temp.next(new Risposta("Annuncio Inserito", true, { "id": filenameId }));
                    }
                });
            }

        });

        return temp.asObservable();

    }

    private constructor() {
        DbJobs._instance = this;
        mongoose.Promise = Bluebird;
        // mongoose.connect('mongodb://127.0.0.1:27017/sodatest', {
        //     useMongoClient: true
        // });
        mongoose.connect('mongodb://127.0.0.1:27017/testsodatest', {
            useMongoClient: true
        });

        this.tweetsInTheDb = mongoose.model('Tweets', Tweets_schema, 'Tweets');

        this.generic_EndPointInTheDb = mongoose.model('Generic_EndPoint', Generic_EndPoint_schema, 'Generic_EndPoint');
        this.accountInTheDb = mongoose.model('Utente', Account_schema, 'Utente');

        this.annunciInTheDb = mongoose.model('Annunci', Annunci_schema, 'Annunci');
        this.endPointInTheDb = mongoose.model('EndPointInTheDb', Endpointinthedb_schema, 'EndPointInTheDb');
    }

    public static getInstance(): DbJobs {
        if (!this._instance) {
            this._instance = new DbJobs();
        }
        return this._instance;

    }
    public login(name: string, password: string): Observable<boolean> {

        let temp: Subject<boolean> = new Subject<boolean>();
        this.accountInTheDb.findOne({ "email": name }, (err: string, utente: UtenteC) => {
            if (err) {
                console.log("ERRORE : ", err);
                temp.next(false);
            } else {
                if (utente) {
                    if (utente.attivo) {
                        if (utente.password === password) {

                            temp.next(true);
                        } else {
                            console.log("Wrong PASSWORD");
                            temp.next(false);
                        }
                    } else {
                        console.log("Wrong NOT ACTIVE");
                        temp.next(false);
                    }
                } else {
                    console.log("Wrong Utente");
                    temp.next(false);
                }
            }

        });

        return temp.asObservable();
    }

    public authorisation(req, res, next) {
        // res.setHeader("Access-Control-Allow-Origin", "*");
        // res.setHeader("Content-type", "application/json");
        // console.log(res);
        function unauthorized(res) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.status(401).send({ status: 401, message: "Invalid username or password" });
        };

        var user = basicAuth(req);
        console.log("-user : ", user);

        if (!user || !user.name || !user.pass) {
            console.log("UNAUTHORIZED");
            return unauthorized(res);
        }

        //            console.log('authorisation', this);
        DbJobs.getInstance().login(user.name, user.pass).subscribe((result: boolean) => {
            console.log("RISULTOATO : ", result);
            if (result) {
                console.log("AUTHORIZED");
                return next();
            } else {
                console.log("Errore in login");
                console.log(result);
                return unauthorized(res);
            }

        })

    }


}



