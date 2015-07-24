
var Channel = React.createClass({displayName: "Channel",
  propTypes: {
    sid: React.PropTypes.number
  },
  getInitialState: function() {
    console.log(1);
    $.get('/program/service', {
      sid : sid,
      start : startUTime,
      end : dHour * 3600 * 1000 + startUTime
    },
    function(result) {
      console.log(result);
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

