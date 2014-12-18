// get basic text and image blocks

var browsing = false;

function getGenericText(text) {
  return {
    type: "TextArea",
    x: 5,
    width: 95,
    align: "left",
    color: "#222",
    size: font.size || 18,
    font: font.name || "Arial",
    lineHeight: layout.lineSpace || "120%",
    text: text
  };
}

function getGenericImg(filename) {
  return {
    type: "Sprite",
    x: 2.5,
    width: 95,
    url: filename || (prefix + "images/blank.png")
  };
}

function getTopText(text) {
  if (layout && layout.text && !layout.text.top) {
    return false;
  }
  var box = getGenericText(text);
  box.y = 0;
  return box;
}

function getBottomText(text) {
  if (layout && layout.text && !layout.text.bottom) {
    return false;
  }
  var box = getGenericText(text);
  if (browsing) {
    box.y = 55;
  } else {
    box.y = 55;
  }
  return box;
}

function getFullPageText(text) {
  if (layout && layout.text && !layout.text.bg) {
    return false;
  }
  var box = getGenericText(text);
  box.y = 10;
  box.height = 400;
  return box;
}

function getTwoPageText(text) {
  if (layout && layout.text && !layout.text.span) {
    return false;
  }
  var box = getGenericText(text);
  box.y = 10;
  box.width = 120;
  twoPageOn = true;
  return box;
}

function getTopImg(filename) {
  if (layout && layout.image && !layout.image.top) {
    return false;
  }
  var box = getGenericImg(filename);
  box.y = 0;
  return box;
}

function getBottomImg(filename) {
  if (layout && layout.image && !layout.image.bottom) {
    return false;
  }
  var box = getGenericImg(filename);
  box.y = 50;
  return box;
}

function getFirstBlock() {
  var text = "test";
  if (getTopText(text)) {
    return "top";
  } else if (getBottomText(text)) {
    return "bottom";
  } else if (getFullPageText(text)) {
    return "bg";
  } else if (getTwoPageText(text)) {
    return "span";
  }
}

function makeFirstPage(text) {
  text = text || _("first_page_message");
  return (getTopText(text) || getBottomText(text) || getFullPageText(text) || getTwoPageText(text));
}
