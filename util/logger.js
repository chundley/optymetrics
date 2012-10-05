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

        if(!logger.log.stream) {
            logger.log.stream = fs.createWriteStream(logger.logFile, {
                'flags': 'a+',
                'encoding': 'utf8',
                'mode': 0644
            });
        }

        logger.log.stream.write(logLine + '\n', 'utf8');
    }
}

logger.info = function(message) {
    logger.log('info', message);
}

logger.warn = function(message) {
    logger.log('warn', message);
}

logger.error = function (message) {
    logger.log('error', message);
}
