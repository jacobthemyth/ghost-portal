var url = require('url'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    jade = require('jade'),
    _ = require('underscore');

module.exports = function ghostPortal(options) {
  var config = processOptions(options);

  return function(req, res, next) {
    configurePassport(req, res, config);

    passport.initialize()(req, res, function() {

      passport.session()(req, res, function() {

        var currentRoute = url.parse(req.url).pathname;
        var authRoute = url.parse(config.google.authURL).pathname;
        var callbackRoute = url.parse(config.google.callbackURL).pathname;

        switch (currentRoute) {
          case authRoute :
            passport.authenticate('google')(req, res, next);
            break;
          case callbackRoute :
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
      {name: "Google", url: config.google.authURL}
    ]
  };
  res.end(jade.renderFile(__dirname + '/views/portal.jade', locals));
}

function configurePassport(req, res, config) {
  passport.use(new GoogleStrategy({
      scope: 'https://www.googleapis.com/auth/userinfo.email',
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      process.nextTick(function() {
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
  if( ! options.google )
    throw new Error("options must include a 'google' key");

  if( ! options.google.clientID )
    throw new Error("options must include a 'google.clientID' key");

  if( ! options.google.clientSecret )
    throw new Error("options must include a 'google.clientSecret' key");

  if( ! options.google.authURL)
    throw new Error("options must include a 'google.authURL' key");

  if( ! options.google.callbackURL)
    throw new Error("options must include a 'google.callbackURL' key");

  if( ! options.google.requiredDomains )
    throw new Error("options must include a 'google.requiredDomains' key");

  return options;
}

module.exports.processOptions = processOptions;
