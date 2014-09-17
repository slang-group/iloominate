// CSRF token
var csrf_token = $('#csrf').val();

// store page content
var pages = [{ text: [], image: [], layout: [] }];
var current_page = 0;
var current_image = null;

var book = null;
var highlighter = null;
var twoPageOn = false;
var phonicsWhitelist = [];
var activeImage = null;

if(font && font.name) {
  font.name = font.name.replace("web_", "");
} else {
  font = {
    name: "arial",
    size: 18
  };
  cover = {};
  layout = {};
}

function saveCurrentPage(callback) {
  // get cover
  if(current_page === -1) {
    if (typeof callback === 'function') {
      callback();
    }
    return;
  }

  current_page = Math.floor(current_page / 2) * 2;

  if($("#pbsLeftPage").html()) {
    // save text content from the left page (if it exists)
    pages[current_page].text = [];
    var textAreas = $("#pbsLeftPage textarea");
    textAreas.each(function (i, textArea) {
      var pageText = $(textArea).val();
      pages[current_page].text.push(pageText);
      PBS.KIDS.storybook.config.pages[current_page].content[i].text = pageText;
    });

    // save images
    pages[current_page].image = [];
    var imgs = $("#pbsLeftPage .pbsSprite");
    var img_offset = textAreas.length;
    imgs.each(function (i, img) {
      // skip the background canvas unless this page specifically styles it
      if (!i && !PBS.KIDS.storybook.config.pages[current_page].background.url) {
        img_offset--;
        return;
      }

      var imgURL = img.toDataURL();
      pages[current_page].image.push(imgURL);
      PBS.KIDS.storybook.config.pages[current_page].content[i + img_offset].url = imgURL;
    });

    var page_lister = current_page;
    var page_lister_right = current_page + 1;
    if (_("ltr") === "rtl") {
      page_lister = pages.length - page_lister - 1;
      page_lister_right = page_lister - 1;
    }

    // show a snippet of text in the left nav
    if (pages[current_page].text.length) {
      $($(".page-list p")[page_lister]).text(pages[current_page].text[0].substring(0, 19));
    }

    // save content from the right page (if it exists)
    if(pages.length > current_page + 1) {

      // update text areas from right page
      pages[current_page + 1].text = [];
      var rightTextAreas = $("#pbsRightPage textarea");
      rightTextAreas.each(function(i, textArea) {
        var pageText = $(textArea).val();
        pages[current_page + 1].text.push(pageText);
        PBS.KIDS.storybook.config.pages[current_page + 1].content[i].text = pageText;
      });

      // update images from right page
      pages[current_page + 1].image = [];
      var rightImgs = $("#pbsRightPage .pbsSprite");
      var rightImgOffset = rightTextAreas.length;
      rightImgs.each(function (i, img) {
        // skip the background canvas unless this page specifically styles it
        if (!i && !PBS.KIDS.storybook.config.pages[current_page + 1].background.url) {
          rightImgOffset--;
          return;
        }

        var imgURL = img.toDataURL();
        pages[current_page + 1].image.push(imgURL);
        PBS.KIDS.storybook.config.pages[current_page + 1].content[i + rightImgOffset].url = imgURL;
      });

      if (pages[current_page + 1].text.length) {
        $($(".page-list p")[page_lister_right]).text(pages[current_page + 1].text[0].substring(0, 19));
      }
    }
  }

  if(current_image){
    // upload image and then issue callback
  }
  else if (typeof callback === "function") {
    // nothing to async upload - make callback now
    callback();
  }
}

function makePageJumps(p, pagejumps) {
  // helps automatically move user off of the cover page
  if(pagejumps < p) {
    pagejumps += 2;
    var ev = book.addEventListener("PAGE_CHANGE", function() {
      book.removeEventListener(ev);
      if (_("ltr") === "rtl") {
        book.previousPage();
      } else {
        book.nextPage(p, pagejumps);
      }
    });
  }
}

function setCurrentPage(p, isAddingPage) {
  saveCurrentPage(function(){
    // highlight the current page in the menu
    var list_index = p;
    if (_("ltr") === "rtl") {
      // special rules for right-to-left books
      if(isAddingPage) {
        list_index = pages.length - 1;
      } else {
        list_index = pages.length - p - 1;
      }
    }
    $(".page-list a").removeClass("active");
    $($(".page-list a")[list_index]).addClass("active");

    // don't move if user requests the current two-page spread
    if(p === current_page) {
      return;
    } else if (_("ltr") === "rtl" && (p % 2) && (current_page === p - 1)) {
      return;
    }

    if(current_page > -1) {
      // regular page - use library's gotoPage function
      book.gotoPage(p);
    }
    else {
      // cover page - use callbacks
      makePageJumps(p, -1);
    }
    current_page = p;
  });
}

// drop a file onto the page
var files, fileindex;

var blockHandler = function (e) {
  e.stopPropagation();
  e.preventDefault();
};

// process an image upload
var processImage = function (e) {
  current_image = e.target.result;
};

// async: process English text and callback with phonics information
function loadPhonics(textBlurb, callback) {
  var text = textBlurb.replace(/(\r|\n)/g, " ").split(' ');
  var words = [];
  for(var w = 0; w < text.length; w++) {
    var word = text[w].replace(/\b[-.,()&$#!\[\]{}"']+\B|\B[-.,()&$#!\[\]{}"']+\b/g, "");
    if (word) {
      words.push(word);
    }
  }
  $.getJSON("/phonics?words=" + words.join(","), function (phonics) {
    if (callback && typeof callback === 'function') {
      callback(phonics);
    }
  });
}

function loadPhonicsIntoWorksheet(wordlist) {
  // add each word
  for(var word in wordlist) {
    if (wordlist.hasOwnProperty(word)) {
      // for each valid pronunciation
      for(var p = 0; p < wordlist[word].length; p++) {
        // add each syllable once
        for(var s = 0; s < wordlist[word][p].length; s++) {
          var syllable = wordlist[word][p][s];
          if (phonicsWhitelist.indexOf(syllable) === -1) {
            phonicsWhitelist.push(syllable);
          }
        }
      }
    }
  }
}

// process a word list upload
var wordWhitelist = ['', 'world', 'नेपाल', 'this', 'is', 'your', 'first', 'page'];
var letterWhitelist = ['abcdefghijklmnopqrstuvw.?!'];
loadPhonics(wordWhitelist.join(' '), loadPhonicsIntoWorksheet);

function setWhitelist (whitelist) {
  // reset existing whitelists
  wordWhitelist = [];
  letterWhitelist = [];
  for (var w=0; w<whitelist.length; w++) {
    var word = whitelist[w];

    // add all letters to letter list
    for(var i=0;i<word.length;i++){
      if(letterWhitelist.indexOf(word[i]) === -1){
        letterWhitelist.push(word[i]);
      }
    }

    // include words in word list
    if(wordWhitelist.indexOf(word) === -1){
      wordWhitelist.push(word);
    }
  }

  // update antihighlighter plugin
  if (layout.grader === 'phonics') {
    loadPhonics(wordWhitelist.join(' '), loadPhonicsIntoWorksheet);
  } else {
    letterWhitelist = [letterWhitelist.join('')];
    highlighter.antihighlight('setLetters', letterWhitelist);
    highlighter.antihighlight('setWords', wordWhitelist);
  }

  // make sure fonts have same properties, so highlights match words in textbox
  $('.highlighter').css({
    'font-family': font.name,
    'font-size': font.size + "pt",
    'line-height': layout.lineSpace + "pt"
  });

  return wordWhitelist;
}

// when online and logged in
if ($("#logout").length) {

  // set default letter and word lists
  var menuItem = $(".user-login .dropdown-menu li");
  menuItem.find("a").on("click", function() {
    $(".dropdown-menu.wordlists li").removeClass("active");
    menuItem.addClass("active");
    setWhitelist(['hello', 'world', 'नेपाल', 'abcdefghijklmnopqrstuvw.?!']);
  });

  // download a copy of all user + team word lists, add to a menu
  var wordlists_by_id = {};
  $.getJSON("/wordlist/inteam?grader=" + (layout.grader || "words"), function (metalist) {
    $.each(metalist, function(i, list) {
      var menuItem = $("<li role='presentation'>");
      menuItem.append($("<a href='#' role='menuitem'>").text(list.name));
      $(".dropdown-menu.wordlists").append(menuItem);
      menuItem.find("a").on("click", function() {
        $(".dropdown-menu.wordlists li").removeClass("active");
        menuItem.addClass("active");

        // AJAX to download the actual wordlist once selected
        if(!wordlists_by_id[list._id]) {
          $.getJSON("/wordlist/" + list._id, function(detail_list) {
            wordlists_by_id[detail_list._id] = detail_list.words;
            setWhitelist(detail_list.words);
          });
        }
        else {
          setWhitelist(wordlists_by_id[list._id]);
        }
      });
    });
  });
}

// when offline - load previous word lists from app storage
if (typeof outOfChromeApp === "undefined" || !outOfChromeApp) {
  chrome.storage.local.get(null, function (items) {
    $.each(items, function(hash, list){
      // filter storage for word lists
      if(!list.type || list.type !== "wordlist") {
        return;
      }

      var menuItem = $("<li role='presentation'>");
      menuItem.append($("<a href='#' role='menuitem'>").text(list.name));
      $(".user-login .dropdown-menu").append(menuItem);

      // make word list selectable
      menuItem.find("a").on("click", function() {
        $(".dropdown-menu.wordlists li").removeClass("active");
        menuItem.addClass("active");
        setWhitelist(list.wordlist.split(' '));
      });
    });
  });
}

// uploading a whitelist when a user presses "Save" button
$("#wordmodal .save").on("click", function() {
  var name = $("#wordmodal #wordlistname").val();
  var wordlist = $("#wordmodal p").text();

  // add to word list dropdown for logged-in users
  $(".dropdown-menu.wordlists li").removeClass("active");

  var menuItem = $("<li role='presentation' class='active'>");
  menuItem.append($("<a href='#' role='menuitem'>").text(name));
  $(".dropdown-menu.wordlists").append(menuItem);
  menuItem.find("a").on("click", function() {
    $(".dropdown-menu.wordlists li").removeClass("active");
    menuItem.addClass("active");
    setWhitelist(wordlist.split(" "));
  });

  if (typeof outOfChromeApp === "undefined" || !outOfChromeApp) {
    // save to Chrome app version of localStorage
    var hash = md5(wordlist);
    chrome.storage.local.get('wordlist_' + hash, function(item){
      if (!Object.keys(item).length) {
        // creating a new list in localStorage
        var storeVal = {};
        storeVal['wordlist_' + hash] = {type: 'wordlist', name: name, wordlist: wordlist};
        chrome.storage.local.set(storeVal, function(){
          console.log('list saved as ' + storeName);
        });
      }
      else{
        // list exists in localStorage
        return;
      }
    });

  } else {
    // online - post word list to server
    $.post("/wordlist", {name: name, wordlist: wordlist, _csrf: csrf_token, grader: (layout.grader || "words")}, function(response) {
      console.log(response);
    });
  }
});

// process a dropped file into letter and word lists
var processWhitelist = function (e) {
  var whitelist = e.target.result;
  // reduce to lowercase words separated by spaces
  whitelist = whitelist.replace(/\r?\n|\r/g, ' ').replace(/\s\s+/g, ' ').toLowerCase().split(' ');

  whitelist = setWhitelist(whitelist);

  // display and save whitelist for final approval
  $("#wordmodal .modal-body input").val("");
  $("#wordmodal .modal-body p").text(whitelist.join(" ").substring(0,500));
  $("#wordmodal").modal('show');
};


// file drop handlers
var dropFile = function (e) {
  e.stopPropagation();
  e.preventDefault();

  files = e.dataTransfer.files;
  if (files && files.length) {
    var reader = new FileReader();

    var fileType = files[0].type.toLowerCase();
    if(fileType.indexOf("image") > -1){
      // process an image
      reader.onload = processImage;
      reader.readAsDataURL(files[0]);
    }
    else{
      // process a whitelist of letters and words
      reader.onload = processWhitelist;
      reader.readAsText(files[0]);
    }
  }
};
window.addEventListener('dragenter', blockHandler, false);
window.addEventListener('dragexit', blockHandler, false);
window.addEventListener('dragover', blockHandler, false);
window.addEventListener('drop', dropFile, false);


// PDF export
function pdfify() {
  saveCurrentPage(function(){

    var ctx = $("canvas.preview")[0].getContext("2d");
    ctx.font = "20px sans-serif";
    ctx.fillStyle = "#000";

    var doc = new jsPDF();

    if(rightToLeft){
      pages.reverse();
    }

    for(var p=0; p<pages.length; p++) {
      // add user image
      var img_offset = 0;
      if(pages[p].image){
        var insert_img = pages[p].image;
        img_offset += pages[p].image_height / 8;
        var img_format = 'PNG';
        if(pages[p].image.indexOf("data:image/jpeg") === 0){
          img_format = 'JPEG';
        }
        doc.addImage(pages[p].image, img_format, 20, 40, pages[p].image_width / 8, pages[p].image_height / 8);
      }

      // add internationalized text as an image
      $("canvas.preview").attr("width", 500);
      ctx.fillText(pages[p].text, 0, 40);
      var imgData = $("canvas.preview")[0].toDataURL();
      doc.addImage(imgData, 'PNG', 20, 40 + img_offset, 125, 75);

      if(p !== pages.length - 1){
        // need next page
        doc.addPage();
      }
    }

    if(rightToLeft){
      pages.reverse();
    }

    doc.save('Test.pdf');
  });
}

$(".pdfify").on("click", pdfify);

// books can be created and updated on online site
var book_id = null;

function upload() {
  saveCurrentPage(function(){
    $.post("/book", {pages: pages, book_id: book_id, _csrf: csrf_token}, function(response) {
      // redirect to newly created or updated book
      if(!book_id || book_id !== response.id) {
        book_id = response.id;
        history.replaceState({}, "", "/edit?id=" + book_id);
      }
    });
  });
}
$(".upload").on("click", upload);

function checkPhonics(textBlurb) {
  loadPhonics(textBlurb, function(phonics) {
    var rejectWords = [];
    for (var word in phonics) {
      if (phonics.hasOwnProperty(word)) {
        var wordWorks = false;
        for (var p = 0; p < phonics[word].length; p++) {
          var pronunciationWorks = true;
          for (var s = 0; s < phonics[word][p].length; s++) {
            var syllable = phonics[word][p][s];
            if (phonicsWhitelist.indexOf(syllable) === -1) {
              // unknown phoneme - reject this pronunciation
              pronunciationWorks = false;
              break;
            }
          }
          if (pronunciationWorks) {
            // one of this word's pronunciations works - accept word
            wordWorks = true;
          }
        }
        if (!wordWorks && phonics[word].length) {
          // this word is known and it was rejected
          rejectWords.push(word);
        }
      }
    }
    if (rejectWords.length) {
      // highlight these phonics words
      highlighter.antihighlight('setReject', rejectWords);
    }
  });
}

// color changer on icons
var rgb_of = {
  "pink": [255, 105, 180],
  "red": [255, 0, 0],
  "orange": [255, 165, 0],
  "yellow": [255, 255, 0],
  "green": [0, 255, 0],
  "blue": [0, 0, 255],
  "purple": [200, 0, 200]
};

$(".color-bar span").on("click", function(e){
  var color = $(e.target).attr("class");
  var canvas = $("canvas.color-change")[0];
  var ctx = canvas.getContext('2d');
  $.each($("#iconmodal img"), function(x, img) {
    // clear canvas
    ctx.clearRect(0, 0, 164, 164);

    // draw black icon
    ctx.drawImage(img, 0, 0, 164, 164);

    // pixel replace
    var imageData = ctx.getImageData(0, 0, 164, 164);
    for (var i = 0; i < imageData.data.length; i += 4) {
      if(imageData.data[i+3]) {
        imageData.data[i] = rgb_of[color][0];
        imageData.data[i+1] = rgb_of[color][1];
        imageData.data[i+2] = rgb_of[color][2];
      }
    }
    ctx.putImageData(imageData,0,0);

    // replace icon
    img.src = canvas.toDataURL();
  });
});

// activate first page link
$($(".page-list").children()[0]).on("click", function() {
  if (_("ltr") === "rtl") {
    setCurrentPage(pages.length - 1);
  } else {
    setCurrentPage(0);
  }
});

function renderBook(GLOBAL, PBS) {

  // Create the storybook
  book = PBS.KIDS.storybook.book(GLOBAL, PBS, $(".well.page")[0], PBS.KIDS.storybook.config);

  // Load the storybook resources
  book.load();

  // wait for page to load before reactivating plugins
  book.addEventListener("PAGE_CHANGE", function () {
    current_page = book.getPage();

    // activate antihighlight
    if (layout.grader === "phonics") {
      highlighter = $("textarea").antihighlight({
        caseSensitive: false
      });
    } else {
      highlighter = $("textarea").antihighlight({
        words: wordWhitelist,
        letters: letterWhitelist,
        caseSensitive: false
      });
    }

    // match styling on antihighlight and textareas
    $('.highlighter').css({
      'font-family': font.name,
      'font-size': font.size + "pt",
      'line-height': layout.lineSpace + "pt"
    });

    // full-page and two-page text areas
    if(twoPageOn) {
      $("textarea").css({ "z-index": 999 });
      $(".antihighlight").width($("textarea").width());
    }
    $("textarea").resize();

    // multilingual input with jQuery.IME
    $("textarea").ime();

    // when user leaves the textarea, do more difficult check for phonics
    // only English words are currently in the system
    if ((_("en") === "en") && (layout.grader && layout.grader === "phonics")) {
      $("textarea").on("blur", function (e) {
        if (phonicsWhitelist && phonicsWhitelist.length) {
          var text = $(e.target).val();
          checkPhonics(text);
        }
      });
    }

    // when user leave the textarea, make sure words have good spacing
    if(layout.wordSpace) {
      if (typeof layout.wordSpace === "number") {
        var spacer = "  ";
        for (var i = 2; i < layout.wordSpace; i++) {
          spacer += " ";
        }
        layout.wordSpace = spacer;
      }
      if ((typeof layout.wordSpace === "string") && (layout.wordSpace.length > 1)) {
        $("textarea").on("blur", function (e) {
          var text = $(e.target).val();
          text = text.replace(/\s+/g, layout.wordSpace);
          $(e.target).val(text);
          // doesn't work on right page
          highlighter.antihighlight('highlight');
        });
      }
    }

    // make images clickable
    $(".pbsSprite").each(function (i, spriter) {
      $(spriter).click(function (e) {
        var canvas = e.target;
        if ($(canvas).hasClass("pbsPageCanvas")) {
          // clicked on the background canvas - is this customized?
          var pageID = $("#pbsRightPage .pbsSprite").parent().parent().attr("id");
          if (pageID === "pbsLeftPage") {
            if (!PBS.KIDS.storybook.config.pages[current_page].background.url) {
              return;
            }
          } else if (pageID === "pbsRightPage") {
            if (!PBS.KIDS.storybook.config.pages[current_page + 1].background.url) {
              return;
            }
          } else {
            // cover?
            return;
          }
        }
        $("#iconmodal").modal('show');
        $("#iconmodal .modal-body").find('img').on('click', function (e) {
          $("#iconmodal .modal-body").find('img').off();
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, 500, 250);
          ctx.drawImage(e.target, 0, 0, 300, 300);
          $("#iconmodal").modal('hide');
        });
      });
    });

    // when user leaves the textarea, save its contents
    $("textarea").on("blur", saveCurrentPage);
  });
}

function getGenericText(text) {
  return {
    type: "TextArea",
    x: 5,
    width: 95,
    align: "left",
    color: "#222",
    size: font.size || 18,
    font: font.name || "Arial",
    lineHeight: layout.lineSpace || "120%",
    text: text
  };
}

function getGenericImg() {
  return {
    type: "Sprite",
    x: 2.5,
    width: 95,
    url: "images/blank.png"
  };
}

function getTopText(text) {
  if (layout && layout.text && !layout.text.top) {
    return false;
  }
  var box = getGenericText(text);
  box.y = 0;
  return box;
}

function getBottomText(text) {
  if (layout && layout.text && !layout.text.bottom) {
    return false;
  }
  var box = getGenericText(text);
  box.y = 105;
  return box;
}

function getFullPageText(text) {
  if (layout && layout.text && !layout.text.bg) {
    return false;
  }
  var box = getGenericText(text);
  box.y = 10;
  box.height = 400;
  return box;
}

function getTwoPageText(text) {
  if (layout && layout.text && !layout.text.span) {
    return false;
  }
  var box = getGenericText(text);
  box.y = 10;
  box.width = 120;
  twoPageOn = true;
  return box;
}

function getTopImg() {
  if (layout && layout.image && !layout.image.top) {
    return false;
  }
  var box = getGenericImg();
  box.y = 0;
  return box;
}

function getBottomImg() {
  if (layout && layout.image && !layout.image.bottom) {
    return false;
  }
  var box = getGenericImg();
  box.y = 50;
  return box;
}

function getFirstBlock() {
  var text = "test";
  if (getTopText(text)) {
    return "top";
  } else if (getBottomText(text)) {
    return "bottom";
  } else if (getFullPageText(text)) {
    return "bg";
  } else if (getTwoPageText(text)) {
    return "span";
  }
}

function makeFirstPage(text) {
  text = text || _("first_page_message");
  return (getTopText(text) || getBottomText(text) || getFullPageText(text) || getTwoPageText(text));
}

// adding a new page
$(".new-page").on("click", function() {
  $("#pagemodal").modal('show');
});

function addNewPage(e) {
  // create new page in left menu
  pages.push({ text: [], image: [], layout: [] });
  var addPage = $("<a class='list-group-item' href='#'></a>");
  addPage.append($("<h4 class='list-group-item-heading'>" + _("page_num", { page: pages.length }) + "</h4>"));
  addPage.append($("<p class='list-group-item-text'></p>"));
  $($(".page-list .list-group-item")[pages.length-2]).after(addPage);

  // activate link to page in left menu
  var myPageNum = pages.length - 1;
  addPage.on("click", function(){
    var clickPageNum = myPageNum;
    if (_("ltr") === "rtl") {
      clickPageNum = pages.length - myPageNum - 1;
    }
    setCurrentPage(clickPageNum);
  });

  // rtl: flip the pages to add this page to the 'end'
  if (_("ltr") === "rtl") {
    PBS.KIDS.storybook.config.pages.reverse();
  }

  var newPageItems = [];
  var background = {};
  if (e && e.target) {
    // arriving from page modal
    $("#pagemodal .textposition").each(function(i, textPos) {
      if (textPos.checked) {
        if (textPos.name === "top") {
          newPageItems.push( getTopText(_("new_page_message")) );
          pages[pages.length-1].layout.push("top");
        } else if (textPos.name === "bottom") {
          newPageItems.push( getBottomText(_("new_page_message")) );
          pages[pages.length-1].layout.push("bottom");
        } else if (textPos.name === "bg") {
          newPageItems.push( getFullPageText(_("new_page_message")) );
          pages[pages.length-1].layout.push("bg");
        }
      }
    });
    $("#pagemodal .imgposition").each(function(i, imgPos) {
      if (imgPos.checked) {
        if (imgPos.name === "top") {
          newPageItems.push( getTopImg() );
          pages[pages.length-1].layout.push("image_top");
        } else if (imgPos.name === "bottom") {
          newPageItems.push( getBottomImg() );
          pages[pages.length-1].layout.push("image_bottom");
        } else if (imgPos.name === "bg") {
          background = {
            color: "#c8c8c8",
            url: "images/blank.png"
          };
          pages[pages.length-1].layout.push("image_bg");
        }
      }
    });
  } else {
    // triggering it directly
    if(!twoPageOn || (pages.length % 2) ) {
      newPageItems.push( makeFirstPage(_("new_page_message")) );
    }
  }

  PBS.KIDS.storybook.config.pages.push({
    background: background,
    content: newPageItems
  });

  // clear and rebuild book
  $(".page.well").html("");
  renderBook(window, PBS);

  // show cover
  // library will advance to new page once book reloads
  current_page = -1;
  setCurrentPage(myPageNum, true);
}
$("#pagemodal .save").click(addNewPage);

// set initial storybook
PBS.KIDS.storybook.config = {
	background: {
		color: "#ababab"
	},
	audio: {
		enabled: false
	},
	book: {
		font: font.name,
		direction: _("ltr"),
		startOnPage: 0,
		pageWidth: $(".well.page").width() - 50,
		pageHeight: Math.max($(".well.page").height(), 500),
		previousPageButton: {
			url: "images/prev-page-button.png",
			x: 1,
			y: 50,
			width: "50px",
			height: "50px"
		},
		nextPageButton: {
			url: "images/next-page-button.png",
			horizontalAlign: "RIGHT",
			x: 1,
			y: 50,
			width: "50px",
			height: "50px"
		},
		pageBackground: {
			color: "#fefefe"
		},
		oddPageBackground: {
			color: "#fdfdfd"
		},
		evenPageBackground: {
			color: "#f9f9f9"
		},
		pageTurnDuration: 500,
		pageSlideDuration: 200
	},
	cover: {
		background: {
			url: cover.url || "images/frog_2546.png"
		},
		content: [
      {
        type: "TextArea",
        x: 10,
        y: 30,
        width: 90,
        align: "center",
        color: "#fff",
        size: font.size || 18,
        font: font.name || "Arial",
        lineHeight: layout.lineSpace || "120%",
        text: cover.title || ""
      }
		]
	},
	pages: []
};

// restore a book edit in progress
if (load_book_id) {
  book_id = load_book_id;
}

if (load_book && load_book.length) {
  // load created book
  pages = load_book;

  // when loading a book with no pages - create first one
  if(!pages.length) {
    pages.push({ text: [_("first_page_message")], image: [], layout: [getFirstBlock()] });
  }

  for (var p = 0; p < pages.length; p++) {
    var reloadPage = [];
    for (var t = 0; t < pages[p].layout.length; t++) {
      var t2 = t - pages[p].text.length;
      var boxType = pages[p].layout[t];
      if (boxType === "top") {
        reloadPage.push(getTopText(pages[p].text[t]));
      } else if (boxType === "bottom") {
        reloadPage.push(getBottomText(pages[p].text[t]));
      } else if (boxType === "bg") {
        reloadPage.push(getFullPageText(pages[p].text[t]));
      } else if (boxType === "image_top") {
        reloadPage.push(getTopImg(pages[p].images[t2]));
      } else if (boxType === "image_bottom") {
        reloadPage.push(getBottomImg(pages[p].images[t2]));
      } else if (boxType === "image_bg") {
        reloadPage.push(getFullPageImg(pages[p].images[t2]));
      }
    }
    PBS.KIDS.storybook.config.pages.push({
      content: reloadPage
    });
  }

  $.each($(".page-list").find("a.list-group-item"), function(p, page_link) {
    if (p === 0) {
      $(page_link).addClass("active");
    }
    $(page_link).on("click", function(){
      setCurrentPage(p);
    });
  });

} else {
  // starting new book
  PBS.KIDS.storybook.config.pages.push({
    content: [makeFirstPage()]
  });
  pages[0].layout.push(getFirstBlock());
}

renderBook(window, PBS);
