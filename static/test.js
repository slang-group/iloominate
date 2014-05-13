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

// store page content
var pages = [{ text: "", image: null }];
var current_page = 0;

function saveCurrentPage() {
  var page_text = $("textarea").val();
  pages[current_page].text = page_text;
  $($(".page-list p")[current_page]).text(page_text.substring(0,18));

  if($(".filedrop img").attr("src")){
    pages[current_page].image = $(".filedrop img").attr("src");
    pages[current_page].image_width = $(".filedrop img").width();
    pages[current_page].image_height = $(".filedrop img").height();    
  }
}

function setCurrentPage(p) {
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

// drop an image onto the page
var files, fileindex;

var blockHandler = function (e) {
  e.stopPropagation();
  e.preventDefault();
};

var processImage = function (e) {
  var img_url = e.target.result;
  $(".filedrop").removeClass("bordered").html("").append($("<img/>").attr("src", img_url));
};

var processWhitelist = function (e) {
  var whitelist = e.target.result;
  // reduce to lowercase words separated by spaces
  whitelist = whitelist.replace(/\r?\n|\r/g, ' ').replace(/\s\s+/g, ' ').toLowerCase().split(' ');

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
  saveCurrentPage();

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
}

$(".pdfify").on("click", pdfify);

// book preview
function bookify() {
  saveCurrentPage();

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
}
$(".bookify").on("click", bookify);

// books can be created and updated
var book_id = null;

function upload() {
  saveCurrentPage();
  $.post("/book", {pages: pages, book_id: book_id }, function(response) {
    // redirect to newly created or updated book
    book_id = response.id;
    window.location = "/book/" + book_id;
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