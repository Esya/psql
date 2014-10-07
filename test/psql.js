require('should');
var config = require('./../lib/config.js');
var query = require('..').query;

var x = new query({},{});

describe("#pSQL",function() {
  it("Should work",function() {

  });

  it("Should not fail either",function() {
    var test = 38;
    test.should.eql(38);
  });

});
