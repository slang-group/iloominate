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

// books can be created and updated on online site
var book_id = null;

function renderBook(GLOBAL, PBS) {

  // Create the storybook
  book = PBS.KIDS.storybook.book(GLOBAL, PBS, $(".well.page")[0], PBS.KIDS.storybook.config);

  // Load the storybook resources
  book.load();

  // wait for page to load before reactivating plugins
  book.addEventListener("PAGE_CHANGE", function () {
    current_page = book.getPage();

    // full-page and two-page text areas
    if(twoPageOn) {
      $("textarea").css({ "z-index": 999 });
      $(".antihighlight").width($("textarea").width());
    }
    $("textarea").resize();
  });
}

// set initial storybook
function initializeBook() {
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
        url: prefix + "images/prev-page-button.png",
        x: 1,
        y: 50,
        width: "50px",
        height: "50px"
      },
      nextPageButton: {
        url: prefix + "images/next-page-button.png",
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
        url: cover.url || (prefix + "images/frog_2546.png")
      },
      content: [
        {
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
      PBS.KIDS.storybook.config.pages.push({
        background: background,
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
}

initializeBook();
