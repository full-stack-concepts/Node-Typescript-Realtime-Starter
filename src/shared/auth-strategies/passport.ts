import path from "path";
import passport from "passport";
import passportFacebook from "passport-facebook";

/******
 * Import Authenticatoin Settings
 */
import {
	ENABLE_GOOGLE_AUTHENTICATION,
	GOOGLE_AUTH_ID,
	GOOGLE_AUTH_SECRET,
	GOOGLE_CALLBACK_URL,
	ENABLE_FACEBOOK_AUTHENTICATION,
	FACEBOOK_ID, 
	FACEBOOK_SECRET,
	FACEBOOK_CALLBACK_URL
} from '../../util/secrets';

import { u } from "../../services/user.service";
import { IUser} from "../interfaces";

/******
 * Degine Authentication Strategies
 */
const FacebookStrategy = passportFacebook.Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;


/**************************************************************************************************
 *  Configure the Google strategy for usage with Passport.js.
 *
 *	OAuth 2-based strategies require a `verify` function which receives the
 *	credential (`accessToken`) for accessing the Google API on the user's behalf,
 *	along with the user's profile. The function must invoke `cb` with a user
 *	object, which will be set at `req.user` in route handlers after authentication.
 *
 */
passport.use(new GoogleStrategy({
	clientID: GOOGLE_AUTH_ID,
	clientSecret: GOOGLE_AUTH_SECRET,
	callbackURL: GOOGLE_CALLBACK_URL,
	accessType: 'offline',
	proxy:true
}, (accessToken:any, refreshToken:any, profile:any, done:Function) => {	

		u.authenticateGoogleUser({
			accessToken: accessToken,
			refreshToken: refreshToken,
			profile: profile
		},

		(err:any, user:any) => {		

			/**** 
			 * After done is exexuted passport passes control back to <UserRouter>
			 */
			if(err) {
				done(err, user );
			} else {
				done(null, user );
			}			
		});		
	}) 
);  

/**************************************************************************************************
 *  Configure the Facebook strategy for usage with Passport.js.
 * To implement Facebook Login with the following steps:
 *
 * (1) Enter Your Redirect URL to take people to your successful-login page.
 * (2) Check the login status to see if someone's already logged into your app. During this step, you should also check to see if someone has previously logged into your app, but is not currently logged in.
 * (3) Log people in, either with the login button or with the login dialog, and ask for a set of data permissions.
 * (4) Log people out to allow them to exit from your app.
 */

passport.use( new FacebookStrategy({
	clientID: FACEBOOK_ID,
  	clientSecret: FACEBOOK_SECRET,
  	callbackURL: FACEBOOK_CALLBACK_URL,
  	profileFields: ["name", "email", "link", "locale", "timezone"],
  	passReqToCallback: true
}, (req: any, accessToken:any, refreshToken:any, profile:any, done:any) => {

	console.log(accessToken, profile)


}));


/**
 * Sign in with Facebook.
 */
 /*
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ["name", "email", "link", "locale", "timezone"],
  passReqToCallback: true
}, (req: any, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    User.findOne({ facebook: profile.id }, (err, existingUser) => {
      if (err) { return done(err); }
      if (existingUser) {
        req.flash("errors", { msg: "There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account." });
        done(err);
      } else {
        User.findById(req.user.id, (err, user: any) => {
          if (err) { return done(err); }
          user.facebook = profile.id;
          user.tokens.push({ kind: "facebook", accessToken });
          user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
          user.save((err: Error) => {
            req.flash("info", { msg: "Facebook account has been linked." });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ facebook: profile.id }, (err, existingUser) => {
      if (err) { return done(err); }
      if (existingUser) {
        return done(undefined, existingUser);
      }
      User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
        if (err) { return done(err); }
        if (existingEmailUser) {
          req.flash("errors", { msg: "There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings." });
          done(err);
        } else {
          const user: any = new User();
          user.email = profile._json.email;
          user.facebook = profile.id;
          user.tokens.push({ kind: "facebook", accessToken });
          user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
          user.profile.gender = profile._json.gender;
          user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
          user.profile.location = (profile._json.location) ? profile._json.location.name : "";
          user.save((err: Error) => {
            done(err, user);
          });
        }
      });
    });
  }
}));
*/





passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});