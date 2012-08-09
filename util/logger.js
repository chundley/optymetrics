var fs = require('fs'); 

var logger = exports;
logger.debugLevel = 'info';
logger.logFile = 'optymetrics.log';
logger.log = function(level, message) {
    var levels = ['info','warn', 'error'];
    if (levels.indexOf(level) >= levels.indexOf(logger.debugLevel) ) {
        if (typeof message !== 'string') {
            message = JSON.stringify(message);
        };

        var now = new Date();
        var dateAndTime = now.toUTCString();
        var logLine = '[' + dateAndTime + '] - ' + level.toUpperCase() + ' - ' + message;

        console.log(logLine);

        stream = fs.createWriteStream(logger.logFile, {
            'flags': 'a+',
            'encoding': 'utf8',
            'mode': 0644
        });

        stream.write(logLine + '\n', 'utf8');
        stream.end();
    }
}
