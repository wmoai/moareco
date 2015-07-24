
var Channel = React.createClass({displayName: "Channel",
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
    console.log(
      document.getElementsByName('sid')[0]    );
    var services = document.getElementsByName('sid').forEach(function(sid) {

    });
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

