$('.guide').on('click', function(){
  $('#guidemodal').modal('show');
});

$.each($('.pickcharacter a'), function(i, character){
  $(character).on('click', function(){
    var name = $(character).text();

    // character name fill
    var prefix = false;
    if(name[0] === name[0].toLowerCase()){
      prefix = true;
    }
    $('#maincharacter').val(prefix ? "a " + name : name);
    $('span.aboutcharacter').text(prefix ? "the " + name : name);

    // name selection UI
    $('.pickcharacter a').css({ "font-weight": "normal" })
    $(character).css({ "font-weight": "bold" });
  });
});

$('#guidemodal .next').on('click', function(){
  var steps = $('#guidemodal .form-group');
  for(var s = 0; s < steps.length; s++){
    if(!$(steps[s]).hasClass('hide')){
      // active step
      $(steps[s]).addClass('hide');
      if(s + 1 == steps.length){
        // end of steps - reset
        $('#guidemodal').modal('hide');
        $('#guidemodal .form-group').addClass('hide');
        $($('#guidemodal .form-group')[0]).removeClass('hide');

        // show text
        $('.page textarea').val('This is ' + $('#maincharacter').val() + '. ' + $('#aboutcharacter').val());
      }
      else{
        // next step
        $(steps[s+1]).removeClass('hide');
      }
      break;
    }
  }
});
