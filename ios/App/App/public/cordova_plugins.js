
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "onesignal-cordova-plugin.OneSignalPlugin",
          "file": "plugins/onesignal-cordova-plugin/dist/index.js",
          "pluginId": "onesignal-cordova-plugin",
        "clobbers": [
          "OneSignal"
        ]
        },
      {
          "id": "cordova-plugin-purchase.CdvPurchase",
          "file": "plugins/cordova-plugin-purchase/www/store.js",
          "pluginId": "cordova-plugin-purchase",
        "clobbers": [
          "CdvPurchase",
          "store"
        ]
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "cordova-plugin-purchase": "13.12.1",
      "onesignal-cordova-plugin": "5.2.19"
    };
    // BOTTOM OF METADATA
    });
    