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

// don't let user remove all text placement options
$(".pagetext").on('change', function(e) {
  var oneChecked = false;
  $(".pagetext").each(function(i, checkbox) {
    if(checkbox.checked) {
      oneChecked = true;
    }
  });

  if (!oneChecked) {
    e.preventDefault();
    e.target.checked = true;
    return false;
  }
});

// let user select a colorable icon for the cover
$('.addicon').click(function() {
  $('#iconmodal').modal('show');
});

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

$('#iconmodal img').on('click', function(e) {
  $('#iconmodal').modal('hide');
  $('.iconurl').val(e.target.src);
});

$(".postbook").click(function(e) {
  // if the user is logged in, give them the option to save as a template
  // also possible the user is working from an existing template
  // otherwise post now
  if($('#templatemodal').length && $("#loadtemplate").val() === "") {
    $('.templatesample').text();
    $("#templatemodal").modal('show');
  } else {
    $("form").submit();
  }
});

$('#templatename').on('change blur', function() {
  // constantly update template name
  $('#templatestore').val($('#templatename').val());
});

$("#templatemodal .btn-success").click(function(e) {
  // create book and template together
  $("form").submit();
});

$("#loadtemplate").on("change", function() {
  $.getJSON("/template/" + $("#loadtemplate").val(), function(layout) {

    // set all properties from loaded template
    $("#fontName").val(layout.font.name);
    $("#fontSize").val(layout.font.size);
    $("#fontName, #fontSize").trigger('change');
    $("#lineSize").val(layout.lineSpace);

    if(layout.paperSize === "8.5x11") {
      $("#fullpage")[0].checked = true;
    } else {
      $("#halfpage")[0].checked = true;
    }

    var fromLayout = function(name) {
      $("#" + name).val(layout[name]);
    };

    fromLayout("pageWords");
    fromLayout("sentenceWords");
    fromLayout("wordSpace");

    var setCheckbox = function(id, value) {
      $("#" + id).attr("checked", value);
    };

    setCheckbox("textbg", layout.text.bg);
    setCheckbox("textbottom", layout.text.bottom);
    setCheckbox("textspan", layout.text.span);
    setCheckbox("texttop", layout.text.top);

    setCheckbox("imagebg", layout.image.bg);
    setCheckbox("imagebottom", layout.image.bottom);
    setCheckbox("imagespan", layout.image.span);
    setCheckbox("imagetop", layout.image.top);
  });
});

function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] === sParam) {
      return sParameterName[1];
    }
  }
}

if (window.location.href.indexOf("oldtemplate=") > -1) {
  // load old template
  $("#loadtemplate").val(getUrlParameter("oldtemplate"));
  $("#loadtemplate").trigger("change");
}
