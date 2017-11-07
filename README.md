# express-middleware-file-routes
A lightning fast middleware for [express](https://www.npmjs.com/package/express) to transform a folder structure into an API.

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Github Issues][issues-image]][issues-url]
[![License][license-image]][license-url]

## How does it work?
By looking in a folder (default: **/routes**) - API routes are created based on the file structure.

A folder or a file would create the same structure like so:

```/home.js -> /home```
and
```/home/index.js -> /home```

## Get started
### Installation
```
npm install express-middleware-file-routes
```

### Basic Setup
```javascript
const express = require('express');
const fileBasedApi = require('express-middleware-file-routes');

// load express
const app = express();

// this would point the root of your server to the api middleware
// accessible via /{your}/{path}
app.use(fileBasedAPI());

// it can also be mounted under a sub path like so:
// accessible via /api/{your}/{path}
app.use('/api', fileBasedAPI());

// boot your app on locahost:3000
app.listen(3000);
```

### Defining your first controller
Inside your **/routes** folder - create a file called **index.js**
```javascript
module.exports = {

    get: (req, res) => {
        res.json('You succeeded!');
    },

    post: (req, res) => {
        res.json('A post has been made, your highness');
    }

};
```
You should now be able to navigate to **localhost:3000** in your browser and see the *"You succeeded!"* message.

Likewise, a post to the same route should give you the *"A post has been made, your highness"* message.

### Advanced usage
Since the express router is very powerful, you could utilize that power for some fun magic.

For example - putting a file (or folder) name within parentheses **/home/(whatHome).js** would create a dynamic parameter just like express would with the **/home/:whatHome** syntax.

Suppose this being your **(whatHome).js** file:
```javascript
module.exports = {

    get: (req, res) => {
        res.json(req.params);
    }

};
```
Accessing **localhost:3000/home/my-awesome-home** would go through the above controller and return this message:
```json
{
    "whatHome": "my-awesome-home"
}
```

## Options
Options can be passed into the constructor like so:
```javascript
app.use(fileBasedAPI({
    optionName: 'value'
}));
```

### beforeSetupRoute
*(this hook will run before mounting each and every route found)*

**optionName**: *beforeSetupRoute*

**type**: ```callable(route, controller)```

**defaultValue**: ```(void)```


### rootFile
*(name of the file that defines the root state **/** of a folder - defaults to **index**(.js))*

**optionName**: *rootFile*

**type**: ```{string}```

**defaultValue**: ```'index'```


### routes
*(path to the directory where routes are located)*

**optionName**: *routes*

**type**: ```string```

**defaultValue**: ```'/routes'```


### unsupportedMethodHandler
*(fallback handler when no specific handler **POST|GET|..** is found on a route)*

**optionName**: *routes*

**type**: ```callable(req, res)```

**defaultValue**: ```Returns status code 405 (method not supported)```


## License
Copyright (c) 2017 Anton Netterwall

Available under the MIT license. See the LICENSE file for more info.


[downloads-image]: https://img.shields.io/npm/dt/express-middleware-file-routes.svg
[downloads-url]: https://npmjs.org/package/express-middleware-file-routes
[issues-image]: https://img.shields.io/github/issues-raw/woobione/express-middleware-file-routes.svg
[issues-url]: https://github.com/woobione/express-middleware-file-routes
[license-image]: https://img.shields.io/github/license/woobione/express-middleware-file-routes.svg
[license-url]: http://opensource.org/licenses/ISC
[npm-image]: https://img.shields.io/npm/v/express-middleware-file-routes.svg
[npm-url]: https://npmjs.org/package/express-middleware-file-routes