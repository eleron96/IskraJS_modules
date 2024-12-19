// ESPWiFi.js
function ESPWiFi(uartInstance) {
  this.uart = uartInstance;
  this.buffer = "";
  this.currentCallback = null;
  this.isConnected = false;

  var self = this;

  // Общий обработчик данных с UART
  this.uart.on("data", function (data) {
    self.buffer += data;
    if (self.buffer.includes("OK") || self.buffer.includes("ERROR") || self.buffer.includes("FAIL")) {
      var response = self.buffer;
      self.buffer = "";
      if (self.currentCallback) {
        var cb = self.currentCallback;
        self.currentCallback = null;
        cb(response);
      }
    }
  });
}

// Вспомогательная функция для отправки команд AT
ESPWiFi.prototype.sendAT = function (command, delayTime, callback) {
  var self = this;
  setTimeout(function () {
    console.log("Sending: " + command);
    self.currentCallback = callback;
    self.buffer = "";
    self.uart.println(command);
  }, delayTime);
};

// Подключение к Wi-Fi
ESPWiFi.prototype.connectToWiFi = function (ssid, password, callback) {
  var self = this;

  if (self.isConnected) {
    console.log("Already connected to Wi-Fi.");
    if (callback) callback(true);
    return;
  }

  self.sendAT("AT", 0, function (resp) {
    if (resp.includes("OK")) {
      self.sendAT("AT+CWMODE=1", 1000, function (resp) {
        if (resp.includes("OK")) {
          self.sendAT(`AT+CWJAP="${ssid}","${password}"`, 5000, function (resp) {
            if (resp.includes("WIFI GOT IP")) {
              self.isConnected = true;
              console.log("Wi-Fi Connected!");
              if (callback) callback(true);
            } else {
              console.log("Failed to connect to Wi-Fi.");
              if (callback) callback(false);
            }
          });
        }
      });
    }
  });
};

// Получение IP-адреса
ESPWiFi.prototype.getIPAddress = function (callback) {
  var self = this;
  this.sendAT("AT+CIFSR", 2000, function (resp) {
    var match = resp.match(/\+CIFSR:STAIP,"(\d+\.\d+\.\d+\.\d+)"/);
    var ip = (match && match[1]) ? match[1] : null;
    if (ip) {
      console.log("IP Address: " + ip);
    }
    if (callback) callback(ip);
  });
};

// Проверка подключения к интернету через TCP-соединение
ESPWiFi.prototype.checkInternet = function (host, port, callback) {
  var self = this;
  this.sendAT(`AT+CIPSTART
