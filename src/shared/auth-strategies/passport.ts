import path from "path";
import passport from "passport";
const GoogleStrategy = require('passport-google-oauth20').Strategy;

import {
	GOOGLE_AUTH_ID,
	GOOGLE_AUTH_SECRET,
	GOOGLE_CALLBACK_URL
} from '../../util/secrets';


console.log("==> Callback URl ", GOOGLE_CALLBACK_URL)

/**************************************************************************************************
 *  Configure the Google strategy for use by Passport.js.
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

		console.info("***** Google Access Token      ")
		console.info(accessToken);
		console.info(refreshToken)
		console.info(profile)	

		done(null, {});	

	}) 
);  

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});