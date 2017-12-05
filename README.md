[![License](https://img.shields.io/badge/License-zlib/libpng-blue.svg)](https://github.com/Lusito/web-ext-translator/blob/master/LICENSE)

An easy to use translation tool for web-extensions with markdown preview.
It's mostly written in TypeScript, HTML & CSS. It runs inside of a JavaFX WebKit container, which adds the interfaces for reading and writing files.

[![Screenshot](https://raw.githubusercontent.com/Lusito/web-ext-translator/master/screenshot.png)](https://raw.githubusercontent.com/Lusito/web-ext-translator/master/screenshot.png)

### Why?

- It is quite painful to manage i18n messages.json files for web-extensions manually.
- Comparing two languages side-by-side makes it easier to spot missing translations
- Being able to edit multi-line translations with a markdown preview was one of the major goals.

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
