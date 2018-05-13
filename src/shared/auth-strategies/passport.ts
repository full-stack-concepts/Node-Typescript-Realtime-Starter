import path from "path";
import passport from "passport";
import passportLocal from "passport-local";
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

import { u } from "../../services";
import { IUser} from "../interfaces";

/******
 * Degine Authentication Strategies
 */
const LocalStrategy = passportLocal.Strategy;
const FacebookStrategy = passportFacebook.Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

/**************************************************************************************************
 *  Configure passport for Local Strategy
 *
 */
passport.use(new LocalStrategy({ usernameField: "email" }, ( email:string, password:string, done:Function) => {
	//#TODO Process user authentication
}));



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
  	profileFields: ["name", "email", "link", "locale", "timezone", "picture"],
  	passReqToCallback: true
}, (req: any, accessToken:any, refreshToken:any, profile:any, done:any) => {	

	u.authenticateFacebookUser({
		accessToken: accessToken,		
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


}));


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});