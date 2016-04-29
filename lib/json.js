"use strict";

const http = require("http");
const querystring = require("querystring");

class SyobocalJson {
    constructor(options) {
        options = options || {};

        this.api = options.api || "http://cal.syoboi.jp/json.php";
    }

    request(command, options) {
        options = options || {};

        return new Promise((resolve, reject) => {
            http.get(`${this.api}?Req=${command}&${querystring.stringify(options)}`, res => {
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
        });
    }

    getTitleMedium(options) {
        return this.request("TitleMedium", options).then(data => {
            return this.decodeTitles(data, "medium");
        });
    }

    getTitleLarge(options) {
        return this.request("TitleLarge", options).then(data => {
            return this.decodeTitles(data, "large");
        });
    }

    getTitleFull(options) {
        return this.request("TitleFull", options).then(data => {
            return this.decodeTitles(data, "full");
        });
    }

    getProgramByPID(options) {
        return this.request("ProgramByPID", options).then(data => {
            return this.decodePrograms(data);
        });
    }

    getProgramByCount(options) {
        return this.request("ProgramByCount", options).then(data => {
            return this.decodePrograms(data);
        });
    }

    getProgramByDate(options) {
        if (options.hasOwnProperty("Start")) {
            options.start = this.encodeDate(options.Start);
        }

        return this.request("ProgramByDate", options).then(data => {
            return this.decodePrograms(data);
        });
    }

    getSubTitles(options) {
        return this.request("SubTitles", options).then(data => data.SubTitles);
    }

    getChFilter() {
        return this.request("ChFilter");
    }

    getChIDFilter() {
        return this.request("ChIDFilter");
    }

    decodeTitles(data, type) {
        if (data.Titles === null) return null;

        let titles = {};

        Object.keys(data.Titles).forEach(key => {
            let title = data.Titles[key];

            titles[key] = {
                TID: this.decodeNumber(title.TID),
                Title: title.Title,
                ShortTitle: title.ShortTitle,
                TitleYomi: title.TitleYomi,
                TitleEN: title.TitleEN,
                Cat: this.decodeNumber(title.Cat),
                FirstCh: title.FirstCh,
                FirstYear: this.decodeNumber(title.FirstYear),
                FirstMonth: this.decodeNumber(title.FirstMonth),
                FirstEndYear: this.decodeNumber(title.FirstEndYear),
                FirstEndMonth: this.decodeNumber(title.FirstEndMonth),
                TitleFlag: this.decodeNumber(title.TitleFlag)
            };

            switch (type) {
                case "medium":
                    Object.assign(titles[key], {
                        Links: title.Links
                    });

                    break;

                case "large":
                    Object.assign(titles[key], {
                        Keywords: title.Keywords,
                        UserPoint: this.decodeNumber(title.UserPoint),
                        UserPointRank: this.decodeNumber(title.UserPointRank),
                        TitleViewCount: this.decodeNumber(title.TitleViewCount)
                    });

                    break;

                case "full":
                    Object.assign(titles[key], {
                        Keywords: title.Keywords,
                        UserPoint: this.decodeNumber(title.UserPoint),
                        UserPointRank: this.decodeNumber(title.UserPointRank),
                        TitleViewCount: this.decodeNumber(title.TitleViewCount),
                        Comment: title.Comment,
                        SubTitles: title.SubTitles === "" ? null : (() => {
                            let SubTitles = {};

                            title.SubTitles.split("\r\n").forEach(subTitle => {
                                let match = subTitle.match(/^\*(\d+)\*(.*)$/);
                                if (match === null) return;

                                SubTitles[parseInt(match[1], 10)] = match[2];
                            });

                            return SubTitles;
                        })()
                    });

                    break;

            }
        });

        return titles;
    }

    decodePrograms(data) {
        if (data.Programs === null) return null;

        let programs = {};

        Object.keys(data.Programs).forEach(key => {
            let program = data.Programs[key];

            programs[key] = {
                PID: this.decodeNumber(program.PID),
                TID: this.decodeNumber(program.TID),
                ChID: this.decodeNumber(program.ChID),
                ChName: program.ChName,
                ChEPGURL: program.ChEPGURL,
                Count: this.decodeNumber(program.Count),
                StTime: this.decodeTime(program.StTime),
                EdTime: this.decodeTime(program.EdTime),
                SubTitle2: program.SubTitle2,
                ProgComment: program.ProgComment,
                ConfFlag: program.ConfFlag
            };
        });

        return programs;
    }

    encodeDate(date) {
        let year = date.getFullYear();
        let month = ("0" + (date.getMonth() + 1)).slice(-2);
        let day = ("0" + date.getDate()).slice(-2);

        return `${year}-${month}-${day}`;
    }

    decodeNumber(number) {
        if (number === null) return null;

        return parseInt(number, 10);
    }

    decodeTime(time) {
        if (time === null) return null;

        return new Date(parseInt(time, 10) * 1000);
    }
}

module.exports = SyobocalJson;
