/*
 * ConfigBase
 */
define(function () {
    console.log('AngularJS-Headstart: configBase called');	
    function configBase(configs) {
        this.configs = configs;
    };
    configBase.prototype = {
        getConfigs: function () {
            console.log('AngularJS-Headstart: configBase getConfigs() called');            
            return this.configs;
        }
    };
    return configBase;
});
