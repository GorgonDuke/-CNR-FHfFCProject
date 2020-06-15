"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TwettExport {
    constructor(t) {
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
exports.TwettExport = TwettExport;
//# sourceMappingURL=Tweetter.js.map