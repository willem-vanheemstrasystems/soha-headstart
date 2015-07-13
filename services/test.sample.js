/*
 * Test service
 */
var config = require('../configs/server.js');
var configs = config.configs,
    server_prefix = configs.server_prefix || 'CORE';
console.log(server_prefix + " - Test service required.");
/*
 * Test Read and Write Service.
 */
/********************************************************************************************
 * TEST READ
 *********************************************************************************************/
exports.read = function(req, res) {
	res.header("Access-Control-Allow-Origin", "*"); // to allow cross-domain, replace * with a list of domains is desired.
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS'); // ExtJS will sent out OPTIONS
	res.header('Content-Type', 'application/json');
    res.send({ read: 'ok'});
}

/********************************************************************************************
 * TEST WRITE
 *********************************************************************************************/
exports.write = function(req, res) {
	res.header("Access-Control-Allow-Origin", "*"); // to allow cross-domain, replace * with a list of domains is desired.
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS'); // ExtJS will sent out OPTIONS
	res.header('Content-Type', 'application/json');
    res.send({ write: 'ok'});
}
