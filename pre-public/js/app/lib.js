/*
 * Lib
 */
define(['jquery'], function ($) {
	console.log('AngularJS-Headstart: lib called');
    return {
        getBody: function () {
        	console.log('AngularJS-Headstart: lib getBody called');
            return $('body');
        }
    }
});
