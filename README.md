[![License](https://img.shields.io/badge/License-zlib/libpng-blue.svg)](https://github.com/Lusito/web-ext-translator/blob/master/LICENSE)

An easy to use translation tool for web-extensions with markdown preview.
It's mostly written in TypeScript, HTML & CSS using React and BEM.
It is both an online web-app as well as a standalone tool using JavaFX WebKit as a container, which adds the interfaces for reading and writing files.

You can check out the online version here: https://lusito.github.io/web-ext-translator/

[![Screenshot](https://raw.githubusercontent.com/Lusito/web-ext-translator/master/screenshot.png)](https://raw.githubusercontent.com/Lusito/web-ext-translator/master/screenshot.png)

### Why?

- It is quite painful to manage i18n messages.json files for web-extensions manually.
- Comparing two languages side-by-side makes it easier to spot missing translations
- Being able to edit multi-line translations with a markdown preview was one of the major goals.
  - The markdown preview even replaces placeholders with their respective example.
- It allows users of the online editor to easily load translations from a ZIP file or a Github repository (even branches).
- After changes have been done, translations can be exported to a ZIP file.

### Advanced features for your web-extension

- WET adds hashes to all messages.json files, except the default locale in order to show which translations have been changed (not yet implemented).
- WET helps reduce git changes and thus merge conflicts:
  - It automatically formats your messages.json into a homogeneous format.
  - The order of the translations in the messages.json is kept
- You can define groups inside of your messages.json to keep translations organized.

### Working with groups

In your messages.json, you can add a group entry like this:

```"__WET_GROUP__": { "message": "Branding" },```

This will insert a group header in the translations editor. You can place multiple groups in your messages.json. It is valid JSON to use the same key multiple times in an object, so adding `__WET_GROUP__` as key is no problem. If you, however, want to use unique keys, using `__WET_GROUP__` as a prefix works as well.

Check out [this example](https://lusito.github.io/web-ext-translator/?gh=https://github.com/lusito/forget-me-not/tree/feature/wet) if you want to see groups in action.

### Installation via NPM

```npm install -g web-ext-translator```

You'll need Java 8 or higher installed.

### Usage

From the root of your web-extension directory (where your `_locales` directory is located), run `wet`

### Report isssues

Something not working quite as expected? Do you need a feature that has not been implemented yet? Check the [issue tracker](https://github.com/Lusito/web-ext-translator/issues) and add a new one if your problem is not already listed. Please try to provide a detailed description of your problem, including the steps to reproduce it.

### Contribute

Awesome! If you would like to contribute with a new feature or submit a bugfix, fork this repo and send a pull request. Please, make sure all the unit tests are passing before submitting and add new ones in case you introduced new features.

### License

Web-Ext-Translator has been released under the [zlib/libpng](https://github.com/Lusito/web-ext-translator/blob/master/LICENSE) license, meaning you
can use it free of charge, without strings attached in commercial and non-commercial projects. Credits are appreciated but not mandatory.
