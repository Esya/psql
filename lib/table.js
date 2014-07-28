config = require('./config.js').render;
table = require('cli-table');
logger = require('./logger.js');
_ = require('underscore');

module.exports.render = function(jobs) {
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
}