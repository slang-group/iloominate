var characterList = [];
var aboutList = [];
var factList = [];
var stepMode = null;

$('.guide').on('click', function(){
  $('#guidemodal').modal('show');
});


function loadCharacter(i){
  $('span.aboutcharacter').text(aboutList[i]);
}

$.each($('.pickcharacter a'), function(i, character){
  $(character).on('click', function(){
    // name selection UI
    if($(character).css("font-weight") === "bold"){
      $(character).css({ "font-weight": "normal" });
    }
    else{
      $(character).css({ "font-weight": "bold" });
    }

    // character name list
    var allCharacters = $('.pickcharacter a');
    characterList = [];
    aboutList = [];
    for(var i = 0; i < allCharacters.length; i++){
      if($(allCharacters[i]).css("font-weight") !== "bold"){
        // not selected
        continue;
      }

      var prefix = false;
      var name = $(allCharacters[i]).text();
      if(name[0] === name[0].toLowerCase()){
        prefix = true;
      }
      characterList.push(prefix ? "a " + name : name);
      aboutList.push(prefix ? "the " + name : name);
    }
    if(characterList.length){
      $('#maincharacter').val(characterList.join(' and '));
      $('span.aboutcharacter').text(aboutList[0]);
    }
  });
});

$('#guidemodal .next').on('click', function(){
  var steps = $('#guidemodal .form-group');
  for(var s = 0; s < steps.length; s++){
    if(!$(steps[s]).hasClass('hide')){
      // found active step

      // get facts about each character until you run out of characters
      if(s === 0 && characterList.length > 1){
        // get facts about each character
        stepMode = 0;
      }
      if(stepMode >= characterList.length - 1){
        // no more characters to load
        factList.push($('#aboutcharacter').val());
        $('#aboutcharacter').val('');
        stepMode = null;
      }
      if(s === 1 && stepMode !== null){
        factList.push($('#aboutcharacter').val());
        $('#aboutcharacter').val('');
        stepMode++;
        loadCharacter(stepMode);
      }

      else if(s + 1 === steps.length){
        // end of steps - reset
        $('#guidemodal').modal('hide');
        $('#guidemodal .form-group').addClass('hide');
        $($('#guidemodal .form-group')[0]).removeClass('hide');

        // make all pages
        $('.page textarea').val('This is ' + $('#maincharacter').val() + '.');
        for(var f = 0; f < factList.length; f++){
          $(".page-list .new-page").trigger('click');
          $('.page textarea').val(aboutList[f][0].toUpperCase() + aboutList[f].substring(1) + ' is ' + factList[f] + '.');
        }
        setCurrentPage(0);
      }
      else{
        // next step
        $(steps[s]).addClass('hide');
        $(steps[s+1]).removeClass('hide');
      }

      break;
    }
  }
});
