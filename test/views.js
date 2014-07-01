var assert = require('chai').assert;
var request = require('supertest');
var app = require('../app');

describe('GET /', function(){
  it('should return the homepage', function(done){
    request(app)
      .get('/')
      .expect(200)
      .end(function(err, res){
        assert.include(res.text, 'iLoominate');
        done();
      });
  });

  it('should return the editor', function(done){
    request(app)
      .get('/edit')
      .expect(200)
      .end(function(err, res){
        assert.include(res.text, 'Drop in an Image');
        done();
      });
  });

  it('should return Spanish translation when requested', function(done){
    request(app)
      .get('/edit?language=es')
      .expect(200)
      .end(function(err, res){
        assert.include(res.text, 'Escriba la primera página');
        done();
      });
  });

  it('should return first language of accept-language header', function(done){
    request(app)
      .get('/edit')
      .set('accept-language', 'es_UY')
      .expect(200)
      .end(function(err, res){
        assert.include(res.text, 'Escriba la primera página');
        done();
      });
  });

  var cookieAgent = request.agent(app);

  it('should set language cookie', function(done){
    cookieAgent
      .get('/edit?language=es')
      .expect(200)
      .expect('set-cookie', 'language=es;')
      .end(function(err, res){
        done();
      });
  });

  it('should use language cookie', function(done){
    cookieAgent
      .get('/edit')
      .expect(200)
      .end(function(err, res){
        assert.include(res.text, 'Escriba la primera página');
        done();
      });
  });
});
