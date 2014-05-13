// PDF export
function pdfify(){
  var ctx = $("canvas")[0].getContext("2d");
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#000";

  var doc = new jsPDF();

  if(rightToLeft){
    pages.reverse();
  }

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

  if(rightToLeft){
    pages.reverse();
  }

  doc.save('Test.pdf');
}

$(".pdfify").on("click", pdfify);

// book preview
function bookify(){
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

var current_page = 0;

function setCurrentPage(p){  
  current_page = p;

  $(".page-list a").removeClass("active");
  $($(".page-list a")[p]).addClass("active");
  
  // set text and highlighting
  $("p").text(pages[p].text);

  // set image
  if(pages[p].image){
    $(".filedrop img").attr("src", pages[p].image);
  }
  else{
    $(".filedrop img").attr("src", "");
  }
}

// activate existing page links
$.each($(".page-list").children(), function(p, page_link){
  if(p==0){
    $(page_link).addClass("active");
  }
  $(page_link).on("click", function(){
    setCurrentPage(p);
  });
});