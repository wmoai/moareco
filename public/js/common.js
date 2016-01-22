$(function() {
  // search bar
  $('#search').on('submit', function() {
    window.location = $(this).attr('action') + $(this).find('input[name=word]').val();
    return false;
  });

  // reserve deleting video
  $('.deleteVideo').on('submit', function() {
    var confirm = '_confirm';
    var form = $(this);
    if (form.hasClass(confirm)) {
      return true;
    } else {
      var message = '「'+$(this).data('title') + '」を削除予約します';
      alertify.confirm(message, function (e) {
        if (e) {
          form
          .addClass(confirm)
          .trigger('submit');
        }
      });
      return false;
    }
  });

  $('#delete-list').on('submit', function() {
    var confirm = '_confirm';
    var form = $(this);
    if (form.hasClass(confirm)) {
      return true;
    } else {
      var message = 'この一覧の全ビデオを削除予約します';
      alertify.confirm(message, function (e) {
        if (e) {
          form
          .addClass(confirm)
          .trigger('submit');
        }
      });
      return false;
    }
  });
});
