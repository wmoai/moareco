$(function() {
  // search bar
  $('#search').on('submit', function() {
    window.location = $(this).attr('action') + $(this).find('input[name=word]').val();
    return false;
  });


});
