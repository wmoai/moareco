$(function() {
  var pxph = 4;
  var dHour = 6;
  var utime = 1390644100000;
  utime = utime - (utime % (3600 * 1000));
  var date = new Date(utime);
  // get programs
  $.ajax({
    url: '/programs',
    data: {
      start : utime,
      end : dHour * 3600 * 1000 + utime
    }
  }).done(function(data, textStatus, jqXHR) {
    for (var i=0; i<data.length; i++) {
      // console.log(data[i].duration / 60);
      // console.log((data[i].start - utime) / 30000);
      var css = {
        'height': data[i].duration / (60 * 1000) * pxph,
        'top': (data[i].start - utime) / (60 * 1000) * pxph,
        'z-index': i
      };
      $('<a>', {'class':'program', 'href':'/program/'+data[i].eid})
      .attr('data-count', i)
      .css(css)
      .append($('<div>', {'class':'title'}).html(data[i].title))
      .append($('<div>', {'class':'detail'}).html(data[i].detail))
      .appendTo('.channel');
    }
  });

  // hover forcus
  $(document).on('mouseenter', '.program', function() {
    $(this).css({'z-index': 9999});
  });
  $(document).on('mouseleave', '.program', function() {
    $(this).css({'z-index': $(this).data('count')});
  });

  // time bar
  var baseHour = date.getHours();
  for (var i=0; i<dHour; i++) {
    var hour = (baseHour + i) % 24;
    $('<div>')
    .html(hour)
    .height(60 * pxph)
    .appendTo('.hour');
  }

});


