// make translations with Polyglot.js
var polyglot, _;
var rightToLeft = false;

function doTranslations() {
  polyglot = new Polyglot({ phrases: translations });
  _ = function (word, vars) {
    return polyglot.t(word, vars);
  };

  // translate words already on the page
  var translateWords = $(".translate");
  $.each(translateWords, function (w, word_element) {
    var word = $(word_element).text();
    $(word_element).text(_(word));
  });

  // set page language (helps use spellcheck)
  $("html").attr("lang", _("en"));

  // check for right-to-left languages (including Arabic)
  // text inputs should have dir="auto" already set
  if (_("ltr") === "rtl") {
    rightToLeft = true;
    $("html").attr("dir", "rtl");
    $("body").addClass("rtl");
  }
}

// in Chrome app - determine language on client side
if (typeof outOfChromeApp === "undefined" || !outOfChromeApp) {
  chrome.i18n.getAcceptLanguages(function (languageList) {
    var preferredLocale = (languageList[0]).toLowerCase().replace("-", "_");
    translations = JSON.parse(getTranslations(preferredLocale));
    doTranslations();
  });
} else {
  doTranslations();
}