

var dHour = 12;

var Channel = React.createClass({displayName: "Channel",
  propTypes: {
    sid: React.PropTypes.number
  },
  getInitialState: function() {
    return {
      programs: []
    }
  },
  componentDidMount: function() {
    // var now = new Date().getTime();
    // $.ajax({
      // url: '/program/service',
      // data: {
        // sid : this.props.sid,
        // start : now,
        // end : dHour * 3600 * 1000 + now
      // }
    // }).done(function(data, textStatus, jqXHR) {
      // this.setState({
        // programs: data.concat(this.state.programs)
      // });
    // });
    this.setState({
      programs: [
        {id: 123},
        {id: 345}
      ]
    })
  },
  render: function() {
    return (
      React.createElement("div", {className: "channel"}, 
        this.state.programs.map(function(program) {
          return React.createElement("div", {className: "program"}, program.id);
        })
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

