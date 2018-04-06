import path from "path";
import passport from "passport";
const GoogleStrategy = require('passport-google-oauth20').Strategy;

import {
	GOOGLE_AUTH_ID,
	GOOGLE_AUTH_SECRET,
	GOOGLE_CALLBACK_URL
} from '../../util/secrets';

import { u } from "../../services/user.service";
import { IUser} from "../interfaces";


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

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});