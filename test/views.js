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
  
  it('should return Spanish translation when requested', function(done){
    request(app)
      .get('/?language=es')
      .expect(200)
      .end(function(err, res){
        console.log(res);
        assert.include(res.text, 'Escriba la primera página');
        done();
      });
  });
  
  it('should return first language of accept-language header', function(done){
    request(app)
      .get('/')
      .set('accept-language', 'es_UY')
      .expect(200)
      .end(function(err, res){
        console.log(res);
        assert.include(res.text, 'Escriba la primera página');
        done();
      });
  });
});