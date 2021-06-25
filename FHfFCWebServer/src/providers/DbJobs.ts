
import { Account_schema, Tweets_schema, Generic_EndPoint_schema, Annunci_schema, Endpointinthedb_schema } from './../schemas/Schemas';
import CONFIG from '../../config/config.json';

import mongoose = require('mongoose');
import Bluebird = require("bluebird");
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

import { Tweett, TwettExport } from '../models/Tweetter';
import * as basicAuth from 'basic-auth';

import { getLogger } from "log4js";
const LOGGER = getLogger("[MAIN]");
LOGGER.level = "debug"
export class DbJobs {


    private static _instance: DbJobs;
    private thingSchema = new Schema({});

    private generic_EndPointInTheDb;
    private tweetsInTheDb;
    private annunciInTheDb;
    private endPointInTheDb;

    private accountInTheDb;



    public getTweets(gpID: string): Observable<Risposta> {
        LOGGER.info("[getTweets][IN] gpID:", gpID);
        let temp: Subject<Risposta> = new Subject<Risposta>();
        let valore = decodeURI(gpID);
        this.tweetsInTheDb.find({ $text: { $search: valore } }, { score: { $meta: "textScore" } },)
            .sort({ score: { $meta: 'textScore' } }).limit(35).exec((err: String, res: Tweett[]) => {
                if (err) {
                    LOGGER.error("[getTweets]A ", err);
                    return temp.next(new Risposta("Errore Tweet", false, null));
                } else {
                    LOGGER.info("[getTweets] Numero Tweets  : ", res.length);
                    let exit: TwettExport[] = [];
                    for (let t of res) {
                        exit.push(new TwettExport(t));
                    }
                    const risposta: Risposta = new Risposta("Risposta Tweet", true, exit);
                    LOGGER.info("[getTweets][OUT]", risposta)
                    return temp.next(risposta);

                }
            });
        return temp.asObservable();
    }



    public getSpecificEndPoint(genericId: string, nomeDb: string): Observable<any> {
        LOGGER.info("[getSpecificEndPoint][IN] Nome db ", nomeDb, " Generic ID ", genericId);
        let temp: Subject<any> = new Subject<any>();
        let Thing;
        try {
            Thing = mongoose.model(nomeDb)
            LOGGER.info("[getSpecificEndPoint] already instanciated");
        } catch (error) {
            LOGGER.info("[getSpecificEndPoint] not instanciated");
            Thing = mongoose.model(nomeDb, this.thingSchema, nomeDb);

        }


        Thing.findOne({ "id": genericId }, (err: String, res: any) => {


            if (err) {
                LOGGER.error("[getSpecificEndPoint][Thing.findOne] : ", err);
                return temp.next(new Risposta("Errore", false, null));
            } else {
                LOGGER.info("[getSpecificEndPoint][Thing.findOne] : ", res);
                res = JSON.parse(JSON.stringify(res));
                if (res) {
                    delete res['geometry'];
                    delete res['id']
                    delete res['location']
                    delete res['cnr_id']
                    LOGGER.info("[getSpecificEndPoint][Thing.findOne] Risposta  : ", JSON.stringify(res, undefined, 4));
                    return temp.next(new Risposta("Risposta Specific EnPoint ", true, res));
                } else {
                    LOGGER.warn("[getSpecificEndPoint][Thing.findOne] Risposta []");
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

    public ricercaGenerica(testo: string, categorie: string[], coordinate: number[], distance: number): Observable<Risposta> {
        LOGGER.info("[ricercaGenerica] --------------------------------------------------------------------------------");
        LOGGER.info("[ricercaGenerica] QUERY PARAMETERS : Testo : ", testo, "Categorie : ", categorie, "Coordinate : ", JSON.stringify(coordinate), " Distance : ", distance);
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
        if (incategorie) {
            if (incategorie.length > 0) {
                tutto.push({ $or: incategorie });
            }
        }
        if (coordinate) {
            if (coordinate.length > 0) {
                let radius: number = distance * 1000;
                let numberOfEdges: number = 16;
                LOGGER.info("[ricercaGenerica] coordinate.length > 0");
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
        LOGGER.info("[ricercaGenerica] QUERY", tutto);

        this.generic_EndPointInTheDb.find({ $and: tutto }, { score: { $meta: "textScore" } },)
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
                            LOGGER.info("[ricercaGenerica] - lo ordino per distanza ");

                            for (let item of genericEndPoints) {
                                console.log("->", item.distance);
                            }

                        }


                        if (genericEndPoints.length >= 50) {
                            LOGGER.info("[ricercaGenerica] -E' MAGGIORE DI 1000");
                            genericEndPoints = genericEndPoints.slice(0, 50);
                        }
                        for (let item of genericEndPoints) {
                            LOGGER.info("[ricercaGenerica] ->" + item.human_name + " -d> " + item.distance);
                        }

                        const risposta: Risposta = new Risposta("OK", true, genericEndPoints);
                        LOGGER.info("[ricercaGenerica][OUT] : ", risposta);
                        return temp.next(risposta);
                    }

                }
            )

        return temp.asObservable();
    }


    public verificaUtente(req): Observable<Risposta> {
        LOGGER.info("[verificaUtente] : ", req)
        let temp: Subject<Risposta> = new Subject<Risposta>();
        this.accountInTheDb.findOne({ "email": req }, (err: String, utente: UtenteInDb) => {
            
            if (err) {
                LOGGER.warn("[verificaUtente][OUT] UTENTE NON PRESENTE: ", err);
                return temp.next(new Risposta("Utente NON PRESENTE", false, null));
            } else {
                let exit: UtenteExport = new UtenteExport(utente.id, utente.email, utente.telefono, utente.nome, utente.cognome, utente.password, utente.dataIscrizione, utente.attivo, utente.tipo);
                const risposta: Risposta = new Risposta("Utente già presente", true, { "utente": exit })
                LOGGER.info("[verificaUtente][OUT] : ", risposta);
                return temp.next(risposta);
            }


        });
        return temp.asObservable();
    }


    public iscriviUtente(req): Observable<Risposta> {
        LOGGER.info("[iscriviUtente] : ", req)
        let temp: Subject<Risposta> = new Subject<Risposta>();

        this.accountInTheDb.findOne({ "email": req.utente.email }, (err: String, utente: UtenteC) => {
            
            if (err) {
                LOGGER.error("[iscriviUtente] ERROR : ", err);
                return temp.next(new Risposta("Errore", false, null));
            }
            if (utente) {
                LOGGER.warn("[iscriviUtente] already Present : ", err);
                return temp.next(new Risposta("Utente già presente", false, null));
            } else {
                
                
                const utente = this.accountInTheDb();
                LOGGER.info("[iscriviUtente] need to create new utente : ", utente);
                utente._id = uuid.v1();
                utente.email = req.utente.email;
                utente.telefono = req.utente.telefono;
                utente.nome = req.utente.nome;
                utente.cognome = req.utente.cognome;
                utente.password = req.utente.password;
                utente.dataInserimento = new Date;
                utente.attivo = true;
                utente.tipo = req.utente.tipo;

                LOGGER.info("[iscriviUtente] saving : ", utente);
                utente.save((err: String) => {
                    if (err) {
                        LOGGER.error("[iscriviUtente] Error : ", err);
                        return temp.next(new Risposta("Errore Server 1A", false, null));

                    } else {
                        LOGGER.info("[iscriviUtente] Success", { "id": utente._id });
                        return temp.next(new Risposta("Utente Inserito", true, { "id": utente._id }));
                    }

                })
            }
        });
        return temp.asObservable();
    }

    public modificaUtente(req): Observable<Risposta> {

        let temp: Subject<Risposta> = new Subject<Risposta>();
        LOGGER.info("[modificaUtente] [in] ", req.utente );
        this.accountInTheDb.findOne({ "_id": req.utente.id }, (err: String, utente: UtenteInDb) => {
            
            if (err) {
                LOGGER.error("[modificaUtente]  Error A: ", err);
                return temp.next(new Risposta("[modificaUtente] Error  Server A", false, null));
            }
            if (utente) {

                LOGGER.info("[modificaUtente] utente", utente)
                utente.email = req.utente.email;
                utente.telefono = req.utente.telefono;
                utente.nome = req.utente.nome;
                utente.cognome = req.utente.cognome;
                utente.password = req.utente.password;
                utente.tipo = req.utente.tipo;
                LOGGER.info("[modificaUtente] saving", utente)
                utente.save((err: String) => {
                    if (err) {
                        LOGGER.error("[modificaUtente]  Error B: ", err);
                        return temp.next(new Risposta("Error Server B", false, null));
                    } else {
                        LOGGER.info("[modificaUtente] ", { "id": utente._id });
                        return temp.next(new Risposta("Utente Inserito", true, { "id": utente._id }));
                    }
                })
            } else {
                LOGGER.warn("[modificaUtente] User do not exist");
                return temp.next(new Risposta("Utente NON presente", false, null));

            }
        });
        return temp.asObservable();
    }


    public cancellaUtente(id: string): Observable<Risposta> {
        LOGGER.info("[cancellaUtente] IN ", id)
        let temp: Subject<Risposta> = new Subject<Risposta>();
        this.accountInTheDb.findOne({ "_id": id }, (err: String, utente: UtenteInDb) => {
            if (err) {
                LOGGER.error("[cancellaUtente] 1C: ", err);
                temp.next(new Risposta("Errore Server 1C", false, null));
            } else {
                LOGGER.info("[cancellaUtente] UTENTE =  ", utente)
                utente.attivo = false;
                utente.save((err4) => {
                    if (err4) {
                        LOGGER.error("[cancellaUtente] 2C: ", err4);
                        temp.next(new Risposta("Errore Server 2C", false, null));
                    } else {
                        this.annunciInTheDb.find({ "utenteId": id }, (err5: String, annunci: FormModel[]) => {
                            if (err5) {
                                LOGGER.error("[cancellaUtente] 1C", err5);
                            } else {
                                if (annunci) {
                                    for (let annuncio of annunci) {
                                        this.generic_EndPointInTheDb.findOne({ "_id": id }, (err2: String, genericEndPoint: Generic_EndPoint) => {
                                            if (err2) {
                                                LOGGER.error("[cancellaUtente] 3C ", err2);
                                            } else {
                                                if (genericEndPoint) {
                                                    genericEndPoint.active = false;
                                                    genericEndPoint.save((err3) => {
                                                        if (err3) {
                                                            LOGGER.error("[cancellaUtente] 4C", err3);
                                                        } else {
                                                            LOGGER.info("[cancellaUtente] Saved GenericEndPoint =  ", genericEndPoint)
                                                        }
                                                    })
                                                }
                                            }
                                        }
                                        );
                                        annuncio.active = false;
                                        annuncio.save((err6) => {
                                            if (err6) {
                                                LOGGER.error("[cancellaUtente] 5C", err6);
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

        LOGGER.info("[getSingoloAnnuncioById] IN ", id)
        let temp: Subject<Risposta> = new Subject<Risposta>();
        this.annunciInTheDb.findOne({ "_id": id, $or: [{ "active": { "$exists": false } }, { "active": true }] }, (err: String, exit: FormModelReturn) => {
            if (err) {
                LOGGER.error("[getSingoloAnnuncioById] ", err);
                return temp.next(new Risposta("Annunci", false, exit));
            } 
            return temp.next(new Risposta("Annunci", true, exit));
        });
        return temp.asObservable();
    }

    public getAnnunciById(id: string): Observable<Risposta> {
        LOGGER.info("[getAnnunciById] IN ", id)
        let temp: Subject<Risposta> = new Subject<Risposta>();
        this.accountInTheDb.findOne({ "_id": id }, (err: string, utente: UtenteC) => {

            if (!err && utente) {
                if (utente.attivo) {
                    this.annunciInTheDb.find({ "utenteId": id, $or: [{ "active": { "$exists": false } }, { "active": true }] }, (err: String, exit: FormModelReturn[]) => {
                        if (err) {
                            LOGGER.error("[getAnnunciById] A", err);
                            return temp.next(new Risposta("Annunci", false, []));
                        }
                        LOGGER.info("[getAnnunciById] return ", exit)
                        return temp.next(new Risposta("Annunci", true, exit));
                    });
                } else {
                    LOGGER.error("[getAnnunciById] UTENTE IS NOT ACTIVE");
                    let exit: FormModelReturn[] = [];
                    return temp.next(new Risposta("Utente non Attivo", false, exit));
                }
            } else {
                LOGGER.error("[getAnnunciById] B", err);
                let exit: FormModelReturn[] = [];
                return temp.next(new Risposta(err, false, exit));
            }
        });
        return temp.asObservable();

    }

    public cancellaAnnuncio(id: string): Observable<Risposta> {
        LOGGER.info("[cancellaAnnuncio] IN ", id)
        let temp: Subject<Risposta> = new Subject<Risposta>();
        this.annunciInTheDb.findOne({ "_id": id }, (err: string, exit: FormModel) => {
            if (err) {
                LOGGER.error("[cancellaAnnuncio] 3A",err);
                temp.next(new Risposta("Errore server 3A", false, null));
            } else {
                exit.active = false;
                exit.save((err3) => {
                    if (err3) {
                        LOGGER.error("[cancellaAnnuncio] 3B",err3);
                        temp.next(new Risposta("Errore server 3B", false, null));
                    } else {
                        console.log("OK Cancella Procedo");
                        this.generic_EndPointInTheDb.findOne({ "_id": id }, (err2: string, exit2: Generic_EndPoint) => {
                            if (err2) {
                                LOGGER.error("[cancellaAnnuncio] 3B", err);
                                temp.next(new Risposta("Errore server 3C", false, null));
                            } else {
                                exit2.active = false;
                                exit2.remove((err4) => {
                                    if (err4) {
                                        LOGGER.error("[cancellaAnnuncio] 3D", err4);
                                        temp.next(new Risposta("Errore server 3D", false, null));
                                    } else {
                                        LOGGER.info("[cancellaAnnuncio] OK");
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
            if (err) {
                LOGGER.error("[getCategorie]", err);
                return temp.next(new Risposta("Categorie", true, []))
            }
            LOGGER.info("[getCategorie] ok :", exit)
            return temp.next(new Risposta("Categorie", true, exit))

        });
        return temp.asObservable();

    }

    public addAnnuncio(obj: FormModelFromWeb, filenameId: string): Observable<Risposta> {
        LOGGER.info("[addAnnuncio] IN FormModelFromWeb :", obj, " | filenameId : ", filenameId)
        let temp: Subject<Risposta> = new Subject<Risposta>();
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
                LOGGER.error("[addAnnuncio] 4A", err) 
                temp.next(new Risposta("Errore server 4A", false, null));
            } else {
                genericEndPoint.save((err2: String) => {
                    if (err2) {
                        LOGGER.error("[addAnnuncio] 4B", err2)
                        temp.next(new Risposta("Errore server 4B", false, null));
                    } else {
                        LOGGER.info("[addAnnuncio] OK ", filenameId)
                        temp.next(new Risposta("Annuncio Inserito", true, { "id": filenameId }));
                    }
                });
            }
        });
        return temp.asObservable();
    }

    private constructor() {
        DbJobs._instance = this;
        (<any>mongoose).Promise = Bluebird;
        const connection = mongoose.createConnection(CONFIG.mongodb_url);
        mongoose.connect(CONFIG.mongodb_url, { poolSize: 50, useNewUrlParser: true, useUnifiedTopology: true });
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
        LOGGER.info("[login] name ", name," | pass", password)
        let temp: Subject<boolean> = new Subject<boolean>();
        this.accountInTheDb.findOne({ "email": name }, (err: string, utente: UtenteC) => {
            if (err) {
                LOGGER.error("[login]", err)
                temp.next(false);
            } else {
                if (utente) {
                    if (utente.attivo) {
                        if (utente.password === password) {
                            LOGGER.info("[login] OK")
                            temp.next(true);
                        } else {
                            LOGGER.warn("[login] Wrong password")
                            temp.next(false);
                        }
                    } else {
                        LOGGER.warn("[login] Wrong NOT ACTIVE");
                        temp.next(false);
                    }
                } else {
                    LOGGER.warn("[login] Utente does not exists");
                    temp.next(false);
                }
            }
        });
        return temp.asObservable();
    }

    public authorisation(req, res, next) {
        function unauthorized(response) {
            response.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return response.status(401).send({ status: 401, message: "Invalid username or password" });
        }
        let user;
        if (req.headers.authorization) {
            user = Buffer.from(req.headers.authorization.substring(6), 'base64').toString().split(':');
        }
        
        LOGGER.info("[authorisation]-user : ", user);
        if (!user || !user[0]|| !user[1]) {
            LOGGER.warn("[authorisation] UNAUTHORIZED A");
            return unauthorized(res);
        }
        DbJobs.getInstance().login(user[0], user[1]).subscribe((result: boolean) => {
            LOGGER.info("[authorisation] result login : ", result);
            if (result) {
                LOGGER.warn("[authorisation] UNAUTHORIZED B");
                return next();
            } else {
                LOGGER.error("[authorisation]", result);
                return unauthorized(res);
            }
        })
    }


}



