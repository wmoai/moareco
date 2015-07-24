

var dHour = 12;

var Channel = React.createClass({displayName: "Channel",
  propTypes: {
    sid: React.PropTypes.number
  },
  getInitialState: function() {
    $.ajax({
      url: '/program/service',
      data: {
        sid : sid,
        start : new Date().getTime(),
        end : dHour * 3600 * 1000 + new Date().getTime()
      }
    }).done(function(data, textStatus, jqXHR) {

    });
  },
  render: function() {
    return (
      React.createElement("div", {id: "programs"}, 
        "hello"
      )
    );
  }
});

var Programs = React.createClass({displayName: "Programs",
  getInitialState: function() {
    return {};
  },
  render: function() {
    return (
      React.createElement("div", {id: "programs"}, 
        React.createElement(Channel, {sid: "1024"})
      )
    );
  }
});


window.onload = function() {
  React.render(
    React.createElement(Programs, null),
    document.getElementById('container')
  );
}

