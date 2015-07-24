var Program = React.createClass({displayName: "Program",
  propTypes: {
    pid: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired
  },
  render: function() {
    return (
      React.createElement("a", {href: "/program/"+this.props.pid, className: "program"}, 
        React.createElement("div", {className: "title"}, this.props.title), 
        React.createElement("div", {className: "detail"}, this.props.children)
      )
    );
  }
});


var Channel = React.createClass({displayName: "Channel",
  propTypes: {
    sid: React.PropTypes.number.isRequired,
    startTime: React.PropTypes.number.isRequired,
    pxpm : React.PropTypes.number.isRequired,
    dHour : React.PropTypes.number.isRequired
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
        end : this.props.dHour * 3600 * 1000 + this.props.startTime
      }
    }).done(function(data, textStatus, jqXHR) {
      self.setState({
        programs: data.concat(self.state.programs)
      });
    });
  },
  render: function() {
    var self = this;
    var count = 0;
    return (
      React.createElement("div", {className: "channel", style: {height:'1000px'}}, 
        this.state.programs.map(function(program) {
          var style = {
            height: program.duration / (60 * 1000) * self.props.pxpm,
            top: (program.start - self.props.startTime) / (60 * 1000) * self.props.pxpm,
            zIndex: count++ 
          };
          return React.createElement(Program, {pid: program._id, title: program.title}, program.detail)
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
    var now = new Date().getTime();
    return {
      startTime: (now - (now % (3600 * 1000)))
    };
  },
  test: function(e) {

  },
  render: function() {
    return (
      React.createElement("div", {id: "programs"}, 
        React.createElement(Channel, {sid: 1024, startTime: this.state.startTime, pxpm: 4, dHour: 12}), 
        React.createElement(Channel, {sid: 23608, startTime: this.state.startTime, pxpm: 4, dHour: 12})
      )
    );
  }
});

window.onload = function() {
  // window.addEventListener('scroll', test, false);
  React.render(
    React.createElement(Programs, null),
    document.getElementById('container')
  );
}

