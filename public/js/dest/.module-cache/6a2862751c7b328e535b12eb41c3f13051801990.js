
var Programs = React.createClass({displayName: "Programs",
  render: function() {
    return (
      React.createElement("div", {id: "programs"}
      )
    );
  }
});



window.onload = function() {
  React.render(
    React.createElement("div", null, "hello"),
    document.getElementById('container')
  );
}
