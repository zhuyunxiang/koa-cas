'use strict';


var xml = require('pixl-xml');
var fetch = require('node-fetch');

module.exports = function cas(opts) {

    opts = opts || {};
    let login = opts.login || 'http://sso.byd.com.cn/cas/login';
    let validate = opts.validate || 'http://sso.byd.com.cn/cas/validate';
    let logoutRequest = (typeof opts.logoutRequest === 'string' ? [opts.logoutRequest] : opts.logoutRequest) || ['10.8.11.7'];

    return function*(next) {

        //valid is login
        if (this.session === null || (yield this.sessionStore.get(this.session.ticket)) === null) {
            this.response.redirect(login + '?service=http://' + this.request.host);
        }

        //check ticket
        if (this.query.ticket !== undefined) {
            let user = yield fetch(validate + '?ticket=' + this.query.ticket + '&service=' + this.request.protocol + '://' + this.request.host)
                .then(function(res) {
                    return res.text();
                }).then(function(body) {
                    let lines = body.split('\n');
                    if (lines[0] === 'no') {
                        return false;
                    } else if (lines[0] === 'yes' && lines.length >= 2) {
                        return lines[1];
                    }
                });
            if (user === false) {
                this.response.redirect(login + '?service=' + this.request.protocol + '://' + this.request.host);
            } else {
                this.session.ticket = this.query.ticket;
                this.session.user = user;
                yield this.sessionStore.set(this.query.ticket, this.session);
            }
        }

        //handle logout
        if (this.request.method === 'POST' && logoutRequest.indexOf(this.request.ip) > -1) {
            yield this.sessionStore.destroy(xml.parse(this.request.body.logoutRequest)['samlp:SessionIndex']);
            this.session = null;
        }

        yield next;

    }
};
