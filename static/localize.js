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

    var placeholder = $(word_element).attr('placeholder');
    if(placeholder) {
      $(word_element).attr('placeholder', _(placeholder));
    }

    var value = $(word_element).attr('value');
    if(value) {
      $(word_element).attr('value', _(value));
    }
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

  // language dropdown
  $('#languageselect li').removeClass('active');
  $('#languageselect li.' + _('en')).addClass('active');
}

// in Chrome app - determine language on client side
if (typeof outOfChromeApp === "undefined" || !outOfChromeApp) {
  var preferredLocale;
  var makeTranslation = function(locale) {
    translations = JSON.parse(getTranslations(locale));
    doTranslations();
  };

  chrome.storage.local.get('language', function(item){
    if (!Object.keys(item).length) {
      // get language from current browser settings
      chrome.i18n.getAcceptLanguages(function (languageList) {
        preferredLocale = (languageList[0]).toLowerCase().replace("-", "_");
        makeTranslation(preferredLocale);
        initializeBook();
      });
    }
    else{
      // language setting exists
      preferredLocale = item.language;
      makeTranslation(preferredLocale);
      initializeBook();
    }
  });

  // dropdown changes language without redirecting page
  $('#languageselect li a').on('click', function(e){
    preferredLocale = $(e.target).parent().attr("class").replace("active", " ").replace(" ","");
    makeTranslation(preferredLocale);

    // store user's language preference
    chrome.storage.local.set({ 'language': preferredLocale }, function(){
      console.log('language preference set to ' + preferredLocale);
    });
  });
} else {
  doTranslations();
}
