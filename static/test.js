// page UI
$("textarea").ime();

function pdfify(){
  var ctx = $("canvas")[0].getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.rect(0, 0, 500, 300);
  ctx.fill();
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#000";
  ctx.fillText($("textarea").val(), 0, 40);

  var doc = new jsPDF();
  doc.text(20, 20, "TEST UNICODE");
  
  var imgData = $("canvas")[0].toDataURL();
  doc.addImage(imgData, 'PNG', 20, 40, 125, 75);
  
  //doc.addPage();
  // http://parall.ax/products/jspdf
  
  doc.save('Test.pdf');
}

$("button").on("click", pdfify);