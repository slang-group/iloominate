// multilingual input
$("textarea").ime();

// highlight word list
$("textarea").highlightTextarea({
  words: ['hello', 'world', 'नेपाल'],
  caseSensitive: false
});

// drop an image onto the page
var files, fileindex;

var blockHandler = function(e){
  e.stopPropagation();
  e.preventDefault();
};

var processFile = function(e){
  var img_url = e.target.result;
  $(".filedrop").html("").append($("<img/>").attr("src", img_url));
  //var img = new Image();
  //img.onload = function(){
  //};
  //img.src = img_url;
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
  var ctx = $("canvas")[0].getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.rect(0, 0, 500, 300);
  ctx.fill();
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#000";
  ctx.fillText($("textarea").val(), 0, 40);

  var doc = new jsPDF();

  // add sample text
  doc.text(20, 20, "TEST UNICODE");

  // add user image
  var img_offset = 0;
  var page_img = $(".filedrop").find("img");
  if(page_img.length){
    var insert_img = $(page_img[0]);
    img_offset += insert_img.height() / 8;
    var img_format = 'PNG';
    if(insert_img.attr("src").indexOf("data:image/jpeg") === 0){
      img_format = 'JPEG';
    }
    doc.addImage(insert_img.attr("src"), img_format, 20, 40, insert_img.width() / 8, insert_img.height() / 8);
  }

  // add internationalized text as an image
  var imgData = $("canvas")[0].toDataURL();
  doc.addImage(imgData, 'PNG', 20, 40 + img_offset, 125, 75);

  //doc.addPage();
  // http://parall.ax/products/jspdf

  doc.save('Test.pdf');
}

$(".pdfify").on("click", pdfify);
