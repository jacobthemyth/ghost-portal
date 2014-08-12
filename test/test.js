var ghostPortal = require('../'),
    // request = require('supertest'),
    expect = require('expect.js');

describe('ghostPortal', function(){
  describe('processOptions', function() {
    var processOptions = ghostPortal.processOptions;

    it('should handle undefined options', function() {
      var expected = {
        google: {
          endpoint: '/auth/google',
          requiredDomains: []
        }
      };
      expect(processOptions(undefined)).to.eql(expected);
    });

    it('should handle invalid options', function() {
      var expected = {
        google: {
          endpoint: '/auth/google',
          requiredDomains: []
        }
      };
      expect(processOptions('invalid')).to.eql(expected);
    });

    it('should handle empty options', function() {
      var expected = {
        google: {
          endpoint: '/auth/google',
          requiredDomains: []
        }
      };
      expect(processOptions({})).to.eql(expected);
    });

    it('should handle valid options', function() {
      var input = {
        google: {
          requiredDomains: ['jacobsmith.io']
        }
      };
      var expected = {
        google: {
          endpoint: '/auth/google',
          requiredDomains: ['jacobsmith.io']
        }
      };
      expect(processOptions(input)).to.eql(expected);
    });
  });


});
