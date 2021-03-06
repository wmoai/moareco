moment.lang('ja', {
  weekdaysShort: ["日","月","火","水","木","金","土"],
});

var Program = React.createClass({
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
      <a href={"/program/"+this.props.program._id} className={classString} style={this.props.style}>
        <div className="title">{this.props.program.title}</div>
        <div className="detail">{this.props.program.detail}</div>
      </a>
    );
  }
});

var Channel = React.createClass({
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
    var lastChild = this.getDOMNode().lastChild;
    if (lastChild &&
      window.innerHeight >= this.getDOMNode().lastChild.getBoundingClientRect().top) {
      this._update();
    }
  },
  _update: function() {
    if (this._updating) {
      return;
    }
    this._updating = true;
    var self = this;
    $.ajax({
      url: '/program/service',
      data: {
        sid : this.props.sid,
        start : this.state.nextMoment.valueOf(),
        end : this.state.nextMoment.add(this.props.interval, 'hours').valueOf()
      }
    }).done(function(data, textStatus, jqXHR) {
      self.setState({
        programs: self.state.programs.concat(data)
      });
      self._updating = false;
    });
  },
  render: function() {
    var self = this;
    var count = 0;
    return (
      <div className="channel">
        {this.state.programs.map(function(program) {
          var style = {
            height: program.duration / (60 * 1000) * self.props.pxpm,
            top: (program.start - self.props.startTime) / (60 * 1000) * self.props.pxpm,
            zIndex: count++ 
          };
          return <Program program={program} style={style} />
        })}
        <span>&nbsp;</span>
      </div>
    );
  }
});

var TimeBar = React.createClass({
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
      date : m.format('YYYY/MM/DD (ddd)')
    };
  },
  componentDidMount: function() {
    this._update();
    window.addEventListener('scroll', this._listen, false);
  },
  _listen: function(e) {
    var hourElem = document.elementFromPoint(20,40);
    var date = hourElem.getAttribute('data-date');
    if (date) {
      this.setState({
        date: date
      });
    }

    var lastChild = this.getDOMNode().lastChild;
    if (lastChild &&
      window.innerHeight >= this.getDOMNode().lastChild.getBoundingClientRect().top) {
      this._update();
    }
  },
  _update: function() {
    if (this._updating) {
      return;
    }
    this._updating = true;
    var hours = this.state.hours;
    for (var i=0; i<this.props.interval; i++) {
      hours.push({
        body: this.state.nextMoment.hours(),
        date: this.state.nextMoment.format('YYYY/MM/DD (ddd)')
      });
      this.state.nextMoment.add(1, 'hours');
    }
    this.setState({
      hours: hours
    });
    this._updating = false;
  },
  render: function() {
    var self = this;
    return (
      <div id="timeBar">
        <div className="date">{this.state.date}</div>
        {this.state.hours.map(function(hour) {
          return (
            <div className="hour" data-date={hour.date} style={{height: self.props.pxpm * 60}}>
              {hour.body}
            </div>
          )
        })}
      </div>
    );
  }
});

var Programs = React.createClass({
  propTypes: {
    sids: React.PropTypes.array.isRequired,
    startTime: React.PropTypes.number.isRequired,
    interval : React.PropTypes.number.isRequired,
    pxpm : React.PropTypes.number.isRequired
  },
  getInitialState: function() {
    var now = this.props.startTime;
    return {
      startTime: (now - (now % (3600 * 1000))),
      timeLine: 0 
    };
  },
  _updateTL: function() {
    var now = new Date().getTime();
    this.setState({
      timeLine: (now - this.state.startTime) / 60000 * this.props.pxpm
    });
  },
  componentDidMount: function() {
    var self = this;
    self._updateTL();
    setInterval(function() {
      self._updateTL();
    }, 30000);
  },
  render: function() {
    var self = this;
    return (
      <div id="block">
        <div id="timeline" style={{top: this.state.timeLine}}></div>
      <TimeBar startTime={this.state.startTime} pxpm={this.props.pxpm} interval={this.props.interval} />
      <div id="programs">
        {this.props.sids.map(function(sid) {
          return (
            <Channel sid={sid} startTime={self.state.startTime} pxpm={self.props.pxpm} interval={self.props.interval} />
          );
        })}
      </div>
      </div>
    );
  }
});

window.onload = function() {
  var sids = [];
  Array.prototype.forEach.call(document.querySelectorAll('#sids > input'), function(input) {
    sids.push(parseInt(input.value));
  });
  var now = new Date().getTime();
  React.render(
    <Programs startTime={now} interval={12} pxpm={4} sids={sids} />,
    document.getElementById('container')
  );
}

