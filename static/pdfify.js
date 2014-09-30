// PDF export

var img_height = 100;
var img_width = 165;
var img_format;

function imgData(url, callback) {
  if (url.indexOf("data:image/") === 0) {
    if (callback) {
      callback(url);
    }
    return url;
  } else {
    $("canvas.preview").attr("width", 500);
    var canvas = $("canvas.preview")[0];
    var ctx = canvas.getContext("2d");
    var i = new Image();
    i.onload = function() {
      ctx.drawImage(i, 0, 0, 400, 300);
      callback(canvas.toDataURL());
    };
    i.src = url.replace('http://res.cloudinary.com/', '/proxyimage/');
    return canvas.toDataURL();
  }
}

// bulk of PDF paging
function resumePages(doc, ctx) {
  // write title and finish cover
  var cover = PBS.KIDS.storybook.config.cover;
  doc.setFontSize(30);
  ctx.font = "30px sans-serif";
  ctx.fillStyle = "#33f";
  ctx.fillText(cover.title, 10, 10);

  // set generic text
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#000";
  doc.setFontSize(20);

  var pdfPages = PBS.KIDS.storybook.config.pages.slice(0);

  // left-to-right fix
  if(_("ltr") === "rtl") {
    pdfPages.reverse();
  }

  var pdfifyContent = function(p, c) {
    // finish when at end of book
    if (p >= pdfPages.length) {
      doc.save('book.pdf');
      return;
    }
    // advance when at end of page
    if (c >= pdfPages[p].content.length) {
      return pdfifyContent(p + 1, -1);
    }

    // before any content is added to a page: check for background
    if (c === -1) {
      doc.addPage();
      if (pdfPages[p].background.url) {
        img_format = 'PNG';
        if ((pdfPages[p].background.url.indexOf("jpeg") > -1) || (pdfPages[p].background.url.indexOf("jpg") > -1)) {
          img_format = 'JPEG';
        }
        return imgData(pdfPages[p].background.url, function(backgroundData) {
          doc.addImage(backgroundData, img_format, 5, 5, img_width, img_height);
          pdfifyContent(p, 0);
        });
      }
      return pdfifyContent(p, 0);
    }

    var content = pdfPages[p].content[c];

    if(content.type === "Sprite"){

      img_format = 'PNG';
      if(content.url.indexOf("jpeg") > -1 || content.url.indexOf("jpg") > -1) {
        img_format = 'JPEG';
      }
      return imgData(content.url, function(imgContent) {
        doc.addImage(imgContent, img_format, content.x + 5, (content.y * 2) + 5, img_width, img_height);
        pdfifyContent(p, c + 1);
      });

    } else if (content.type === "TextArea") {

      // add internationalized text as an image
      if (_("en") === "en") {
        doc.text(content.x, content.y + 100, content.text);
      } else {
        $("canvas.preview").attr("width", 500);
        ctx.fillText(content.text, 0, 40);
        var textAsImage = $("canvas.preview")[0].toDataURL();
        doc.addImage(textAsImage, 'PNG', content.x, (content.y * 2), 125, 75);
      }
      return pdfifyContent(p, c + 1);
    }
  };

  // start on background of zero-eth page
  pdfifyContent(0, -1);
}

function pdfify() {
  saveCurrentPage(function(){

    var doc = new jsPDF();
    var ctx = $("canvas.preview")[0].getContext("2d");

    // add cover
    var cover = PBS.KIDS.storybook.config.cover;
    if (cover.background.url) {
      img_format = 'PNG';
      if ((cover.background.url.indexOf("jpeg") > -1) || (cover.background.url.indexOf("jpg") > -1)) {
        img_format = 'JPEG';
      }
      return imgData(cover.background.url, function(coverData) {
        doc.addImage(coverData, img_format, 5, 5, img_width, img_height);
        resumePages(doc, ctx);
      });
    } else {
      resumePages(doc, ctx);
    }
  });
}

$(".pdfify").on("click", pdfify);
