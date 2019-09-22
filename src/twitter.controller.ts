import { Router } from 'express';
import passport from 'passport';
import { TwitterManager } from './twitter.manager';

export class TwitterController {

    public router: Router;

    constructor() {
        this.router = Router();
        this.configRoutes();
    }

    public configRoutes() {
        const twitterManger = new TwitterManager();
        this.router.post('/auth/twitter/reverse', twitterManger.requestToken);
        this.router.route('/auth/twitter').post(twitterManger.oauthVerifier,
            passport.authenticate('twitter-token', { session: false }), twitterManger.setApiToken,
            twitterManger.generateToken, twitterManger.sendToken);
        this.router.route('/getUserDetails/:screenName').get(twitterManger.getUserDetails);
        this.router.route('/getFollwersList/:screenName').get(twitterManger.getFollowersList);
    }

}
