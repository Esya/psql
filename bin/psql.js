#!/usr/bin/env node
var _      = require('underscore');
var config = require('./../lib/config.js');
var logger = require('./../lib/logger.js');
var table  = require('./../lib/table.js');

var argv   = require('yargs')
    .usage('Usage: $0 [query]')
    .example('$0 -g prod -g dev "SELECT User FROM mysql.user"', "Lists all users from groups prod and dev.")
    .example('$0 "SELECT VERSION()"', "Get MySQL version from all servers")
    .alias('g','group')
    .describe('g','Server group to execute the query on')
    .demand(1)
    .argv;
var queryRunner  = require('./../lib/query.js');

var targetGroups = (typeof argv.group === 'object') ? argv.group : [argv.group];

//Load config, get servers
var servers = config.servers;
var targetServers = [];
var query = argv._[0];

for (host in servers) {
  var server = servers[host];

  //If the server has a requested group
  if (_.intersection(server.groups,targetGroups).length !== 0) {
    targetServers.push(server);
  }
};

if (targetServers.length === 0) {
  logger.error("No matching server for the specified groups");
  process.exit(1);
}

logger.info("Matching servers count :",targetServers.length);
logger.debug(targetServers);

Query = new queryRunner(targetServers,query);
Query.runAll().then(function(jobs) {
  table.render(jobs);
},function(err) {
  logger.error('Failed',err,err);
});
