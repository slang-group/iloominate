// highlight word list with jQuery.highlighttextarea
$(document).ready(function(){
  if(typeof outOfChromeApp == "undefined" || !outOfChromeApp){
    $("textarea").width(650).height(100);
  }

  $("textarea").highlightTextarea({
    words: ['hello', 'world', 'नेपाल'],
    letters: ['q'],
    caseSensitive: false
  });
  
  // multilingual input with jQuery.IME
  $("textarea").ime();
});

// make translations with Polyglot.js
var polyglot, _;

// in Chrome app - determine language on client side
if(typeof outOfChromeApp == "undefined" || !outOfChromeApp){
  chrome.i18n.getAcceptLanguages(function(languageList){
    var preferredLocale = (languageList[0]).toLowerCase().replace("-","_");
    // check if there is a match for the complete locale (e.g., es_uy)
    if(!allTranslations[preferredLocale]){
      // check if there is a match for the root locale (es_uy -> es)
      preferredLocale = preferredLocale.split("_")[0];
      if(!allTranslations[preferredLocale]){
        // default (en)
        preferredLocale = "en";
      }
    }
    translations = allTranslations[preferredLocale];
    doTranslations();
  });
}
else{
  doTranslations();
}

function doTranslations(){
  polyglot = new Polyglot({ phrases: translations });
  _ = function(word, vars){
    return polyglot.t(word, vars);
  };

  // translate words already on the page
  var translateWords = $(".translate");
  $.each(translateWords, function(w, word_element){
    var word = $(word_element).text();
    $(word_element).text( _(word) );
  });
  
  // check for right-to-left languages (including Arabic)
  // text inputs should have dir="auto" already set
  if(_("ltr") == "rtl"){
    $("body").addClass("rtl");
  }
}

// drop an image onto the page
var files, fileindex;

var blockHandler = function(e){
  e.stopPropagation();
  e.preventDefault();
};

var processFile = function(e){
  var img_url = e.target.result;
  $(".filedrop").removeClass("bordered").html("").append($("<img/>").attr("src", img_url));
};

var dropFile = function(e){
  e.stopPropagation();
  e.preventDefault();

  files = e.dataTransfer.files;
  if(files && files.length){
    var reader = new FileReader();
    reader.onload = processFile;
    reader.readAsDataURL(files[0]);
  }
};
window.addEventListener('dragenter', blockHandler, false);
window.addEventListener('dragexit', blockHandler, false);
window.addEventListener('dragover', blockHandler, false);
window.addEventListener('drop', dropFile, false);


// PDF export
function pdfify(){
  saveCurrentPage();

  var ctx = $("canvas")[0].getContext("2d");
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#000";

  var doc = new jsPDF();

  for(var p=0;p<pages.length;p++){
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

    if(p != pages.length - 1){
      // need next page
      doc.addPage();
    }
  }

  doc.save('Test.pdf');
}

$(".pdfify").on("click", pdfify);

// book preview
function bookify(){
  saveCurrentPage();

  // generate book preview
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
}
$(".bookify").on("click", bookify);

// store page content
var pages = [{ text: "", image: null }];
var current_page = 0;

function saveCurrentPage(){
  var page_text = $("textarea").val();
  pages[current_page].text = page_text;
  $($(".page-list p")[current_page]).text(page_text.substring(0,18));

  if($(".filedrop img").attr("src")){
    pages[current_page].image = $(".filedrop img").attr("src");
    pages[current_page].image_width = $(".filedrop img").width();
    pages[current_page].image_height = $(".filedrop img").height();    
  }
}

function setCurrentPage(p){
  saveCurrentPage();
  
  current_page = p;

  $(".page-list a").removeClass("active");
  $($(".page-list a")[p]).addClass("active");
  
  // set text and highlighting
  $("textarea").val(pages[p].text);
  $("textarea").trigger("input");

  // set image
  if(pages[p].image){
    $(".filedrop img").attr("src", pages[p].image);
  }
  else{
    $(".filedrop img").attr("src", "");
  }
}

// activate existing page links
$($(".page-list").children()[0]).on("click", function(){
  setCurrentPage(0);
});

// adding a new page
$(".new-page").on("click", function(){  
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