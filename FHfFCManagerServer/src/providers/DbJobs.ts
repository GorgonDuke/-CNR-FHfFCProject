
import { Geometry, GeometryOBj } from './../models/Geometry';

import { Account_schema, Tweets_schema, Generic_EndPoint_schema, Annunci_schema, Endpointinthedb_schema, OpenGeoLombardia } from './../schemas/Schemas';

// import * as mongoose from 'mongoose';
import mongoose = require('mongoose');
import Bluebird = require("bluebird");
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Risposta } from "../models/Risposta";
import uuid = require('uuid');
import { Utente, UtenteC, UtenteInDb } from '../models/Utente';
import { FormModel, FormModelReturn, FormModelFromWeb } from '../models/FormModel';
import { Generic_EndPoint, GenericEndPointObj } from '../models/Generic_EndPoint';
import { EndpointinthedbIf, EndPointInTheDbWeb } from '../models/Endpointinthedb';
import { Subject } from 'rxjs/Subject';
import * as circleToPolygon from 'circle-to-polygon';
import { Schema } from 'mongoose';
import { ObjectId, ObjectID } from 'bson';
import * as omit from 'lodash/omit';
import { Tweett, TwettExport } from '../models/Tweetter';

export class DbJobs {


    private static _instance: DbJobs;
    private thingSchema = new Schema({}, { strict: false });
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
    private openGeoLombardiaDb;

    private accountInTheDb;



    public getTweets(gpID: string): Observable<Risposta> {
        //  let db = mongoose.model('Elenco-CSS-per-disabili', Generic_EndPoint_schema, 'Elenco-CSS-per-disabili');
        let temp: Subject<Risposta> = new Subject<Risposta>();


        this.tweetsInTheDb.find({ genericEndPointId: gpID }).limit(35).exec((err: String, res: Tweett[]) => {
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



    public ricercaGenerica(testo: string, categorie: string[], coordinate: number[], distance: number): Observable<Risposta> {
        console.log("--------------------------------------------------------------------------------");
        console.log("----RICERCA GENERICA------------------------------------------------------------");
        console.log("--------------------------------------------------------------------------------");
        console.log("---------QUERY PARAMETERS : ");
        console.log("---------> Testo : ", testo);
        console.log("---------> Categorie : ", JSON.stringify(categorie));
        console.log("---------> Coordinate : ", JSON.stringify(coordinate));
        console.log("---------> Distance : ", distance);
        console.log("--------------------------------------------------------------------------------");


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
                        $geoWithin: {
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
            .limit(100)
            .exec(
                (err2: String, genericEndPoints: Generic_EndPoint[]) => {
                    if (err2) {
                        return temp.next(new Risposta("Errore Server 1A", false, err2));
                    } else {
                        return temp.next(new Risposta("Errore Server 1A", true, genericEndPoints));
                    }

                }
            )

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

    public cancellaUtente(id: string): Observable<Risposta> {

        let temp: Subject<Risposta> = new Subject<Risposta>();

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

    public riattivaUtente(id: string): Observable<Risposta> {

        let temp: Subject<Risposta> = new Subject<Risposta>();

        this.accountInTheDb.findOne({ "_id": id }, (err: String, utente: UtenteInDb) => {

            if (err) {
                temp.next(new Risposta("Errore Server 1C", false, null));
            } else {
                console.log("UTENTE =  ", utente)
                utente.attivo = true;
                utente.save((err) => {
                    if (err) {
                        console.log("- ERROR 3");
                        temp.next(new Risposta("Errore Server 2C", false, null));
                    } else {
                        temp.next(new Risposta("Utente riattivato", true, null));

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
                    this.annunciInTheDb.find({ "utenteId": id }, (err: String, exit: FormModelReturn[]) => {

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
                                exit2.save((err3) => {
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

    public riattivaAnnuncio(id: string): Observable<Risposta> {

        let temp: Subject<Risposta> = new Subject<Risposta>();
        this.annunciInTheDb.findOne({ "_id": id }, (err: string, exit: FormModel) => {
            if (err) {
                console.log("- Errore Cancella Annuncio 3A");
                temp.next(new Risposta("Errore server 3A", false, null));
            } else {
                exit.active = true;
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
                                exit2.active = true;
                                exit2.save((err3) => {
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

    public saveElencoSoda(data: any[]): Observable<Risposta> {
        let temp: Subject<Risposta> = new Subject<Risposta>();
        this.openGeoLombardiaDb.remove({}, (err) => {
            console.log("Errore ? ", err)
            this.openGeoLombardiaDb.insertMany(data, (err2) => {
                console.log("Errore 2 ?", err2);
                temp.next(new Risposta("Fatto", true, null));

            })
        });
        return temp.asObservable();
    }


    public prendiElencoSoda(): Observable<Risposta> {
        let temp: Subject<Risposta> = new Subject<Risposta>();
        this.openGeoLombardiaDb.find({}, (err, data) => {
            console.log("Errore ? ", err)

            temp.next(new Risposta("Fatto", true, data));


        });
        return temp.asObservable();
    }

    public prendiGenericEndPointPerCategoria(categoria: string): Observable<Risposta> {
        let temp: Subject<Risposta> = new Subject<Risposta>();
        this.generic_EndPointInTheDb.find({ "collection_name": categoria }, (err, data) => {
            console.log("Errore ? ", err)

            temp.next(new Risposta("Fatto", true, data));


        });
        return temp.asObservable();
    }

    public prendiEndPointInTheDb(): Observable<Risposta> {
        let temp: Subject<Risposta> = new Subject<Risposta>();
        this.endPointInTheDb.find({}, (err, data) => {
            console.log("Errore ? ", err)

            temp.next(new Risposta("Fatto", true, data));


        });
        return temp.asObservable();
    }

    public prendiUtenti(): Observable<Risposta> {
        let temp: Subject<Risposta> = new Subject<Risposta>();
        this.accountInTheDb.find({}, (err, data) => {
            console.log("Errore ? ", err)

            temp.next(new Risposta("Fatto", true, data));


        });
        return temp.asObservable();
    }

    public saveGenericEndPoint(): Observable<Risposta> {
        let temp: Subject<Risposta> = new Subject<Risposta>();
        this.openGeoLombardiaDb.find({}, (err, data) => {
            console.log("Errore ? ", err)

            temp.next(new Risposta("Fatto", true, data));


        });
        return temp.asObservable();
    }

    public saveEndPoint(endPoint: EndPointInTheDbWeb, data: any[]): Observable<Risposta> {
        let temp: Subject<Risposta> = new Subject<Risposta>();
        let toInsert: GenericEndPointObj[] = [];
        let toGenericInsert: object[] = [];
        let totale: number = data.length;
        let inseriti: number = 0;
        let Thing;

        let log : string = "";
        try {
            Thing = mongoose.model(endPoint.endPoint.db_name)
            console.log("E' già istanziato");
            log = log + "E' già istanziato\n";
        } catch (error) {
            console.log("Lo devo istanziare");
            log = log + "Lo devo istanziare\n";
            Thing = mongoose.model(endPoint.endPoint.db_name, this.thingSchema, endPoint.endPoint.db_name);

        }


        for (let e of data) {

            try {
                let id: string = uuid.v1();
                let genericEndPoint = new GenericEndPointObj();
                genericEndPoint._id = id;
                genericEndPoint.collection_name = endPoint.endPoint.db_name;
                genericEndPoint.counter = 0;
                // genericEndPoint.Geometry = obj.geometry;
                genericEndPoint.human_desc = endPoint.endPointName;
                genericEndPoint.human_name = e[endPoint.dacercare.nome];
                genericEndPoint.counter = 0;
                let g: GeometryOBj = new GeometryOBj();
                g.type = "Point";
                let lat: number;
                let risulato: string[] = endPoint.dacercare.latitude.split('.');
                if (risulato.length > 1) {
                    lat = e[risulato[0]][risulato[1]];
                } else {
                    lat = e[endPoint.dacercare.latitude];
                }
                let lon: number;
                let risulato2: string[] = endPoint.dacercare.longitude.split('.');
                if (risulato2.length > 1) {
                    lon = e[risulato2[0]][risulato2[1]];
                } else {
                    lon = e[endPoint.dacercare.longitude];

                }

                g.coordinates = [+lon, +lat];

                genericEndPoint.geometry = g;
                genericEndPoint.insertedOn = new Date();
                let toSearch: string = "";
                let is1: boolean = true;
                for (let x of endPoint.dacercare.ricerche) {
                    if (is1) {
                        toSearch = e[x];
                        is1 = false;
                    } else {
                        toSearch = toSearch + ";" + e[x];
                    }

                }
                toSearch = toSearch + endPoint.daAggiungereARicerca;
                genericEndPoint.search_values = toSearch;
                genericEndPoint.sec = 0;
                toInsert.push(genericEndPoint);
                inseriti = inseriti + 1;

                e["cnr_id"] = {
                    endpoint_desc: endPoint.endPoint.description,
                    endpoint_id: endPoint.endPoint._id
                };
                e["id"] = id;
                e["geometry"] = g;
                e["color"] = endPoint.color;

                console.log("E ->", JSON.stringify(e))
                toGenericInsert.push(e);
            }
            catch (eee) {

                log = log + eee+"\n";
                console.log("Elemento non scritto ", e);
                console.log("Motivo ", eee);
            }
        }

        log = log + "lunghezza to inserìt : " + toInsert.length +"\n";
        // this.generic_EndPointInTheDb.remove({}, (err) => {
            this.generic_EndPointInTheDb.insertMany(toInsert, (err2) => {
              
                let endPointToInsert = this.endPointInTheDb();
                endPointToInsert._id = new mongoose.mongo.ObjectId();
                endPointToInsert.addedd = new Date();
                endPointToInsert.endPoint = endPoint.endPoint;
                endPointToInsert.inserted = inseriti,
                endPointToInsert.color = endPoint.color;
                endPointToInsert.total = totale
                endPointToInsert.save((err) => {
                    console.log("Errore endPointToInsert", err);

                    Thing.insertMany(toGenericInsert, (err3) => {
                        console.log("Errore endPointToInsert3 ", err3);
                        console.log("lOG ?", log);
                        console.log("Errore 2 ?", err2);
                        temp.next(new Risposta("Fatto", true, null));  
                       
                    });

                })


            });
        // })
      

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
        this.openGeoLombardiaDb = mongoose.model("OpenGeoLombardia", OpenGeoLombardia, "OpenGeoLombardia");
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
}




