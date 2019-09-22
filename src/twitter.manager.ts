import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as request from 'request-promise';
import { twitterConfig } from './twitter.config';

export class TwitterManager {
    public oauthVerifier = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = await request.post({
                form: { oauth_verifier: req.query.oauth_verifier },
                oauth: {
                    consumer_key: twitterConfig.consumerKey,
                    consumer_secret: twitterConfig.consumerSecret,
                    token: req.query['oauth_token'],
                },
                url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
            });
            const bodyString = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
            const parsedBody = JSON.parse(bodyString);

            req.body['oauth_token'] = parsedBody.oauth_token;
            req.body['oauth_token_secret'] = parsedBody.oauth_token_secret;
            req.body['user_id'] = parsedBody.user_id;
            next();
        } catch (err) {
            return res.status(500).send({ message: err.message });
        }
    }

    public requestToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = await request.post({
                oauth: {
                    consumer_key: twitterConfig.consumerKey,
                    consumer_secret: twitterConfig.consumerSecret,
                    oauth_callback: 'http%3A%2F%2Flocalhost%3A3000%2Ftwitter-callback',
                },
                url: 'https://api.twitter.com/oauth/request_token',
            });
            const jsonStr = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
            res.send(JSON.parse(jsonStr));
        } catch (err) {
            return res.status(500).send({ message: err.message });
        }
    }

    public getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = await request.get({
                oauth: {
                    consumer_key: twitterConfig.consumerKey,
                    consumer_secret: twitterConfig.consumerSecret,
                },
                url: 'https://api.twitter.com/1.1/users/show.json?screen_name=' + req.params.screenName,

            });
            res.send(JSON.parse(body));
        } catch (err) {
            return res.status(500).send({ message: err.message });
        }
    }

    public getFollowersList = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = await request.get({
                oauth: {
                    consumer_key: twitterConfig.consumerKey,
                    consumer_secret: twitterConfig.consumerSecret,
                },
                url: 'https://api.twitter.com/1.1/followers/list.json?screen_name=' + req.params.screenName,
            });
            res.send(JSON.parse(body));
        } catch (err) {
            return res.status(500).send({ message: err.message });
        }
    }

    public createToken = (auth) => {
        return jwt.sign({
            id: auth.id,
        }, 'my-secret',
            {
                expiresIn: 60 * 120,
            });
    }

    public generateToken = (req: Request, res: Response, next: NextFunction) => {
        req['token'] = this.createToken(req['auth']);
        return next();
    }

    public sendToken = (req: Request, res: Response, next: NextFunction) => {
        res.setHeader('x-auth-token', req['token']);
        return res.status(200).send(JSON.stringify(req.user));
    }

    public setApiToken = (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).send('User Not Authenticated');
        }
        req['auth'] = {
            id: req.user['id'],
        };
        return next();
    }
}
