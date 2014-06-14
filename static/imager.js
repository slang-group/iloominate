// set up KineticJS stage
var stage = new Kinetic.Stage({
  container: "stage",
  width: $('.span12').width(),
  height: 500
});

var layer = new Kinetic.Layer();
stage.add(layer);

// make any image backdrop hoverable
function hoverIcon(backdrop, activate) {
  if(activate){
    backdrop.setOpacity(0.5);
    $(document.body).css({ cursor: "pointer" });
  }
  else{
    backdrop.setOpacity(0);
    $(document.body).css({ cursor: "default" });
  }
  stage.draw();
}

function addImage(png_url) {
  var png = new Image();
  png.onload = function() {
    // group of images, icons, controls
    var group = new Kinetic.Group({
      x: 20,
      y: 20,
      draggable: true,
      resizeYAdj: 0,
      resizeXAdj: 0
    });

    // highlight select icon
    var backdrop = new Kinetic.Rect({
      width: 156,
      height: 156,
      fill: "#fae",
      opacity: 0,
      x: 0,
      y: 0
    });

    // actual image
    var img = new Kinetic.Image({
      x: 0,
      y: 0,
      image: png,
      width: 156,
      height: 156
    });

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
    layer.add(group);
    stage.draw();
  };
  png.src = png_url;
}

// add new icons (just penguin for now)
$('.addicon').parent().on('click', function() {
  addImage('/images/penguin_1986.png');
});

// downloading image to desktop
function save_image() {
  var canv = $("#stage canvas")[0];
  window.location = canv.toDataURL();
}
$('.download').parent().on('click', save_image);

// start off project
addImage("/images/teacher_14016.png");
