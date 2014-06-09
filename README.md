# iLoominate

iLoominate will be an app for templating, writing, and printing books for beginning
readers. It will support multiple languages, help writers use the letters and
words which children have learned, and support best practices and common layouts
for printing books.

<img src="http://i.imgur.com/kjOXrko.png"/>

## Contest

This project is developed as an entry to the Enabling Writers contest from
USAID / All Children Reading.

Requirements and implementation notes are [in the wiki](https://github.com/mapmeld/homer/wiki).

## Educational

iLoominate supports "word lists" and "letter lists" to help writers use letters and words
appropriate for students' grade level. For example, if a writer types the phrase: "A man a plan a canal
Panama" the program will highlight any letters or words which are not on the list.

Letter lists and word lists are also tested in Arabic and Devanagari scripts.

## Technical

The app must be available online and offline. The online portion of the
activity will be deployed on Heroku, using a Python or
Node.js server. The main storybook editor will be available through the site,
or offline as a Google Chrome app.

Includes:
* [antihighlight](https://github.com/mapmeld/jQuery-antihighlight) fork of [highlightTextarea](http://www.strangeplanet.fr/work/jquery-highlighttextarea/) - GPL/MIT licenses
* [Bootstrap / Bootswatch](http://bootswatch.com/lumen/) - MIT license
* [JavaScript-MD5](https://github.com/blueimp/JavaScript-MD5) - MIT license
* [jQuery 1.x](https://github.com/jquery/jquery/tree/1.x-master) - MIT license
* [jQuery.IME](https://github.com/wikimedia/jquery.ime) - GPL/MIT licenses
* [jsPDF](https://github.com/MrRio/jsPDF) - MIT license
* [polyglot.js](https://github.com/airbnb/polyglot.js) - BSD license
* [turn.js](https://github.com/blasten/turn.js) - non-commercial BSD license

Web server uses Node.js with libraries Express, Passport, and Mongoose.

Tests are run using Mocha and continuous integration on travis-ci.org - Link to latest build:

[![Build Status](https://travis-ci.org/mapmeld/iloominate.png)](https://travis-ci.org/mapmeld/iloominate)

Configuring cloud server on Heroku:

    heroku addons:add mongolab:starter
    heroku config:set SECRET='your_secret_passcode_token'

## Licensing

iLoominate will be open source (MIT license) and be built with several other open
source libraries.
