// store page content
var pages = [{ text: [], image: [], layout: [] }];
var current_page = 0;
var current_image = null;
var twoPageOn = false;

var book = null;
var activeImage = null;

// book-browsing specific
browsing = true;
prefix = "/";

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

function addPlainPage(background, contents) {
  var pageDiv = $("<div class='plainpage'>");
  if (background.color) {
    pageDiv.css({ "background-color": background.color || "#fff" });
  }
  if (background.url) {
    pageDiv.css({ "background": "url(" + (background.url || "") + ") no-repeat" });
  }
  for (var c = 0; c < contents.length; c++) {
    if (contents[c].type === "TextArea") {
      var tbox = $("<div>").text(contents[c].text).css({
        left: contents[c].x * 4,
        top: contents[c].y * 4,
        width: contents[c].width * 3
      });
      pageDiv.append(tbox);
    } else if (contents[c].type === "Sprite") {
      var sprite = $("<img src='" + contents[c].url + "'/>").css({
        left: contents[c].x * 4,
        top: contents[c].y * 4,
        width: contents[c].width * 3
      });
      pageDiv.append(sprite);
    }
  }
  $(".page").append(pageDiv);
}

// set initial storybook
function initializeBook() {
  addPlainPage({ url: cover.url || (prefix + "images/frog_2546.png") }, [{
    type: "TextArea",
    x: 10,
    y: 30,
    width: 90,
    align: "center",
    color: "#00f",
    size: font.size || 18,
    font: font.name || "Arial",
    lineHeight: layout.lineSpace || "120%",
    text: cover.title || ""
  }]);

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
      var background = {};
      try {
        for (var t = 0; t < pages[p].layout.length; t++) {
          var t2 = t - (pages[p].text || []).length;
          var boxType = pages[p].layout[t];
          if (boxType === "top") {
            reloadPage.push(getTopText(pages[p].text[t]));
          } else if (boxType === "bottom") {
            reloadPage.push(getBottomText(pages[p].text[t]));
          } else if (boxType === "bg") {
            reloadPage.push(getFullPageText(pages[p].text[t]));
          } else if (boxType === "image_top") {
            reloadPage.push(getTopImg(pages[p].image[t2]));
          } else if (boxType === "image_bottom") {
            reloadPage.push(getBottomImg(pages[p].image[t2]));
          } else if (boxType === "image_bg") {
            background = {
              color: "#c8c8c8",
              url: pages[p].image[t2] || (prefix + "images/blank.png")
            };
          }
        }
      } catch (e) {
        console.log(e);
      }
      addPlainPage(background, reloadPage);
    }
  }

  // apply text style
  $(".plainpage div").css({
    "font-family": font.name,
    "font-size": font.size + 'pt',
    "line-height": layout.lineSpace + "pt"
  });
}

initializeBook();
