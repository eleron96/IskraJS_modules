exports.connect = function(serial) {
  return {
    readCO2: function(callback) {
      serial.write("\xFF\x01\x86\x00\x00\x00\x00\x00\x79");
      setTimeout(function() {
        var data = serial.read(9);
        if (data) {
          var a = [];
          for (var i = 0; i < data.length; i++) {
            a.push(data.charCodeAt(i));
          }
          if (a.length === 9) {
            var crc = (256 - (a[1] + a[2] + a[3] + a[4] + a[5] + a[6] + a[7]) % 256) & 0xFF;
            if (crc === a[8]) {
              var co2 = a[2] * 256 + a[3];
              var temp = a[4] - 40;
              callback(null, { co2: co2, temperature: temp });
              return;
            }
          }
        }
        // Если что-то пошло не так
        callback(new Error("Failed to read CO2 data"));
      }, 300); // Задержка для получения данных от сенсора
    }
  };
};
