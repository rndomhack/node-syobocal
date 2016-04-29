# syobocal

## Install

```bash
npm i --save syobocal
```

## Usage

```js
const syobocal = require("syobocal");

let syobocalJson = new syobocal.Json();

syobocalJson.getTitleFull({TID: 1}).then(data => {
    console.log(data);
}).catch(err => {
    console.error(err);
});
```
