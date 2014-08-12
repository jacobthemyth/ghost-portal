var url = require('url'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy,
    jade = require('jade'),
    _ = require('underscore');

module.exports = function ghostPortal(options) {
  var config = processOptions(options);

  return function(req, res, next) {
    configurePassport(req, res, config);

    passport.initialize()(req, res, function() {

      passport.session()(req, res, function() {

        var route = url.parse(req.url).pathname;

        switch (route) {
          case config.google.endpoint :
            passport.authenticate('google')(req, res, next);
            break;
          case config.google.endpoint + '/return' :
            passport.authenticate('google')(req, res, function() {
              res.redirect('/');
            });
            break;
          default:
            if (req.user) {
              next()
            } else {
              renderGhostPortal(req, res, config);
            }
        } // switch

      }); //passport.session

    }); // passport.initialize

  };
};

function renderGhostPortal(req, res, config) {
  var locals = {
    strategies: [
      {name: "Google", url: config.google.endpoint}
    ]
  };
  res.end(jade.renderFile(__dirname + '/views/portal.jade', locals));
}

function configurePassport(req, res, config) {
  passport.use(new GoogleStrategy({
      returnURL: 'http://' + req.headers.host + config.google.endpoint + '/return',
      realm: 'http://' + req.headers.host + '/'
    },
    function(identifier, profile, done) {
      process.nextTick(function() {
        // var tiy = checkForTIY(profile);
        // done(!tiy.length ? "not a TIY email" : null, profile.emails[0].value);
        var email = validEmailFromGoogleProfile(profile, config.google.requiredDomains);
        if (email) {
          done(null, email);
        } else {
          done("Invalid email: " + email);
        }
      });
    }
  ));

  passport.serializeUser(function(user, done) {
      done(null, user);
  });
  passport.deserializeUser(function(obj, done) {
      done(null, obj);
  });
}

function validEmailFromGoogleProfile(profile, domains) {
  return _.chain(profile.emails)
           .pluck('value')
           .find(function(email) {
              var domain = (email.match(/@(.+)$/) || []).pop();
              return _.contains(domains, domain);
           })
           .value()
};

function processOptions(options) {
  var result = {};

  var defaults = {
    google: {
      endpoint: '/auth/google',
      requiredDomains: []
    }
  }

  if (_.isObject(options)) {
    _.extend(result, options);
  }

  _.each(defaults, function(config, strategy) {
    result[strategy] = _.extend(config, result[strategy])
  });

  return result;
}
module.exports.processOptions = processOptions;
