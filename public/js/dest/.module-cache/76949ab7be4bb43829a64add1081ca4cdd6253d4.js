
var Channel = React.createClass({displayName: "Channel",
  propTypes: {
    sid: React.PropTypes.number
  },
  getInitialState: function() {
    $.get('/program/service', {
      sid : sid,
      start : startUTime,
      end : dHour * 3600 * 1000 + startUTime
    },
    function(result) {

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
    console.log(document);
    return {};
  },
  render: function() {
    return (
      React.createElement("div", {id: "programs"}, 
        "hello"
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

