# Homer

Homer will be an app for templating, writing, and printing books for beginning
readers. It will support multiple languages, help writers use the letters and
words which children have learned, and support best practices and common layouts
for printing books.

<img src="http://i.imgur.com/sbbnljs.png"/>

## Contest

This project is developed as an entry to the Enabling Writers contest from
USAID / All Children Reading.

Requirements and implementation notes are [in the wiki](https://github.com/mapmeld/homer/wiki).

## Technical

The app must be available online and offline. The online portion of the
activity will be deployed on Heroku, using a Python or
Node.js server. The main storybook editor will be available through the site,
or offline as a Google Chrome app.

Includes:
* [Bootstrap / Bootswatch](http://bootswatch.com/lumen/) - MIT license
* [highlightTextarea](http://www.strangeplanet.fr/work/jquery-highlighttextarea/) - GPL/MIT licenses
* [jQuery 1.x](https://github.com/jquery/jquery/tree/1.x-master) - MIT license
* [jQuery.IME](https://github.com/wikimedia/jquery.ime) - GPL/MIT licenses
* [jsPDF](https://github.com/MrRio/jsPDF) - MIT license
* [polyglot.js](https://github.com/airbnb/polyglot.js) - BSD license

## Licensing

Homer will be open source (MIT license) and be built with several other open
source libraries.
