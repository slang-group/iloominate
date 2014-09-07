// multilingual text input
$("textarea").ime();

// update font sample
$("#fontSize, #fontName").on('change select', function() {
  $("#fontSample").css({
    fontFamily: $("#fontName").val().replace("web_", ""),
    fontSize: $("#fontSize").val() + "pt"
  });
});

// don't let font become larger than line size
$("#fontSize").on('change', function() {
  var lineSize = $("#lineSize").val() * 1;
  var fontSize = $("#fontSize").val() * 1;
  if(fontSize && lineSize && fontSize > 10 && lineSize > 10 && fontSize > lineSize) {
    $("#lineSize").val(fontSize);
  }
});

// don't let line size become smaller than font
$("#lineSize").on('change', function() {
  var lineSize = $("#lineSize").val() * 1;
  var fontSize = $("#fontSize").val() * 1;
  if(fontSize && lineSize && fontSize > 10 && lineSize > 10 && lineSize < fontSize) {
    $("#fontSize").val(lineSize);
  }
});
