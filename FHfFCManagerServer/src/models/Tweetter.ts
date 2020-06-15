// 182e423e-6a85-4cd7-8437-9cf781568713
import { Tweets_schema } from '../schemas/Schemas';

import * as mongoose from 'mongoose';
export interface Tweett {


    genericEndPointId: string;
    status: Status;


}

export interface Status {
    text: string;
    createdAt: string;
    user: TUser;
    lang: string;

}
export interface TUser {
    name: string;
    screenName: string;
    profileImageUrl: string;
    profileImageUrlHttps: string;
}


export class TwettExport {

    genericEndPointId: string;
    text: string;
    createdAt: string;
    lang: string;
    name: string;
    screenName: string;
    profileImageUrl: string;
    profileImageUrlHttps: string;

    constructor(t : Tweett) {
        this.genericEndPointId = t.genericEndPointId;
        this.text = t.status.text;
        this.createdAt = t.status.createdAt;
        this.lang = t.status.lang;
        this.name = t.status.user.name;
        this.screenName = t.status.user.screenName;
        this.profileImageUrl = t.status.user.profileImageUrl;
        this.profileImageUrlHttps = t.status.user.profileImageUrlHttps;
    }

}
