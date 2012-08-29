function firstDayOfWeek(week, year) { 
    if (typeof year !== 'undefined') {
      year = (new Date()).getFullYear();
    }

    var date       = firstWeekOfYear(year),
    weekTime   = weeksToMilliseconds(week),
    targetTime = date.getTime() + weekTime;

    return date.setTime(targetTime); 
}

function weeksToMilliseconds(weeks) {
    return 1000 * 60 * 60 * 24 * 7 * (weeks - 1);
}

function firstWeekOfYear(year) {
    var date = new Date();
    date = firstDayOfYear(date,year);
    date = firstWeekday(date);
    return date;
}

function firstDayOfYear(date, year) {
    date.setYear(year);
    date.setDate(1);
    date.setMonth(0);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

function firstWeekday(date) {
    var day = date.getDay(),
    day = (day === 0) ? 7 : day;

    if (day > 3) {
      var remaining = 8 - day,
      target    = remaining + 1;

      date.setDate(target);
    }

    return date;
}

function convertDateToUTC(date) { 
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); 
}

function dateDiff(date1, date2, period) {
    switch (period.toLowerCase()) {
        case 'second':
            {
                return Math.abs((date1.getTime() - date2.getTime()) / (1000));
            }

        case 'minute':
            {
                return Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60));
            }
        case 'hour':
            {
                return Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60));
            }
        default: // default to days
            {
                return Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
            }
    }
}

exports.firstDayOfWeek = firstDayOfWeek;
exports.firstDayOfYear = firstDayOfYear;
exports.convertDateToUTC = convertDateToUTC;
exports.dateDiff = dateDiff;
