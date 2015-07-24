var Program = React.createClass({displayName: "Program",
  propTypes: {
    program: React.PropTypes.object.isRequired
  },
  render: function() {
    var klass = "";
    if (this.props.program.manualReserved 
      || (this.props.program.manualReserved !== false &&  this.props.program.autoReserved)) {
      klass = ' reserved';
    }

    return (
      React.createElement("a", {href: "/program/"+this.props.program._id, className: test, style: this.props.style}, 
        React.createElement("div", {className: "title"}, this.props.program.title), 
        React.createElement("div", {className: "detail"}, this.props.program.detail)
      )
    );
  }
});

var Channel = React.createClass({displayName: "Channel",
  propTypes: {
    sid: React.PropTypes.number.isRequired,
    startTime: React.PropTypes.number.isRequired,
    pxpm : React.PropTypes.number.isRequired,
    interval : React.PropTypes.number.isRequired
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
        end : this.props.interval * 3600 * 1000 + this.props.startTime
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
      React.createElement("div", {className: "channel"}, 
        this.state.programs.map(function(program) {
          var style = {
            height: program.duration / (60 * 1000) * self.props.pxpm,
            top: (program.start - self.props.startTime) / (60 * 1000) * self.props.pxpm,
            zIndex: count++ 
          };
          return React.createElement(Program, {program: program, style: style})
        })
      )
    );
  }
});

var TimeBar = React.createClass({displayName: "TimeBar",
  propTypes: {
    startTime: React.PropTypes.number.isRequired,
    interval : React.PropTypes.number.isRequired,
    pxpm : React.PropTypes.number.isRequired
  },
  getInitialState: function() {
    var startHour = new Date(this.props.startTime).getHours();
    var hours = [];
    for (var i=0; i<this.props.interval; i++) {
      hours.push((startHour + i) % 24);
    }
    return {
      hours: hours
    };
  },
  render: function() {
    var self = this;
    return (
      React.createElement("div", {id: "hour"}, 
        this.state.hours.map(function(hour) {
          return (
            React.createElement("div", {style: {height: self.props.pxpm * 60}}, 
              hour
            )
          )
        })
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
        React.createElement(TimeBar, {startTime: this.state.startTime, pxpm: 4, interval: 12}), 
        React.createElement(Channel, {sid: 1024, startTime: this.state.startTime, pxpm: 4, interval: 12}), 
        React.createElement(Channel, {sid: 23608, startTime: this.state.startTime, pxpm: 4, interval: 12})
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

