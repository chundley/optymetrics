if (!window.Opty) { window.Opty = {}; }
Opty.util = Opty.util || {};

Opty.util.padNumber = function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
      str = '0' + str;
    }

    return str;
}


Opty.util.formatNumber = function(number, decimals, dec_point, thousands_sep) {
    // Pulled from StackOverflow:
    // http://stackoverflow.com/questions/2901102/how-to-print-number-with-commas-as-thousands-separators-in-javascript
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

Opty.util.objectKeySort = function (o) {
    var a = {};
    var sortedKeys = _.keys(o).sort();
    for(var i in sortedKeys){ 
        a[sortedKeys[i]] = o[sortedKeys[i]];
    }
    return a;
};

Opty.util.getSundayDate = function(d) {
    var d2 = new Date ( d );
    d2.setHours( d.getHours() + 9 );
    d.setDate(d2.getDate() + (6-d2.getDay()));
    return d;
};


Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}
