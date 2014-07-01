// CSRF token
var csrf_token = $('#csrf').val();

// set up KineticJS stage
var stage = new Kinetic.Stage({
  container: "stage",
  width: $('.span12').width(),
  height: 500
});

var layer = new Kinetic.Layer();
stage.add(layer);

var fluff = [];

// make any image backdrop hoverable
function hoverIcon(backdrop, activate) {
  if(activate){
    backdrop.setFill("#fae");
    $(document.body).css({ cursor: "pointer" });
  }
  else{
    backdrop.setFill("transparent");
    $(document.body).css({ cursor: "default" });
  }
  stage.draw();
}

function addAnchorBehaviors(anchor, group) {
  fluff.push(anchor);

  var update = function(group, activeAnchor) {
    var topLeft = group.get(".topLeft")[0];
    var topRight = group.get(".topRight")[0];
    var bottomLeft = group.get(".bottomLeft")[0];
    var bottomRight = group.get(".bottomRight")[0];

    var anchorBox = group.get(".backdrop")[0];

    // update anchor positions
    switch (activeAnchor.getName()) {
      case "topLeft":
        topRight.setPosition({ y: topLeft.attrs.y });
        bottomLeft.setPosition({ x: topLeft.attrs.x });
        break;
      case "topRight":
        topLeft.setPosition({ y: activeAnchor.attrs.y });
        bottomRight.setPosition({ x: activeAnchor.attrs.x });
        break;
      case "bottomLeft":
        bottomRight.setPosition({ y: activeAnchor.attrs.y });
        topLeft.setPosition({ x: activeAnchor.attrs.x });
        break;
      case "bottomRight":
        bottomLeft.setPosition({ y: activeAnchor.attrs.y });
        topRight.setPosition({ x: activeAnchor.attrs.x });
        break;
    }

    var width = topRight.attrs.x - topLeft.attrs.x;
    var height = bottomLeft.attrs.y - topLeft.attrs.y;

    var image = group.get(".image")[0];
    image.setSize({ width: width - 34, height: height - 34 });

    // set the position of each image based on anchor drag
    image.setPosition({ x: topLeft.attrs.x + 10, y: topLeft.attrs.y + 10 });

    // also move and make the anchorBox bigger to fix new image size
    anchorBox.setSize({ width: width, height: height });
    anchorBox.setPosition({ x: topLeft.attrs.x, y: topLeft.attrs.y });
  };

  anchor.on("mousedown touchstart", function() {
    group.setDraggable(false);
    this.moveToTop();
    layer.draw();
  });
  anchor.on("dragmove", function() {
    update(group, this);
    layer.draw();
  });
  anchor.on("dragend", function() {
    group.setDraggable(true);
    layer.draw();
  });

  // add hover styling
  anchor.on("mouseover", function() {
    var layer = this.getLayer();
    document.body.style.cursor = this.attrs.cursor;
    this.setStrokeWidth(3);
    layer.draw();
  });
  anchor.on("mouseout", function() {
    var layer = this.getLayer();
    document.body.style.cursor = "default";
    this.setStrokeWidth(1);
  });
}

function addImage(png_url, pos, scale) {
  var png = new Image();

  var position = pos || { x: 20, y: 20 };
  var size = scale || { width: 156, height: 156 };

  png.onload = function() {
    // group of images, icons, controls
    var group = new Kinetic.Group({
      x: position.x,
      y: position.y,
      draggable: true,
      resizeYAdj: 0,
      resizeXAdj: 0
    });

    // highlight select icon
    var backdrop = new Kinetic.Rect({
      width: size.width + 34,
      height: size.height + 34,
      fill: "transparent",
      name: "backdrop",
      opacity: 0.5,
      x: -17,
      y: -17,
      stroke: "#ccc",
      strokeWidth: 2,
      lineCap: "round",
      lineJoin: "round"
    });
    fluff.push(backdrop);

    // actual image
    var img = new Kinetic.Image({
      x: 0,
      y: 0,
      name: "image",
      image: png,
      width: size.width,
      height: size.height
    });

    // resize boxes
    var anchorTopLeft = new Kinetic.Rect({
      x: -19,
      y: -19,
      width: 4,
      height: 4,
      fill: "#000",
      name: "topLeft",
      draggable: true,
      cursor: "nw-resize"
    });
    var anchorTopRight = new Kinetic.Rect({
      x: img.getWidth() + 17,
      y: -19,
      width: 4,
      height: 4,
      fill: "#000",
      name: "topRight",
      draggable: true,
      cursor: "ne-resize"
    });
    var anchorBottomLeft = new Kinetic.Rect({
      x: -19,
      y: img.getHeight() + 17,
      width: 4,
      height: 4,
      fill: "#000",
      name: "bottomLeft",
      draggable: true,
      cursor: "sw-resize"
    });
    var anchorBottomRight = new Kinetic.Rect({
      x: img.getWidth() + 17,
      y: img.getHeight() + 17,
      width: 4,
      height: 4,
      fill: "#000",
      name: "bottomRight",
      draggable: true,
      cursor: "se-resize"
    });

    addAnchorBehaviors(anchorTopLeft, group);
    addAnchorBehaviors(anchorTopRight, group);
    addAnchorBehaviors(anchorBottomLeft, group);
    addAnchorBehaviors(anchorBottomRight, group);

    // show selected image
    img.on("mouseover", function() {
      hoverIcon(backdrop, true);
    });
    img.on("mouseout", function() {
      hoverIcon(backdrop, false);
    });

    // add to KineticJS
    group.add(backdrop);
    group.add(img);
    group.add(anchorTopLeft);
    group.add(anchorTopRight);
    group.add(anchorBottomLeft);
    group.add(anchorBottomRight);

    layer.add(group);
    stage.draw();
  };
  png.src = png_url;
}

// add new icons from modal
$('.addicon').parent().on('click', function() {
  $('#addmodal').modal('show');
});
$('#addmodal img').on('click', function(e) {
  $('#addmodal').modal('hide');
  addImage(e.target.src);
});

// uploading image to account
function upload_image() {
  // hide anchors and backdrops
  for(var f = 0; f < fluff.length; f++) {
    fluff[f].setOpacity(0);
  }
  stage.draw();

  // save image to cloud
  var canv = $("#stage canvas")[0];
  var canvURL = canv.toDataURL();
  image_id = image.id || "";
  var children = layer.getChildren();
  var icons = [];
  for(var i = 0; i < children.length; i++) {
    var icon_img = children[i].getChildren()[1].attrs.image.src.split('/');
    icon_img = icon_img[icon_img.length-1];
    icons.push({
      pos: children[i].getPosition(),
      size: children[i].getChildren()[1].getSize(),
      url: icon_img
    });
  }

  $.post("/image", {_csrf: csrf_token, id: image_id, src: canvURL, icons: icons}, function(response) {
    console.log(response);
    if(response.err) {
      alert('Upload failed');
    }
    else {
      image_id = response.image_id;
      history.pushState(null, null, '/image/' + image_id);
      alert('Saved');
    }
  });
}
$('.upload').parent().on('click', upload_image);

// downloading image to desktop
function save_image() {
  // hide anchors and backdrops
  for(var f = 0; f < fluff.length; f++) {
    fluff[f].setOpacity(0);
  }
  stage.draw();

  var canv = $("#stage canvas")[0];
  window.location = canv.toDataURL();
}
$('.download').parent().on('click', save_image);

if(image.icons && image.icons.length) {
  // load the existing project
  for(var i = 0; i < image.icons.length; i++) {
    var load_image = image.icons[i];
    addImage('/images/' + (load_image.url || 'teacher_14016.png'), load_image.pos, load_image.size);
  }
}
else {
  // start a project
  addImage("/images/teacher_14016.png");
}
