# koa-cas


## Quick start


```
'use strict';

var koa = require('koa');
var session = require('koa-generic-session');
var bodyParser = require('koa-bodyparser');
var cas = require('koa-cas');


var app = koa();

app.keys = ['keys', 'keykeys'];
app.use(bodyParser());
app.use(session());
app.use(cas({
    login:'http://sso.com/cas/login'
    validate:'http://sso.com/cas/validate'
    logoutRequest:[10.8.11.7]
    }));

app.use(function*() {
    this.body ='helloworld'
});

app.listen(3000);

```


## Licence

MIT. Copyright (c) 2015 by Zhixin li

