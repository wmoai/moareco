var pxpm = 4;
var dHour = 12;
var utime = new Date().getTime();
utime = utime - (utime % (3600 * 1000));
var baseDate = new Date(utime);
var loading = false;


var Channel = React.createClass({displayName: "Channel",
  propTypes: {
    sid: React.PropTypes.number,
    startTime: React.PropTypes.number
  },
  getInitialState: function() {
    return {
      programs: []
    }
  },
  componentDidMount: function() {
    var self = this;
    $.ajax({
      url: '/program/service',
      data: {
        sid : this.props.sid,
        start : this.props.startTime,
        end : dHour * 3600 * 1000 + this.props.startTime
      }
    }).done(function(data, textStatus, jqXHR) {
      self.setState({
        programs: data.concat(self.state.programs)
      });
    });
  },
  render: function() {
    return (
      React.createElement("div", {className: "channel", style: {height:'1000px'}}, 
        this.state.programs.map(function(program) {
          var style = {
            'height': program.duration / (60 * 1000) * pxpm,
            'top': (program.start - this.props.startTime) / (60 * 1000) * pxpm
          };
          return (
            React.createElement("a", {href: "/program/"+program._id, className: "program", style: style}, 
              React.createElement("div", {className: "title"}, program.title), 
              React.createElement("div", {className: "detail"}, program.detail)
            )
          )
        })
      )
    );
  }
});

var TimeBar = React.createClass({displayName: "TimeBar",
  getInitialState: function() {
    return {};
  },
  render: function() {
    return (
      React.createElement("div", {id: "hour"}, 
        React.createElement("div", null)
      )
    );
  }
});

var Programs = React.createClass({displayName: "Programs",
  getInitialState: function() {
    return {
      startTime: new Date().getTime()
    };
  },
  render: function() {
    return (
      React.createElement("div", {id: "programs"}, 
        React.createElement(Channel, {sid: "1024", startTime: this.state.startTime})
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

