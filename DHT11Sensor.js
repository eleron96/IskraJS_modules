exports.connect = function(pin) {
  var dht = require("DHT11").connect(pin);
  return {
    read: function(callback) {
      dht.read(function(result) {
        if (!result.err) {
          callback(null, { 
            temperature: result.temp, 
            humidity: result.rh 
          });
        } else {
          callback(new Error("Failed to read DHT11 data"));
        }
      });
    }
  };
};