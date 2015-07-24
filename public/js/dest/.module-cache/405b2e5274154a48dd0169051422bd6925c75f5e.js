var Program = React.createClass({displayName: "Program",
  propTypes: {
    program: React.PropTypes.object.isRequired
  },
  render: function() {
    var classString = 'program';
    if (this.props.program.manualReserved 
      || (this.props.program.manualReserved !== false &&  this.props.program.autoReserved)) {
      classString += ' reserved';
    }
    return (
      React.createElement("a", {href: "/program/"+this.props.program._id, className: classString, style: this.props.style}, 
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
      nextMoment: moment(this.props.startTime),
      programs: []
    }
  },
  componentDidMount: function() {
    window.addEventListener('scroll', this._listen, false);
    this._update();
  },
  _listen: function(e) {
    if (window.innerHeight
      >= this.getDOMNode().lastChild.getBoundingClientRect().top) {
      this._update();
    }
  },
  _update: function() {
    if (this._updating) {
      return;
    }
    this._updating = true;
    var m = this.state.nextMoment;
    var self = this;
    $.ajax({
      url: '/program/service',
      data: {
        sid : this.props.sid,
        start : m.valueOf(),
        end : m.add(this.props.interval, 'hours').valueOf()
      }
    }).done(function(data, textStatus, jqXHR) {
      self.setState({
        nextMoment: m,
        programs: self.state.programs.concat(data),
        updating: false
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
    var m = moment(this.props.startTime);
    return {
      nextMoment : m,
      hours: [],
      updating: false
    };
  },
  componentDidMount: function() {
    window.addEventListener('scroll', this._listen, false);
    this._update();
  },
  _listen: function(e) {
    if (window.innerHeight
      >= this.getDOMNode().lastChild.getBoundingClientRect().top) {
      this._update();
    }
  },
  _update: function() {
    if (this.state.updating) {
      return;
    }
    this.setState({
      updating: true
    });
    var hours = this.state.hours;
    var m = this.state.nextMoment;
    for (var i=0; i<this.props.interval; i++) {
      hours.push({
        body: m.hours() 
      });
      m.add(1, 'hours');
    }
    this.setState({
        nextMoment : m,
        hours: hours,
        updating: false
    });
  },
  render: function() {
    var self = this;
    return (
      React.createElement("div", {id: "hour"}, 
        this.state.hours.map(function(hour) {
          return (
            React.createElement("div", {style: {height: self.props.pxpm * 60}}, 
              hour.body
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
  React.render(
    React.createElement(Programs, null),
    document.getElementById('container')
  );
}

