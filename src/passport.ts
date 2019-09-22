import passport from 'passport';
import TwitterTokenStrategy from 'passport-twitter-token';
import { twitterConfig } from './twitter.config.js';

export const passportConfig = () => {
    passport.use(new TwitterTokenStrategy({
        consumerKey: twitterConfig.consumerKey,
        consumerSecret: twitterConfig.consumerSecret,
        includeEmail: true,
    },
        (token, tokenSecret, profile, done) => {
            return done(null, profile);
        }));
};
