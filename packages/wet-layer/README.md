# wet-layer

[![License](https://img.shields.io/badge/License-zlib/libpng-blue.svg)](https://github.com/Lusito/web-ext-translator/blob/master/LICENSE)

A layer between web-extensions and i18n to allow for the live apply feature of the web-ext-translator.


### Installation via NPM

```npm install wet-layer --save```

Configure webpack like this, so that webextension-polyfill-ts will not be bundled twice:

```javascript
var path = require("path");

module.exports = {
    //...
    resolve: {
        //...
        alias: {
            "webextension-polyfill-ts": path.resolve(path.join(__dirname, "node_modules", "webextension-polyfill-ts"))
        },
    },
```

### Example

Use it like this in your extension:

```typescript
import { wetLayer } from "wet-layer";

// In the background script, call this at startup (once), so that the storage is cleared:
wetLayer.reset();

// In other scripts (content scripts), make sure to call this at startup (once), so that translations are loaded:
wetLayer.loadFromStorage();

// Then use it in place of i18n.getMessage():
const message = wetLayer.getMessage("my_translation_key", ["foo", "bar"]);

// Listen for updates.. this will also get called by loadFromStorage():
wetLayer.addListener(() => console.log("Translations have been updated.. get your messages from wetLayer again!"));

```

You'll need to create a simple content script like this, which forwards messages from the translation website to your extension:
```javascript
// Adjust these constants to match your github repository:
const vcsHost = "github";
const vcsUser = "lusito";
const vcsRepository = "forget-me-not";

window.addEventListener("message", (event) => {
  if (event.source == window && event.data && event.data.action === "WetApplyLanguage"
    && vcsHost === event.data.vcsHost.toLowerCase() && vcsUser === event.data.vcsUser.toLowerCase()
     && vcsRepository === event.data.vcsRepository.toLowerCase()) {
    browser.runtime.sendMessage({ action: "WetApplyLanguage", language: event.data.language });
  }
});
window.postMessage({ action: "EnableWebExtensionMode" }, "*");
```

Hook hup the content script in your manifest:
```json
    "content_scripts": [{
        "matches": [ "https://lusito.github.io/web-ext-translator/*" ],
        "js": [ "path/to/wetLayerContent.js" ],
        "run_at": "document_idle"
    }],
```
And Make sure you have permissions set up, so that the script can be loaded (storage will be needed as well):

```json
    "permissions": [
        "storage",
        "https://lusito.github.io/web-ext-translator/*"
    ]
```

This extension uses storage.local to store and retrieve the data accross scripts. The keys used are: "wet-locale" and "wet-map".

### Report isssues

Something not working quite as expected? Do you need a feature that has not been implemented yet? Check the [issue tracker](https://github.com/Lusito/web-ext-translator/issues) and add a new one if your problem is not already listed. Please try to provide a detailed description of your problem, including the steps to reproduce it.

### Contribute

Awesome! If you would like to contribute with a new feature or submit a bugfix, fork this repo and send a pull request. Please, make sure all the unit tests are passing before submitting and add new ones in case you introduced new features.

### License

wet-layer has been released under the [zlib/libpng](https://github.com/Lusito/web-ext-translator/blob/master/LICENSE) license, meaning you
can use it free of charge, without strings attached in commercial and non-commercial projects. Credits are appreciated but not mandatory.
