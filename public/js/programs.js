$(function() {
  var pxpm = 4;
  var dHour = 12;
  var utime = new Date().getTime();
  utime = utime - (utime % (3600 * 1000));
  var baseDate = new Date(utime);

  var loading = false;
  var loadPrograms = function(startUTime) {
    if (loading) {
      return;
    }
    loading = true;
    $('.channel').each(function() {
      var sid = $(this).data('sid');
      $.ajax({
        url: '/program/service',
        data: {
          sid : sid,
          start : startUTime,
          end : dHour * 3600 * 1000 + startUTime
        }
      }).done(function(data, textStatus, jqXHR) {
        var pcnt = $('.channel[data-sid='+sid+']').find('.program').size();
        for (var i=0; i<data.length; i++) {
          if ($('.program[data-eid='+data[i].eid+']').size() > 0) {
            // duplication
            continue;
          }
          var css = {
            'height': data[i].duration / (60 * 1000) * pxpm,
            'top': (data[i].start - baseDate.getTime()) / (60 * 1000) * pxpm,
            'z-index': i + pcnt
          };
          var attr = {
            'class':'program',
            'href':'/program/'+data[i].sid+'/'+data[i].eid,
            'data-eid':data[i].eid
          }
          if (data[i].manualReserved 
              || (data[i].manualReserved !== false &&  data[i].autoReserved)) {
            attr.class += ' reserved';
          }
          $('<a>', attr)
          .attr('data-count', i + pcnt)
          .css(css)
          .append($('<div>', {'class':'title'}).html(data[i].title))
          .append($('<div>', {'class':'detail'}).html(data[i].detail))
          .appendTo('.channel[data-sid='+sid+']');
        }
        loading = false;
      });
    });

    // time bar
    var startHour = new Date(startUTime).getHours();
    for (var i=0; i<dHour; i++) {
      var hour = (startHour + i) % 24;
      $('<div>', {'data-utime':startUTime+(i*3600*1000)})
      .html(hour)
      .height(60 * pxpm)
      .appendTo('#hour');
    }
  }
  loadPrograms(baseDate.getTime());

  // scroll
  $(document).on('scroll', function() {
    var scroll = $(window).scrollTop()+$(window).height();
    var lastHour = $('#hour > div:last-child');
    if (scroll > lastHour.position().top) {
      loadPrograms(lastHour.data('utime') + (3600*1000));
    }
  });

  // hover forcus
  $(document).on('mouseenter', '.program', function() {
    $(this).css({'z-index': 9999});
  });
  $(document).on('mouseleave', '.program', function() {
    $(this).css({'z-index': $(this).data('count')});
  });

  // time line
  var setNow = function() {
    var now = new Date().getTime();
    $('#timeline').css({
      top: (now - baseDate.getTime())/60000*pxpm + $('#programs').position().top ,
      width: $('#programs').width()
    });
  }
  setNow();
  setInterval(function() {
    setNow();
  }, 30000);

});


