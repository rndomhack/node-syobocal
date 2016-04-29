"use strict";

const http = require("http");
const querystring = require("querystring");

class SyobocalRss2 {
    constructor(options) {
        options = options || {};

        this.api = options.api || "http://cal.syoboi.jp/rss2.php";
    }

    request(options) {
        options = options || {};

        if (options.hasOwnProperty("start")) {
            options.start = this.encodeTime(options.start);
        }

        if (options.hasOwnProperty("end")) {
            options.end = this.encodeTime(options.end);
        }

        return new Promise((resolve, reject) => {
            http.get(`${this.api}?alt=json&${querystring.stringify(options)}`, res => {
                let body = "";

                res.setEncoding("utf8");

                res.on("data", chunk => {
                    body += chunk;
                });

                res.on("end", () => {
                    let json;
                    try {
                        json = JSON.parse(body);
                    } catch (err) {
                        reject(err);
                    }

                    resolve(json);
                });
            }).on("error", err => {
                reject(err);
            });
        }).then(data => {
            return this.decodeRequest(data);
        });
    }

    decodeRequest(data) {
        let chInfo = {};

        Object.keys(data.chInfo).map(key => {
            let info = data.chInfo[key];

            chInfo[key] = {
                ChID: this.decodeNumber(info.ChID),
                ChName: info.ChName,
                ChURL: info.ChURL,
                ChiEPGName: info.ChiEPGName,
                ChGID: this.decodeNumber(info.ChGID),
                ChComment: info.ChComment
            };
        });

        let items = data.items.map(item => {
            return {
                StTime: this.decodeTime(item.StTime),
                EdTime: this.decodeTime(item.EdTime),
                LastUpdate: this.decodeTime(item.LastUpdate),
                Count: this.decodeNumber(item.Count),
                StOffset: this.decodeNumber(item.StOffset),
                TID: this.decodeNumber(item.TID),
                PID: this.decodeNumber(item.PID),
                ProgComment: item.ProgComment,
                ChID: this.decodeNumber(item.ChID),
                SubTitle: item.SubTitle,
                Flag: this.decodeNumber(item.Flag),
                Deleted: this.decodeNumber(item.Deleted),
                Warn: this.decodeNumber(item.Warn),
                Revision: this.decodeNumber(item.Revision),
                AllDay: this.decodeNumber(item.AllDay),
                Title: item.Title,
                ShortTitle: item.ShortTitle,
                Cat: this.decodeNumber(item.Cat),
                Urls: this.decodeUrls(item.Urls),
                ChName: item.ChName,
                ChURL: item.ChURL,
                ChGID: this.decodeNumber(item.ChGID),
                ChInfo: chInfo[item.ChID]
            };
        });

        return items;
    }

    encodeTime(date) {
        let year = date.getFullYear();
        let month = ("0" + (date.getMonth() + 1)).slice(-2);
        let day = ("0" + date.getDate()).slice(-2);
        let hour = ("0" + date.getHours()).slice(-2);
        let minute = ("0" + date.getMinutes()).slice(-2);

        return `${year}${month}${day}${hour}${minute}`;
    }

    decodeNumber(number) {
        if (number === null) return null;

        return parseInt(number, 10);
    }

    decodeTime(time) {
        if (time === null) return null;

        return new Date(parseInt(time, 10) * 1000);
    }

    decodeUrls(urls) {
        if (urls === null) return null;

        return urls.split("\n").map(url => url.split("\t"));
    }
}

module.exports = SyobocalRss2;
