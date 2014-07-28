var config = require('./config.js').render;
var table = require('cli-table');
var logger = require('./logger.js');
var _ = require('underscore');
var md5 = require('MD5');
var colors = require('colors');
require('buffer');

Render = function() {
  this.servers = [];
  this.rowsPerHash = {};
  this.wrap = require('wordwrap').hard(60);
}

Render.prototype.render = function(jobs) {
  //First pass, hashing all rows
  for (var i = 0; i < jobs.length; i++) {
    this.servers[i] = jobs[i].value.server;
    this.servers[i].columns = _.keys(jobs[i].value.results[0]);

    results = jobs[i].value.results;

    for (var j = 0; j < results.length; j++) {
      var hash = md5(JSON.stringify(results[j]));
      if(typeof this.rowsPerHash[hash] === 'undefined') {
        this.rowsPerHash[hash] = {
          row: _.values(results[j]),
          servers: [i]
        }
      } else {
        this.rowsPerHash[hash].servers.push(i);
      }
    };
  };

  //Group by servers
  var rows = _.toArray(this.rowsPerHash);
  rows = _.groupBy(rows,function(obj) {
    return obj.servers;
  });


  //Get the keys and sort by highest number of servers
  var serverKeys = _.sortBy(_.keys(rows),function(key) {
    return -rows[key][0].servers.length;
  });

  for (var i = 0; i < serverKeys.length; i++) {
    var key = serverKeys[i];
    var groupRows = rows[key];
    var columns = this.servers[groupRows[0].servers[0]].columns;
    var servers = groupRows[0].servers;

    //Building header
    var header = [];
    for (var j = 0; j < servers.length; j++) {
      header.push(this.servers[servers[j]].user+"@"+this.servers[servers[j]].host);
    };
    console.log(header.join(', ').white.bold,'\n');

    Table = new table({
      head: columns,
      chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
         , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
         , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
         , 'right': '║' , 'right-mid': '╢' , 'middle': '│' },
      style: {
        border: ['white']
      }
    });

    for (var j = 0; j < groupRows.length; j++) {
      groupRows[j].row = _.map(groupRows[j].row,function(val) {
        val = val instanceof Buffer ? '<Binary>' : val;
        val = val === null ? '' : wordwrap(val,60,"\n",true);
        return val;
      },this);
      Table.push(groupRows[j].row);
    };

    console.log(Table.toString(),'\n');
  };
}

module.exports = new Render();

function wordwrap( str, width, brk, cut ) {

    brk = brk || '\n';
    width = width || 75;
    cut = cut || false;

    if (!str) { return str; }

    var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');

    return str.match( RegExp(regex, 'g') ).join( brk );

}
/*module.exports.render = function(jobs) {
  try {
    var keys = _.keys(jobs[0].value.results[0]);
    var unified = true;

    //Check if all jobs have the same keys, and if all succeeded
    for (var i = 1; i < jobs.length; i++) {
      var job = jobs[i];
      var success = (jobs.state === 'fulfilled');

      if(success) {
        var jobKeys = _.keys(job.value.results[0]);
        unified = (unified && _.difference(jobKeys,keys).length === 0)
      }
    }

    if(unified) {
      keys.unshift("Server");
    }

    Table = new table({
      head: keys,
      chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
         , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
         , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
         , 'right': '║' , 'right-mid': '╢' , 'middle': '│' },
      style: {
        border: ['white']
      }
    });

    for (var i = 0; i < jobs.length; i++) {
      var job = jobs[i];

      for (var j = 0; j < job.value.results.length; j++) {
        var values = _.values(job.value.results[j]);
        values = _.map(values, function(val){ return val === null ? '' : val; });
        values.unshift(job.value.server.user+"@"+job.value.server.host);
        Table.push(values);
      };
    };

    console.log(Table.toString());
  } catch(e) {
    logger.error('Could not display results',e,e,e.stack);
  }
}*/