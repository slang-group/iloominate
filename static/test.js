// highlight unknown letters and words with jQuery.antihighlight
var highlighter;
$(document).ready(function () {
  if (typeof outOfChromeApp === "undefined" || !outOfChromeApp) {
    $("textarea").width(650).height(100);
  }

  // activate antihighlight
  highlighter = $("textarea").antihighlight({
    words: ['hello', 'world', 'नेपाल'],
    letters: ['abcdefghijklmnopqrstuvw'],
    caseSensitive: false
  });

  // multilingual input with jQuery.IME
  $("textarea").ime();
});

// CSRF token
var csrf_token = $('#csrf').val();

// store page content
var pages = [{ text: "", image: null }];
var current_page = 0;
var current_image = null;

function saveCurrentPage(callback) {
  var page_text = $("textarea").val();
  pages[current_page].text = page_text;
  $($(".page-list p")[current_page]).text(page_text.substring(0,18));

  if(current_image){
    pages[current_page].image = current_image;
    var img = new Image();
    img.onload = function(){
      pages[current_page].image_width = img.width;
      pages[current_page].image_height = img.height;
      img = null;
      callback();
    };
    img.src = current_image;
  }
  else{
    callback();
  }
}

function setCurrentPage(p) {
  saveCurrentPage(function(){
    current_page = p;
    current_image = pages[p].image;

    $(".page-list a").removeClass("active");
    $($(".page-list a")[p]).addClass("active");

    // set text and highlighting
    $("textarea").val(pages[p].text);
    $("textarea").trigger("input");

    // read page
    if(current_image){
      // set up image on page
      $(".filedrop")
        .removeClass("bordered")
        .html("");

      $(".image_area")
        .addClass("fullsize")
        .css({
          "background": "-webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(0,0,0,0)), color-stop(75%,rgba(0,0,0,0)), color-stop(100%,#fff)), url(" + current_image + ")",
          "width": $("textarea").width()
        })
        .find("h4").hide();
    }
    else{
      // remove any existing image on page
      $(".filedrop")
        .addClass("bordered")
        .html("");

      $(".image_area")
        .removeClass("fullsize")
        .css({
          "background": "none",
          "width": "50%"
        })
        .find("h4").show();
    }
  });
}

// drop an image onto the page
var files, fileindex;

var blockHandler = function (e) {
  e.stopPropagation();
  e.preventDefault();
};

var processImage = function (e) {
  current_image = e.target.result;
  $(".filedrop")
    .removeClass("bordered")
    .html("");

  $(".image_area")
    .addClass("fullsize")
    .css({
      "background": "-webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(0,0,0,0)), color-stop(75%,rgba(0,0,0,0)), color-stop(100%,#fff)), url(" + current_image + ")",
      "width": $("textarea").width()
    })
    .find("h4").hide();
};

function setWhitelist (whitelist) {
  // reset existing whitelists
  var wordWhitelist = [];
  var letterWhitelist = [];
  for (var w=0; w<whitelist.length; w++) {
    var word = whitelist[w];

    // all letters in letter list?
    for(var i=0;i<word.length;i++){
      if(letterWhitelist.indexOf(word[i]) === -1){
        letterWhitelist.push(word[i]);
      }
    }

    // add to word list?
    if(wordWhitelist.indexOf(word) === -1){
      wordWhitelist.push(word);
    }
  }

  highlighter.antihighlight('setLetters', [letterWhitelist.join('')]);
  highlighter.antihighlight('setWords', wordWhitelist);

  return wordWhitelist;
}

// logged in - load word lists
if ($("#logout").length) {
  // set original list
  var menuItem = $(".user-login .dropdown-menu li");
  menuItem.find("a").on("click", function() {
    $(".dropdown-menu.wordlists li").removeClass("active");
    menuItem.addClass("active");
    setWhitelist(['hello', 'world', 'नेपाल', 'abcdefghijklmnopqrstuvw']);
  });

  // download a copy of all word lists, add to a menu
  $.getJSON("/wordlist/inteam", function (metalist) {
    $.each(metalist, function(i, list) {
      var menuItem = $("<li role='presentation'>");
      menuItem.append($("<a href='#' role='menuitem'>").text(list.name));
      $(".dropdown-menu.wordlists").append(menuItem);
      menuItem.find("a").on("click", function() {
        $(".dropdown-menu.wordlists li").removeClass("active");
        menuItem.addClass("active");
        setWhitelist(list.words);
      });
    });
  });
}

// offline - load previous word lists
if (typeof outOfChromeApp === "undefined" || !outOfChromeApp) {
  chrome.storage.local.get(null, function (items) {
    $.each(items, function(hash, list){
      // only look at word lists
      if(!list.type || list.type !== "wordlist") {
        return;
      }

      var menuItem = $("<li role='presentation'>");
      menuItem.append($("<a href='#' role='menuitem'>").text(list.name));
      $(".user-login .dropdown-menu").append(menuItem);
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
    // online - post to server
    $.post("/wordlist", {name: name, wordlist: wordlist, _csrf: csrf_token}, function(response) {
      console.log(response);
    });
  }
});

var processWhitelist = function (e) {
  var whitelist = e.target.result;
  // reduce to lowercase words separated by spaces
  whitelist = whitelist.replace(/\r?\n|\r/g, ' ').replace(/\s\s+/g, ' ').toLowerCase().split(' ');

  whitelist = setWhitelist(whitelist);

  // display and save whitelist
  $("#wordmodal .modal-body input").val("");
  $("#wordmodal .modal-body p").text(whitelist.join(" ").substring(0,500));
  $("#wordmodal").modal('show');
};

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

    var ctx = $("canvas")[0].getContext("2d");
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
      $("canvas").attr("width", 500);
      ctx.fillText(pages[p].text, 0, 40);
      var imgData = $("canvas")[0].toDataURL();
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

// book preview
function bookify() {
  saveCurrentPage(function(){

    // generate book preview
    if(rightToLeft){
      pages.reverse();
    }

    $(".book").html("");
    for(var p=0;p<pages.length;p++){
      var page = $("<div>");

      if(pages[p].image){
        var img = $("<img/>").attr("src", pages[p].image);
        page.append(img);
      }

      var content = $("<span>").text(pages[p].text);
      page.append(content);

      $(".book").append(page);
    }
    $(".book").turn({
      display: 'double',
      gradients: true,
      acceleration: true,
      elevation: 50,
      peel: 'tr',
      turnCorners: 'bl,br',
      corners: 'forward'
    });

    // show book preview
    $($(".container").children()[0]).hide();
    $(".book").removeClass("hide");

    if(rightToLeft){
      pages.reverse();
    }
  });
}
$(".bookify").on("click", bookify);

// books can be created and updated
var book_id = null;

function upload() {
  saveCurrentPage(function(){
    $.post("/book", {pages: pages, book_id: book_id, _csrf: csrf_token}, function(response) {
      // redirect to newly created or updated book
      book_id = response.id;
      window.location = "/book/" + book_id;
    });
  });
}
$(".upload").on("click", upload);

// activate existing page links
$($(".page-list").children()[0]).on("click", function() {
  setCurrentPage(0);
});

// adding a new page
$(".new-page").on("click", function() {
  // create new page listing
  pages.push({ text: "", image: null });
  var addPage = $("<a class='list-group-item' href='#'></a>");
  addPage.append($("<h4 class='list-group-item-heading'>" + _("page_num", { page: pages.length }) + "</h4>"));
  addPage.append($("<p class='list-group-item-text'></p>"));

  // insert after last page
  $($(".page-list .list-group-item")[pages.length-2]).after(addPage);

  // activate page link
  var myPageNum = pages.length-1;
  addPage.on("click", function(){
    setCurrentPage(myPageNum);
  });

  // show new page
  setCurrentPage(myPageNum);
});
