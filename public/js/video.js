var timeout;
$(function() {
  $('#video')
  .on('mouseover', function() {
    $(this).attr('controls', '');
  })
  .on('mouseleave', function() {
    $(this).removeAttr('controls');
  })
  ;
  $(window).on('keydown', function(e) {
    var video = $('#video')[0];
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
        if (timeout) {
          break;
        }
        if (video.paused) {
          video.play();
          timeout = setTimeout(function() {
            video.pause();
            timeout = null;
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
