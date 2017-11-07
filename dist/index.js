'use strict';

const express = require('express');
const path = require('path');
const { readdirSync: readDir, lstatSync: lstat, existsSync: exists } = require('fs');

/**
 * Default options
 */
const _defaultOptions = {
    beforeSetupRoute: (route, controller) => {
        // use this hook to add custom logic before accessing route
    },
    rootFile: 'index',
    routes: '/routes',
    unsupportedMethodHandler: (req, res) => {
        res.status(405).json(`Method ${req.method} not supported`);
    }
};

/**
 * Get options by merging default options
 * @param {object} options
 * @return {object} options
 */
const _getOptions = options => {
    return Object.assign({}, _defaultOptions, options);
};

/**
 * Helper function to see if a path is a file
 * @param {string} filePath 
 */
const _isFile = filePath => {
    return lstat(filePath).isFile();
};

/**
 * A router for express to load a whole folder structure into routes
 */
class FileRouter {
    /**
     * Constructor for FileRouter
     * @param {object} options
     */
    constructor(options) {
        const { routes } = this._options = _getOptions(options);
        const routesDirectory = this.resolve(routes);
        const router = this._router = express.Router();

        this.getRoutesAsPaths(routesDirectory).forEach(routePath => {
            const route = this.pathToRoute(routePath, routesDirectory);
            const controller = require(routePath);

            // run before setup hook
            this._options.beforeSetupRoute(route, controller);

            // add all found http verbs
            Object.entries(controller).forEach(([method, handler]) => {
                if (router[method]) {
                    router[method](route, handler);
                }
            });

            // gracefully handle unsupported methods
            router.all(route, this._options.unsupportedMethodHandler);
        });
    }

    /**
     * The path for the main file of the app
     * @return {string}
     */
    get basePath() {
        return path.dirname(require.main.filename);
    }

    /**
     * Get list of routes in the form of file paths
     * @param {string} routesDirectory
     * @return {array} file paths for routes
     */
    getRoutesAsPaths(routesDirectory) {
        if (!exists(routesDirectory)) {
            throw new Error(`Directory "routes" specified in ${this.constructor.name} options does not exist: ${routesDirectory}`);
        }

        return readDir(routesDirectory).reduce((paths, routePath) => {
            const absoluePath = path.join(routesDirectory, routePath);

            if (_isFile(absoluePath)) {
                paths.push(absoluePath);
            } else {
                paths.push.apply(paths, this.getRoutesAsPaths(absoluePath));
            }

            return paths;
        }, []);
    }

    /**
     * Get route definition from file path
     * @param {string} routePath
     * @param {string} routesDirectory
     * @return {string} route definition
     */
    pathToRoute(routePath, routesDirectory) {
        const { rootFile } = this._options;
        let route = routePath.slice(routesDirectory.length);

        // clean route
        route = path.normalize(route);
        route = route.replace(path.extname(route), '');

        // remove rootFile part of route
        if (route.endsWith(rootFile)) {
            route = route.slice(0, -rootFile.length);
        }

        // change (parameter) structure to :parameter
        route = route.split('(').join(':').split(')').join('');

        // normalize slashes to / on all platforms
        route = route.split(path.sep).join('/');

        return route;
    }

    /**
     * Resolve the absolute path of a file or folder
     * @param {string} unresolvedPath
     */
    resolve(unresolvedPath) {
        return path.resolve(this.basePath, unresolvedPath);
    }

    /**
     * The express router instance
     * @return {object} express.Router() instance
     */
    get router() {
        return this._router;
    }
}

/**
 * Constructs an express.Router() using a FileRouter instance
 */
class FileRouterFactory {
    /**
     * Create a new FileRouter and get the express.Router() instance
     * @param {object} options
     * @return {object} express.Router() instance
     */
    static new(options) {
        const fileRouter = new FileRouter(options);
        return fileRouter.router;
    }
}

module.exports = FileRouterFactory.new;