
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
  getIniticalState: function() {
    console.log(1);
    console.log(document.getElementsByName('sid'));
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

