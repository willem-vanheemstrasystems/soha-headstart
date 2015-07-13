/*
* CORE server
*
*/
/**
* Module dependencies.
*/
var tacitServer = require('tacit-server');
/*
* CONFIGS - The Configurations
*/
config = require('../configs/server.js');
var configs = config.configs,
server_prefix = configs.server_prefix || 'CORE';
tacitServer.setConfigs(configs);
/*
* ROUTER - The Router
*/
var router = require('../routers/router.js');
tacitServer.setRouter(router);
/*
* ROUTES - The Routes
*/
var routes = tacitServer.routes = require('../routes'); // it seems that we have to start each required file as its own var
/*
* SERVICES - The Services
*/
var services = tacitServer.services = require('../routes/services'); // it seems that we have to start each required file as its own var
var testService = tacitServer.testService = require('../services/test');
/*
* LISTEN
*/
tacitServer.listen();
