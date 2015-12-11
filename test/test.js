"use strict";

const syobocal = require("../index");

var syobocalJson = new syobocal.Json();

var rand = Math.floor(Math.random() * 3000);
console.log(rand);

syobocalJson.getTitleFull({TID: rand}).then(data => {
    console.log(data);
    //console.log(data.Titles[TID].Links)
}).catch(err => {
    console.log(err);
});

/*
var syobocalRss2 = new syobocal.Rss2();

syobocalRss2.request({
    start: new Date(),
    end: new Date(Date.now() + 2 * 60 * 60 * 1000)
}).then(data => {
    console.log(data);
}).catch(err => {
    console.log(err);
});

*/
