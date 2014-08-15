$(function() {
  var frameSkip;
  var cursorStop;
  var video = $('#video')[0];
  video.play();

  $('#video')
  .on('mouseover', function() {
    $(this).attr('controls', '');
  })
  .on('mouseleave', function() {
    $(this).removeAttr('controls');
  })
  .on('mousemove', function() {
    $('#video').attr('controls', '');
    $('#video').css('cursor', '');
    if (cursorStop) {
      clearTimeout(cursorStop);
    }
    cursorStop = setTimeout(function() {
      $('#video').css('cursor', 'none');
      $('#video').removeAttr('controls');
      cursorStop = null;
    }, 1500);
  })
  .on('click', function(e) {
  })
  .on('play',function() {
    video.playing = true;
  })
  .on('pause',function() {
    video.playing = false;
  })
  ;

  $(window).on('keydown', function(e) {
    switch(e.keyCode) {
      case 37:
        if (video.paused) {
          video.currentTime -= 0.1;
        } else {
          video.currentTime -= 10;
        }
        break;
      case 38:
        video.play();
        break;
      case 39:
        if (frameSkip) {
          break;
        }
        if (video.paused) {
          video.play();
          frameSkip = setTimeout(function() {
            video.pause();
            frameSkip = null;
          }, 33);
        } else {
          video.currentTime += 15;
        }
        break;
      case 40:
        video.pause();
        break;
    }
    return false;
  });


});
