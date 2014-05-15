var assert = require('chai').assert;
var request = require('supertest');
var app = require('../app');

describe('GET /', function(){
  it('should return the homepage', function(done){
    request(app)
      .get('/')
      .expect(200)
      .end(function(err, res){
        assert.include(res.text, 'Drop in an Image');
        done();
      });
  });
});