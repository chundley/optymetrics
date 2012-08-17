var opty = opty || {};
opty.util = opty.util || {};

opty.util.padNumber = function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
      str = '0' + str;
    }

    return str;
}
