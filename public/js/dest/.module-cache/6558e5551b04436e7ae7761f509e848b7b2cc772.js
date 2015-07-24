var pxpm = 4;
var dHour = 12;
var utime = new Date().getTime();
utime = utime - (utime % (3600 * 1000));
var baseDate = new Date(utime);
var loading = false;


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
    var self = this;
    var now = new Date().getTime();
    $.ajax({
      url: '/program/service',
      data: {
        sid : this.props.sid,
        start : now,
        end : dHour * 3600 * 1000 + now
      }
    }).done(function(data, textStatus, jqXHR) {
      self.setState({
        programs: data.concat(self.state.programs)
      });
    });
  },
  render: function() {
    return (
      React.createElement("div", {className: "channel"}, 
        this.state.programs.map(function(program) {
          var style = {
            'height': program.duration / (60 * 1000) * pxpm,
            'top': (program.start - baseDate.getTime()) / (60 * 1000) * pxpm,
            'z-index': 0
          };
          return (
            React.createElement("a", {className: "program"}, 
              React.createElement("div", {className: "title"}, program.title), 
              React.createElement("div", {className: "detail"}, program.detail)
            )
          )
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

