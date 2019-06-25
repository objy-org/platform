(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
//! moment.js

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, (function () { 'use strict';

    var hookCallback;

    function hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return input != null && Object.prototype.toString.call(input) === '[object Object]';
    }

    function isObjectEmpty(obj) {
        if (Object.getOwnPropertyNames) {
            return (Object.getOwnPropertyNames(obj).length === 0);
        } else {
            var k;
            for (k in obj) {
                if (obj.hasOwnProperty(k)) {
                    return false;
                }
            }
            return true;
        }
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false,
            parsedDateParts : [],
            meridiem        : null,
            rfc2822         : false,
            weekdayMismatch : false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this);
            var len = t.length >>> 0;

            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            var parsedParts = some.call(flags.parsedDateParts, function (i) {
                return i != null;
            });
            var isNowValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.weekdayMismatch &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated &&
                (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                isNowValid = isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }

            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            }
            else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function createInvalid (flags) {
        var m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i = 0; i < momentProperties.length; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (hooks.suppressDeprecationWarnings === false &&
                (typeof console !==  'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [];
                var arg;
                for (var i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (var key in arguments[0]) {
                            arg += key + ': ' + arguments[0][key] + ', ';
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
        // TODO: Remove "ordinalParse" fallback in next major release.
        this._dayOfMonthOrdinalParseLenient = new RegExp(
            (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig), prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (hasOwnProp(parentConfig, prop) &&
                    !hasOwnProp(childConfig, prop) &&
                    isObject(parentConfig[prop])) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i, res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function calendar (key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        ss : '%d seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [];
        for (var u in unitsObj) {
            units.push({unit: u, priority: priorities[u]});
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '', i;
            for (i = 0; i < length; i++) {
                output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match3to4      = /\d\d\d\d?/;     //     999 - 9999
    var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    // includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i;

    var regexes = {};

    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (isNumber(callback)) {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PRIORITIES

    addUnitPriority('year', 1);

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get(this, unit);
            }
        };
    }

    function get (mom, unit) {
        return mom.isValid() ?
            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function set$1 (mom, unit, value) {
        if (mom.isValid() && !isNaN(value)) {
            if (unit === 'FullYear' && isLeapYear(mom.year()) && mom.month() === 1 && mom.date() === 29) {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value, mom.month(), daysInMonth(value, mom.month()));
            }
            else {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }
    }

    // MOMENTS

    function stringGet (units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }


    function stringSet (units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units);
            for (var i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function mod(n, x) {
        return ((n % x) + x) % x;
    }

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        if (isNaN(year) || isNaN(month)) {
            return NaN;
        }
        var modMonth = mod(month, 12);
        year += (month - modMonth) / 12;
        return modMonth === 1 ? (isLeapYear(year) ? 29 : 28) : (31 - modMonth % 7 % 2);
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PRIORITY

    addUnitPriority('month', 8);

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m, format) {
        if (!m) {
            return isArray(this._months) ? this._months :
                this._months['standalone'];
        }
        return isArray(this._months) ? this._months[m.month()] :
            this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m, format) {
        if (!m) {
            return isArray(this._monthsShort) ? this._monthsShort :
                this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function handleStrictParse(monthName, format, strict) {
        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        } else {
            return get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ?
                this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    var defaultMonthsRegex = matchWord;
    function monthsRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ?
                this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

    function createDate (y, m, d, h, M, s, ms) {
        // can't just apply() to create a date:
        // https://stackoverflow.com/q/181348
        var date;
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            date = new Date(y + 400, m, d, h, M, s, ms);
            if (isFinite(date.getFullYear())) {
                date.setFullYear(y);
            }
        } else {
            date = new Date(y, m, d, h, M, s, ms);
        }

        return date;
    }

    function createUTCDate (y) {
        var date;
        // the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            var args = Array.prototype.slice.call(arguments);
            // preserve leap years using a full 400 year cycle, then reset
            args[0] = y + 400;
            date = new Date(Date.UTC.apply(null, args));
            if (isFinite(date.getUTCFullYear())) {
                date.setUTCFullYear(y);
            }
        } else {
            date = new Date(Date.UTC.apply(null, arguments));
        }

        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 6th is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd',   function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd',   function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES
    function shiftWeekdays (ws, n) {
        return ws.slice(n, 7).concat(ws.slice(0, n));
    }

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m, format) {
        var weekdays = isArray(this._weekdays) ? this._weekdays :
            this._weekdays[(m && m !== true && this._weekdays.isFormat.test(format)) ? 'format' : 'standalone'];
        return (m === true) ? shiftWeekdays(weekdays, this._week.dow)
            : (m) ? weekdays[m.day()] : weekdays;
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return (m === true) ? shiftWeekdays(this._weekdaysShort, this._week.dow)
            : (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return (m === true) ? shiftWeekdays(this._weekdaysMin, this._week.dow)
            : (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }

    function handleStrictParse$1(weekdayName, format, strict) {
        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse (weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return handleStrictParse$1.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    var defaultWeekdaysRegex = matchWord;
    function weekdaysRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict ?
                this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }

    var defaultWeekdaysShortRegex = matchWord;
    function weekdaysShortRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict ?
                this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }

    var defaultWeekdaysMinRegex = matchWord;
    function weekdaysMinRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict ?
                this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }


    function computeWeekdaysParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, 1]).day(i);
            minp = this.weekdaysMin(mom, '');
            shortp = this.weekdaysShort(mom, '');
            longp = this.weekdays(mom, '');
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 7; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PRIORITY
    addUnitPriority('hour', 13);

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('k',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function (input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour they want. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse
    };

    // internal storage for locale config files
    var locales = {};
    var localeFamilies = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return globalLocale;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && (typeof module !== 'undefined') &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                var aliasedRequire = require;
                aliasedRequire('./locale/' + name);
                getSetGlobalLocale(oldLocale);
            } catch (e) {}
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
            else {
                if ((typeof console !==  'undefined') && console.warn) {
                    //warn user if arguments are passed but the locale could not be set
                    console.warn('Locale ' + key +  ' not found. Did you forget to load it?');
                }
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, config) {
        if (config !== null) {
            var locale, parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride',
                        'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale ' +
                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    locale = loadLocale(config.parentLocale);
                    if (locale != null) {
                        parentConfig = locale._config;
                    } else {
                        if (!localeFamilies[config.parentLocale]) {
                            localeFamilies[config.parentLocale] = [];
                        }
                        localeFamilies[config.parentLocale].push({
                            name: name,
                            config: config
                        });
                        return null;
                    }
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            if (localeFamilies[name]) {
                localeFamilies[name].forEach(function (x) {
                    defineLocale(x.name, x.config);
                });
            }

            // backwards compat for now: also set the locale
            // make sure we set the locale AFTER all child locales have been
            // created, so we won't end up with the child locale set.
            getSetGlobalLocale(name);


            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale, tmpLocale, parentConfig = baseConfig;
            // MERGE
            tmpLocale = loadLocale(name);
            if (tmpLocale != null) {
                parentConfig = tmpLocale._config;
            }
            config = mergeConfigs(parentConfig, config);
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;

            // backwards compat for now: also set the locale
            getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function listLocales() {
        return keys(locales);
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, expectedWeekday, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear != null) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();

        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }

        // check for mismatching day of week
        if (config._w && typeof config._w.d !== 'undefined' && config._w.d !== expectedWeekday) {
            getParsingFlags(config).weekdayMismatch = true;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            var curWeek = weekOfYear(createLocal(), dow, doy);

            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

            // Default to current week.
            week = defaults(w.w, curWeek.week);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from beginning of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to beginning of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
    var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;

    function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
        var result = [
            untruncateYear(yearStr),
            defaultLocaleMonthsShort.indexOf(monthStr),
            parseInt(dayStr, 10),
            parseInt(hourStr, 10),
            parseInt(minuteStr, 10)
        ];

        if (secondStr) {
            result.push(parseInt(secondStr, 10));
        }

        return result;
    }

    function untruncateYear(yearStr) {
        var year = parseInt(yearStr, 10);
        if (year <= 49) {
            return 2000 + year;
        } else if (year <= 999) {
            return 1900 + year;
        }
        return year;
    }

    function preprocessRFC2822(s) {
        // Remove comments and folding whitespace and replace multiple-spaces with a single space
        return s.replace(/\([^)]*\)|[\n\t]/g, ' ').replace(/(\s\s+)/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }

    function checkWeekday(weekdayStr, parsedInput, config) {
        if (weekdayStr) {
            // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
            var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
            if (weekdayProvided !== weekdayActual) {
                getParsingFlags(config).weekdayMismatch = true;
                config._isValid = false;
                return false;
            }
        }
        return true;
    }

    var obsOffsets = {
        UT: 0,
        GMT: 0,
        EDT: -4 * 60,
        EST: -5 * 60,
        CDT: -5 * 60,
        CST: -6 * 60,
        MDT: -6 * 60,
        MST: -7 * 60,
        PDT: -7 * 60,
        PST: -8 * 60
    };

    function calculateOffset(obsOffset, militaryOffset, numOffset) {
        if (obsOffset) {
            return obsOffsets[obsOffset];
        } else if (militaryOffset) {
            // the only allowed military tz is Z
            return 0;
        } else {
            var hm = parseInt(numOffset, 10);
            var m = hm % 100, h = (hm - m) / 100;
            return h * 60 + m;
        }
    }

    // date and time from ref 2822 format
    function configFromRFC2822(config) {
        var match = rfc2822.exec(preprocessRFC2822(config._i));
        if (match) {
            var parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
            if (!checkWeekday(match[1], parsedArray, config)) {
                return;
            }

            config._a = parsedArray;
            config._tzm = calculateOffset(match[8], match[9], match[10]);

            config._d = createUTCDate.apply(null, config._a);
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

            getParsingFlags(config).rfc2822 = true;
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        configFromRFC2822(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        // Final attempt, use Input Fallback
        hooks.createFromInputFallback(config);
    }

    hooks.createFromInputFallback = deprecate(
        'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
        'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
        'discouraged and will be removed in an upcoming major release. Please refer to ' +
        'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // constant that refers to the ISO standard
    hooks.ISO_8601 = function () {};

    // constant that refers to the RFC 2822 form
    hooks.RFC_2822 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        if (config._f === hooks.RFC_2822) {
            configFromRFC2822(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        }  else {
            configFromInput(config);
        }

        if (!isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
            config._d = new Date(hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (isObject(input)) {
            configFromObject(config);
        } else if (isNumber(input)) {
            // from milliseconds
            config._d = new Date(input);
        } else {
            hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }

        if ((isObject(input) && isObjectEmpty(input)) ||
                (isArray(input) && input.length === 0)) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
        'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other < this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +(new Date());
    };

    var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

    function isDurationValid(m) {
        for (var key in m) {
            if (!(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
                return false;
            }
        }

        var unitHasDecimal = false;
        for (var i = 0; i < ordering.length; ++i) {
            if (m[ordering[i]]) {
                if (unitHasDecimal) {
                    return false; // only allow non-integers for smallest unit
                }
                if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                    unitHasDecimal = true;
                }
            }
        }

        return true;
    }

    function isValid$1() {
        return this._isValid;
    }

    function createInvalid$1() {
        return createDuration(NaN);
    }

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        this._isValid = isDurationValid(normalizedInput);

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible to translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    function absRound (number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // FORMATTING

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = (string || '').match(matcher);

        if (matches === null) {
            return null;
        }

        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return minutes === 0 ?
          0 :
          parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        } else {
            return createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime, keepMinutes) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) {
                    return this;
                }
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(this, createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm != null) {
            this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone != null) {
                this.utcOffset(tZone);
            }
            else {
                this.utcOffset(0, true);
            }
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset () {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc () {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    // and further modified to allow for strings containing both week and day
    var isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

    function createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (isNumber(input)) {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])                         * sign,
                h  : toInt(match[HOUR])                         * sign,
                m  : toInt(match[MINUTE])                       * sign,
                s  : toInt(match[SECOND])                       * sign,
                ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                w : parseIso(match[4], sign),
                d : parseIso(match[5], sign),
                h : parseIso(match[6], sign),
                m : parseIso(match[7], sign),
                s : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return {milliseconds: 0, months: 0};
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
                'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }

    function addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (months) {
            setMonth(mom, get(mom, 'Month') + months * isAdding);
        }
        if (days) {
            set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
        }
        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (updateOffset) {
            hooks.updateOffset(mom, days || months);
        }
    }

    var add      = createAdder(1, 'add');
    var subtract = createAdder(-1, 'subtract');

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
    }

    function calendar$1 (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse';

        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween (from, to, units, inclusivity) {
        var localFrom = isMoment(from) ? from : createLocal(from),
            localTo = isMoment(to) ? to : createLocal(to);
        if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
            return false;
        }
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(localFrom, units) : !this.isBefore(localFrom, units)) &&
            (inclusivity[1] === ')' ? this.isBefore(localTo, units) : !this.isAfter(localTo, units));
    }

    function isSame (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter (input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
    }

    function isSameOrBefore (input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
    }

    function diff (input, units, asFloat) {
        var that,
            zoneDelta,
            output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        switch (units) {
            case 'year': output = monthDiff(this, that) / 12; break;
            case 'month': output = monthDiff(this, that); break;
            case 'quarter': output = monthDiff(this, that) / 3; break;
            case 'second': output = (this - that) / 1e3; break; // 1000
            case 'minute': output = (this - that) / 6e4; break; // 1000 * 60
            case 'hour': output = (this - that) / 36e5; break; // 1000 * 60 * 60
            case 'day': output = (this - that - zoneDelta) / 864e5; break; // 1000 * 60 * 60 * 24, negate dst
            case 'week': output = (this - that - zoneDelta) / 6048e5; break; // 1000 * 60 * 60 * 24 * 7, negate dst
            default: output = this - that;
        }

        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function toISOString(keepOffset) {
        if (!this.isValid()) {
            return null;
        }
        var utc = keepOffset !== true;
        var m = utc ? this.clone().utc() : this;
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(m, utc ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ');
        }
        if (isFunction(Date.prototype.toISOString)) {
            // native implementation is ~50x faster, use it when we can
            if (utc) {
                return this.toDate().toISOString();
            } else {
                return new Date(this.valueOf() + this.utcOffset() * 60 * 1000).toISOString().replace('Z', formatMoment(m, 'Z'));
            }
        }
        return formatMoment(m, utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ');
    }

    /**
     * Return a human readable representation of a moment that can
     * also be evaluated to get a new moment which is the same
     *
     * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
     */
    function inspect () {
        if (!this.isValid()) {
            return 'moment.invalid(/* ' + this._i + ' */)';
        }
        var func = 'moment';
        var zone = '';
        if (!this.isLocal()) {
            func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
            zone = 'Z';
        }
        var prefix = '[' + func + '("]';
        var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
        var datetime = '-MM-DD[T]HH:mm:ss.SSS';
        var suffix = zone + '[")]';

        return this.format(prefix + year + datetime + suffix);
    }

    function format (inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 createLocal(time).isValid())) {
            return createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow (withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 createLocal(time).isValid())) {
            return createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow (withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    var MS_PER_SECOND = 1000;
    var MS_PER_MINUTE = 60 * MS_PER_SECOND;
    var MS_PER_HOUR = 60 * MS_PER_MINUTE;
    var MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

    // actual modulo - handles negative numbers (for dates before 1970):
    function mod$1(dividend, divisor) {
        return (dividend % divisor + divisor) % divisor;
    }

    function localStartOfDate(y, m, d) {
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return new Date(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return new Date(y, m, d).valueOf();
        }
    }

    function utcStartOfDate(y, m, d) {
        // Date.UTC remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return Date.UTC(y, m, d);
        }
    }

    function startOf (units) {
        var time;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        var startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year(), 0, 1);
                break;
            case 'quarter':
                time = startOfDate(this.year(), this.month() - this.month() % 3, 1);
                break;
            case 'month':
                time = startOfDate(this.year(), this.month(), 1);
                break;
            case 'week':
                time = startOfDate(this.year(), this.month(), this.date() - this.weekday());
                break;
            case 'isoWeek':
                time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1));
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date());
                break;
            case 'hour':
                time = this._d.valueOf();
                time -= mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR);
                break;
            case 'minute':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_MINUTE);
                break;
            case 'second':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_SECOND);
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function endOf (units) {
        var time;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        var startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year() + 1, 0, 1) - 1;
                break;
            case 'quarter':
                time = startOfDate(this.year(), this.month() - this.month() % 3 + 3, 1) - 1;
                break;
            case 'month':
                time = startOfDate(this.year(), this.month() + 1, 1) - 1;
                break;
            case 'week':
                time = startOfDate(this.year(), this.month(), this.date() - this.weekday() + 7) - 1;
                break;
            case 'isoWeek':
                time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1) + 7) - 1;
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
                break;
            case 'hour':
                time = this._d.valueOf();
                time += MS_PER_HOUR - mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR) - 1;
                break;
            case 'minute':
                time = this._d.valueOf();
                time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
                break;
            case 'second':
                time = this._d.valueOf();
                time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function valueOf () {
        return this._d.valueOf() - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate () {
        return new Date(this.valueOf());
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON () {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function isValid$2 () {
        return isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);


    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy);
    }

    function getSetISOWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PRIORITY

    addUnitPriority('quarter', 7);

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PRIORITY
    addUnitPriority('date', 9);

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        // TODO: Remove "ordinalParse" fallback in next major release.
        return isStrict ?
          (locale._dayOfMonthOrdinalParse || locale._ordinalParse) :
          locale._dayOfMonthOrdinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0]);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PRIORITY
    addUnitPriority('dayOfYear', 4);

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PRIORITY

    addUnitPriority('minute', 14);

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PRIORITY

    addUnitPriority('second', 15);

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PRIORITY

    addUnitPriority('millisecond', 16);

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var proto = Moment.prototype;

    proto.add               = add;
    proto.calendar          = calendar$1;
    proto.clone             = clone;
    proto.diff              = diff;
    proto.endOf             = endOf;
    proto.format            = format;
    proto.from              = from;
    proto.fromNow           = fromNow;
    proto.to                = to;
    proto.toNow             = toNow;
    proto.get               = stringGet;
    proto.invalidAt         = invalidAt;
    proto.isAfter           = isAfter;
    proto.isBefore          = isBefore;
    proto.isBetween         = isBetween;
    proto.isSame            = isSame;
    proto.isSameOrAfter     = isSameOrAfter;
    proto.isSameOrBefore    = isSameOrBefore;
    proto.isValid           = isValid$2;
    proto.lang              = lang;
    proto.locale            = locale;
    proto.localeData        = localeData;
    proto.max               = prototypeMax;
    proto.min               = prototypeMin;
    proto.parsingFlags      = parsingFlags;
    proto.set               = stringSet;
    proto.startOf           = startOf;
    proto.subtract          = subtract;
    proto.toArray           = toArray;
    proto.toObject          = toObject;
    proto.toDate            = toDate;
    proto.toISOString       = toISOString;
    proto.inspect           = inspect;
    proto.toJSON            = toJSON;
    proto.toString          = toString;
    proto.unix              = unix;
    proto.valueOf           = valueOf;
    proto.creationData      = creationData;
    proto.year       = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear    = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month       = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week           = proto.weeks        = getSetWeek;
    proto.isoWeek        = proto.isoWeeks     = getSetISOWeek;
    proto.weeksInYear    = getWeeksInYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.date       = getSetDayOfMonth;
    proto.day        = proto.days             = getSetDayOfWeek;
    proto.weekday    = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear  = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset            = getSetOffset;
    proto.utc                  = setOffsetToUTC;
    proto.local                = setOffsetToLocal;
    proto.parseZone            = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST                = isDaylightSavingTime;
    proto.isLocal              = isLocal;
    proto.isUtcOffset          = isUtcOffset;
    proto.isUtc                = isUtc;
    proto.isUTC                = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

    function createUnix (input) {
        return createLocal(input * 1000);
    }

    function createInZone () {
        return createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat (string) {
        return string;
    }

    var proto$1 = Locale.prototype;

    proto$1.calendar        = calendar;
    proto$1.longDateFormat  = longDateFormat;
    proto$1.invalidDate     = invalidDate;
    proto$1.ordinal         = ordinal;
    proto$1.preparse        = preParsePostFormat;
    proto$1.postformat      = preParsePostFormat;
    proto$1.relativeTime    = relativeTime;
    proto$1.pastFuture      = pastFuture;
    proto$1.set             = set;

    proto$1.months            =        localeMonths;
    proto$1.monthsShort       =        localeMonthsShort;
    proto$1.monthsParse       =        localeMonthsParse;
    proto$1.monthsRegex       = monthsRegex;
    proto$1.monthsShortRegex  = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;

    proto$1.weekdays       =        localeWeekdays;
    proto$1.weekdaysMin    =        localeWeekdaysMin;
    proto$1.weekdaysShort  =        localeWeekdaysShort;
    proto$1.weekdaysParse  =        localeWeekdaysParse;

    proto$1.weekdaysRegex       =        weekdaysRegex;
    proto$1.weekdaysShortRegex  =        weekdaysShortRegex;
    proto$1.weekdaysMinRegex    =        weekdaysMinRegex;

    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;

    function get$1 (format, index, field, setter) {
        var locale = getLocale();
        var utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl (format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return get$1(format, index, field, 'month');
        }

        var i;
        var out = [];
        for (i = 0; i < 12; i++) {
            out[i] = get$1(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl (localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0;

        if (index != null) {
            return get$1(format, (index + shift) % 7, field, 'day');
        }

        var i;
        var out = [];
        for (i = 0; i < 7; i++) {
            out[i] = get$1(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function listMonths (format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function listMonthsShort (format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function listWeekdays (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function listWeekdaysShort (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function listWeekdaysMin (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    getSetGlobalLocale('en', {
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports

    hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
    hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

    var mathAbs = Math.abs;

    function abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function addSubtract$1 (duration, input, value, direction) {
        var other = createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function add$1 (input, value) {
        return addSubtract$1(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function subtract$1 (input, value) {
        return addSubtract$1(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        if (!this.isValid()) {
            return NaN;
        }
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'quarter' || units === 'year') {
            days = this._days + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            switch (units) {
                case 'month':   return months;
                case 'quarter': return months / 3;
                case 'year':    return months / 12;
            }
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function valueOf$1 () {
        if (!this.isValid()) {
            return NaN;
        }
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asQuarters     = makeAs('Q');
    var asYears        = makeAs('y');

    function clone$1 () {
        return createDuration(this);
    }

    function get$2 (units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + 's']() : NaN;
    }

    function makeGetter(name) {
        return function () {
            return this.isValid() ? this._data[name] : NaN;
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        ss: 44,         // a few seconds to seconds
        s : 45,         // seconds to minute
        m : 45,         // minutes to hour
        h : 22,         // hours to day
        d : 26,         // days to month
        M : 11          // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime$1 (posNegDuration, withoutSuffix, locale) {
        var duration = createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds <= thresholds.ss && ['s', seconds]  ||
                seconds < thresholds.s   && ['ss', seconds] ||
                minutes <= 1             && ['m']           ||
                minutes < thresholds.m   && ['mm', minutes] ||
                hours   <= 1             && ['h']           ||
                hours   < thresholds.h   && ['hh', hours]   ||
                days    <= 1             && ['d']           ||
                days    < thresholds.d   && ['dd', days]    ||
                months  <= 1             && ['M']           ||
                months  < thresholds.M   && ['MM', months]  ||
                years   <= 1             && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function getSetRelativeTimeRounding (roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof(roundingFunction) === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === 's') {
            thresholds.ss = limit - 1;
        }
        return true;
    }

    function humanize (withSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var locale = this.localeData();
        var output = relativeTime$1(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var abs$1 = Math.abs;

    function sign(x) {
        return ((x > 0) - (x < 0)) || +x;
    }

    function toISOString$1() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var seconds = abs$1(this._milliseconds) / 1000;
        var days         = abs$1(this._days);
        var months       = abs$1(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        var totalSign = total < 0 ? '-' : '';
        var ymSign = sign(this._months) !== sign(total) ? '-' : '';
        var daysSign = sign(this._days) !== sign(total) ? '-' : '';
        var hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

        return totalSign + 'P' +
            (Y ? ymSign + Y + 'Y' : '') +
            (M ? ymSign + M + 'M' : '') +
            (D ? daysSign + D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? hmsSign + h + 'H' : '') +
            (m ? hmsSign + m + 'M' : '') +
            (s ? hmsSign + s + 'S' : '');
    }

    var proto$2 = Duration.prototype;

    proto$2.isValid        = isValid$1;
    proto$2.abs            = abs;
    proto$2.add            = add$1;
    proto$2.subtract       = subtract$1;
    proto$2.as             = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds      = asSeconds;
    proto$2.asMinutes      = asMinutes;
    proto$2.asHours        = asHours;
    proto$2.asDays         = asDays;
    proto$2.asWeeks        = asWeeks;
    proto$2.asMonths       = asMonths;
    proto$2.asQuarters     = asQuarters;
    proto$2.asYears        = asYears;
    proto$2.valueOf        = valueOf$1;
    proto$2._bubble        = bubble;
    proto$2.clone          = clone$1;
    proto$2.get            = get$2;
    proto$2.milliseconds   = milliseconds;
    proto$2.seconds        = seconds;
    proto$2.minutes        = minutes;
    proto$2.hours          = hours;
    proto$2.days           = days;
    proto$2.weeks          = weeks;
    proto$2.months         = months;
    proto$2.years          = years;
    proto$2.humanize       = humanize;
    proto$2.toISOString    = toISOString$1;
    proto$2.toString       = toISOString$1;
    proto$2.toJSON         = toISOString$1;
    proto$2.locale         = locale;
    proto$2.localeData     = localeData;

    proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
    proto$2.lang = lang;

    // Side effect imports

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    hooks.version = '2.24.0';

    setHookCallback(createLocal);

    hooks.fn                    = proto;
    hooks.min                   = min;
    hooks.max                   = max;
    hooks.now                   = now;
    hooks.utc                   = createUTC;
    hooks.unix                  = createUnix;
    hooks.months                = listMonths;
    hooks.isDate                = isDate;
    hooks.locale                = getSetGlobalLocale;
    hooks.invalid               = createInvalid;
    hooks.duration              = createDuration;
    hooks.isMoment              = isMoment;
    hooks.weekdays              = listWeekdays;
    hooks.parseZone             = createInZone;
    hooks.localeData            = getLocale;
    hooks.isDuration            = isDuration;
    hooks.monthsShort           = listMonthsShort;
    hooks.weekdaysMin           = listWeekdaysMin;
    hooks.defineLocale          = defineLocale;
    hooks.updateLocale          = updateLocale;
    hooks.locales               = listLocales;
    hooks.weekdaysShort         = listWeekdaysShort;
    hooks.normalizeUnits        = normalizeUnits;
    hooks.relativeTimeRounding  = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat        = getCalendarFormat;
    hooks.prototype             = proto;

    // currently HTML5 input type only supports 24-hour formats
    hooks.HTML5_FMT = {
        DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm',             // <input type="datetime-local" />
        DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss',  // <input type="datetime-local" step="1" />
        DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS',   // <input type="datetime-local" step="0.001" />
        DATE: 'YYYY-MM-DD',                             // <input type="date" />
        TIME: 'HH:mm',                                  // <input type="time" />
        TIME_SECONDS: 'HH:mm:ss',                       // <input type="time" step="1" />
        TIME_MS: 'HH:mm:ss.SSS',                        // <input type="time" step="0.001" />
        WEEK: 'GGGG-[W]WW',                             // <input type="week" />
        MONTH: 'YYYY-MM'                                // <input type="month" />
    };

    return hooks;

})));

},{}],2:[function(require,module,exports){
/**
 * Secure random string generator with custom alphabet.
 *
 * Alphabet must contain 256 symbols or less. Otherwise, the generator
 * will not be secure.
 *
 * @param {generator} random The random bytes generator.
 * @param {string} alphabet Symbols to be used in new random string.
 * @param {size} size The number of symbols in new random string.
 *
 * @return {string} Random string.
 *
 * @example
 * const format = require('nanoid/format')
 *
 * function random (size) {
 *   const result = []
 *   for (let i = 0; i < size; i++) {
 *     result.push(randomByte())
 *   }
 *   return result
 * }
 *
 * format(random, "abcdef", 5) //=> "fbaef"
 *
 * @name format
 * @function
 */
module.exports = function (random, alphabet, size) {
  var mask = (2 << Math.log(alphabet.length - 1) / Math.LN2) - 1
  var step = Math.ceil(1.6 * mask * size / alphabet.length)

  var id = ''
  while (true) {
    var bytes = random(step)
    for (var i = 0; i < step; i++) {
      var byte = bytes[i] & mask
      if (alphabet[byte]) {
        id += alphabet[byte]
        if (id.length === size) return id
      }
    }
  }
}

/**
 * @callback generator
 * @param {number} bytes The number of bytes to generate.
 * @return {number[]} Random bytes.
 */

},{}],3:[function(require,module,exports){
(function () {
  function objectify(a) {
    var rows = [];
    for (var key in a) {
      var o = {};
      o[key] = a[key];
      rows.push(o);
    }
    return rows;
  }

// polyfill, since String.startsWith is part of ECMAScript 6,
  if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function (searchString, position) {
        position = position || 0;
        return this.lastIndexOf(searchString, position) === position;
      }
    });
  }

// polyfill, since String.endsWith is part of ECMAScript 6,
  if (!String.prototype.endsWith) {
    Object.defineProperty(String.prototype, 'endsWith', {
      value: function (searchString, position) {
        var subjectString = this.toString();
        if (position === undefined || position > subjectString.length) {
          position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
      }
    });
  }

  // should turn this function around so it works more like this
  //
  // var truth = Query(q).satisfies(obj)

  var Query = {

    satisfies: function (row, constraints, getter) {
      return Query.lhs._rowsatisfies(row, constraints, getter);
    },

    Query: function (constraints, getter) {
      return function (row) {
        return Query.lhs._rowsatisfies(row, constraints, getter);
      }
    },

    join: function (left_rows, right_rows, left_key, right_key) {
      var leftKeyFn, rightKeyFn;
      if (typeof left_key == 'string') leftKeyFn = function (row) {
        return row[left_key];
      }
      else leftKeyFn = left_key;

      if (!right_key) rightKeyFn = leftKeyFn;
      if (typeof right_key == 'string') rightKeyFn = function (row) {
        return row[left_key];
      }
      else rightKeyFn = right_key;

      return left_rows;
    },

    query: function (rows, constraints, getter) {
      if (typeof getter == 'string') {
        var method = getter;
        getter = function (obj, key) {
          return obj[method](key);
        };
      }
      var filter = new Query.Query(constraints, getter);
      return rows.filter(filter);
    },

    lhs: { // queries that are not yet referenced to a particular attribute, e.g. {$not: {likes: 0}}

      // test whether a row satisfies a constraints hash,
      _rowsatisfies: function (row, constraints, getter) {
        for (var key in constraints) {
          if (this[key]) {
            if (!this[key](row, constraints[key], getter)) return false;
          }
          else {
            var val = (getter ? getter(row, key) : row[key]);
            var res = this.rhs._satisfies(val, constraints[key], key)
            if (!res) return false;
          }
        }
        return true;
      },

      $count: function (row, condition, getter) {

        var res = condition.$constraints.map(function (c) {
          return Query.satisfies(row, c, getter);
        }).filter(function(v) {return v}).length
        return this.rhs._satisfies(res, condition.$constraint)
      },

      $not: function (row, constraint, getter) {
        return !this._rowsatisfies(row, constraint, getter);
      },

      $or: function (row, constraint, getter) {
        if (!Array.isArray(constraint)) {
          constraint = objectify(constraint);
        }
        for (var i = 0; i < constraint.length; i++) {
          if (this._rowsatisfies(row, constraint[i], getter)) return true;
        }
        return false;
      },

      $and: function (row, constraint, getter) {
        if (!Array.isArray(constraint)) {
          constraint = objectify(constraint);
        }

        for (var i = 0; i < constraint.length; i++) {
          if (!this._rowsatisfies(row, constraint[i], getter)) return false;
        }
        return true;
      },

      $nor: function (row, constraint, getter) {
        return !this.$or(row, constraint, getter)
      },

      $where: function (values, ref) {
        var fn = (typeof ref == 'string') ? new Function(ref) : ref;
        var res = fn.call(values)
        return res;
      },


      rhs: {  // queries that reference a particular attribute, e.g. {likes: {$gt: 10}}

        $cb: function (value, constraint, parentKey) {
          return constraint(value)
        },
        // test whether a single value matches a particular constraint
        _satisfies: function (value, constraint, parentKey) {

          if (constraint === value)  return true;
          else if (constraint instanceof RegExp)  return this.$regex(value, constraint);
          else if (Array.isArray(constraint))  return this.$in(value, constraint);
          else if (constraint && typeof constraint === 'object') {
            if (constraint instanceof Date) return this.$eq(value, constraint.getTime())
            else {
              if (constraint.$regex) return this.$regex(value, new RegExp(constraint.$regex, constraint.$options))
              for (var key in constraint) {
                if (!this[key])  return this.$eq(value, constraint, parentKey)
                else if (!this[key](value, constraint[key], parentKey))  return false;
              }
              return true;
            }
          }
          else if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++)
              if (this.$eq(value[i], constraint)) return true;
            return false;
          }
          else if (constraint === '' || constraint === null || constraint === undefined)  return this.$null(value);
          else return this.$eq(value, constraint);
        },


        $eq: function (value, constraint) {
          if (value === constraint) return true;
          else if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++)
              if (this.$eq(value[i], constraint)) return true;
            return false;
          }
          else if (constraint === null || constraint === undefined || constraint === '') {
            return this.$null(value);
          }
          else if (value === null || value === '' || value === undefined) return false; //we know from above the constraint is not null
          else if (value instanceof Date) {

            if (constraint instanceof Date) {
              return value.getTime() == constraint.getTime();
            }
            else if (typeof constraint == 'number') {
              return value.getTime() == constraint;
            }
            else if (typeof constraint == 'string') return value.getTime() == (new Date(constraint)).getTime()
          }
          else {
            return value == constraint
          }
          ;

        },


        $exists: function (value, constraint, parentKey) {
          return (value != undefined) == (constraint && true);
        },

        $deepEquals: function (value, constraint) {
          if (typeof _ == 'undefined' || typeof _.isEqual == 'undefined') {
            return JSON.stringify(value) == JSON.stringify(constraint); //
          }
          else {
            return _.isEqual(value, constraint);
          }

        },

        $not: function (values, constraint) {
          return !this._satisfies(values, constraint);

        },

        $ne: function (values, constraint) {
          return !this._satisfies(values, constraint);
        },

        $nor: function (values, constraint, parentKey) {
          return !this.$or(values, constraint, parentKey);
        },

        $and: function (values, constraint, parentKey) {

          if (!Array.isArray(constraint)) {
            throw new Error("Logic $and takes array of constraint objects");
          }
          for (var i = 0; i < constraint.length; i++) {
            var res = this._satisfies(values, constraint[i], parentKey);
            if (!res) return false;
          }
          return true;
        },

        // Identical to $in, but allows for different semantics
        $or: function (values, constraint, parentKey) {

          if (!Array.isArray(values)) {
            values = [values];
          }

          for (var v = 0; v < values.length; v++) {
            for (var i = 0; i < constraint.length; i++) {
              if (this._satisfies(values[v], constraint[i], parentKey)) {
                return true;
              }
            }
          }

          return false;
        },

        /**
         * returns true if all of the values in the array are null
         * @param values
         * @returns {boolean}
         */
        $null: function (values) {
          var result;
          if (values === '' || values === null || values === undefined) {
            return true;
          }
          else if (Array.isArray(values)) {
            for (var v = 0; v < values.length; v++) {
              if (!this.$null(values[v])) {
                return false;
              }
            }
            return true;
          }
          else return false;
        },


        /**
         * returns true if any of the values are keys of the constraint
         * @param values
         * @param constraint
         * @returns {boolean}
         */
        $in: function (values, constraint) {
          if (!Array.isArray(constraint)) throw new Error("$in requires an array operand");
          var result = false;
          if (!Array.isArray(values)) {
            values = [values];
          }
          for (var v = 0; v < values.length; v++) {
            var val = values[v];
            for (var i = 0; i < constraint.length; i++) {
              if (this._satisfies(val, constraint[i])) {
                result = true;
                break;
              }
            }
            result = result || ( constraint.indexOf(val) >= 0);
          }

          return result;
        },

        $likeI: function (values, constraint) {
          return values.toLowerCase().indexOf(constraint) >= 0;
        },

        $like: function (values, constraint) {
          return values.indexOf(constraint) >= 0;
        },

        $startsWith: function (values, constraint) {
          if (!values) return false;
          return values.startsWith(constraint);
        },

        $endsWith: function (values, constraint) {
          if (!values) return false;
          return values.endsWith(constraint);
        },

        $elemMatch: function (values, constraint, parentKey) {
          for (var i = 0; i < values.length; i++) {
            if (Query.lhs._rowsatisfies(values[i], constraint)) return true;
          }
          return false;
        },

        $contains: function (values, constraint) {
          return values.indexOf(constraint) >= 0;
        },

        $nin: function (values, constraint) {
          return !this.$in(values, constraint);
        },

        $regex: function (values, constraint) {
          var result = false;
          if (Array.isArray(values)) {
            for (var i = 0; i < values.length; i++) {
              if (constraint.test(values[i])) {
                return true;
              }
            }
          }
          else return constraint.test(values);

        },

        $gte: function (values, ref) {
          return !this.$null(values) && values >= this.resolve(ref)
        },

        $gt: function (values, ref) {
          return !this.$null(values) && values > this.resolve(ref);
        },

        $lt: function (values, ref) {
          return !this.$null(values) && values < this.resolve(ref);
        },

        $lte: function (values, ref) {
          return !this.$null(values) && values <= this.resolve(ref);
        },


        $before: function (values, ref) {
          if (typeof ref === 'string') ref = Date.parse(ref);
          if (typeof values === 'string') values = Date.parse(values);
          return this.$lte(values, ref)
        },

        $after: function (values, ref) {
          if (typeof ref === 'string') ref = Date.parse(ref);
          if (typeof values === 'string') values = Date.parse(values);

          return this.$gte(values, ref)
        },

        $type: function (values, ref) {
          return typeof values == ref;
        },

        $all: function (values, ref) {
          throw new Error("$all not implemented")
        },

        $size: function (values, ref) {
          return (typeof values == 'object' && (values.length == ref || Object.keys(values).length == ref) );
        },

        $mod: function (values, ref) {
          return values % ref[0] == ref[1]
        },
        $equal: function () {
          return this.$eq(arguments);
        },
        $between: function (values, ref) {
          return this._satisfies(values, {$gt: ref[0], $lt: ref[1]})
        },
        resolve: function (ref) {
          if (typeof ref === 'object') {
            if (ref["$date"]) return Date.parse(ref["$date"])
          }
          return ref;
        }
      }
    }
  };

  // Provide means to parse dot notation for deep Mongo queries, optional for performance
  Query.undot = function (obj, key) {
    var keys = key.split('.'), sub = obj;
    for (var i = 0; i < keys.length; i++) {
      sub = sub[keys[i]]
    }
    return sub;
  };

  Query.lhs.rhs.$equal = Query.lhs.rhs.$eq;
  Query.lhs.rhs.$any = Query.lhs.rhs.$or;
  Query.lhs.rhs.$all = Query.lhs.rhs.$and;

  Query.satisfies = function (row, constraints, getter) {
    return this.lhs._rowsatisfies(row, constraints, getter);
  }

  Array.prototype.query = function (q) {
    return Query.query(this, q);
  }

  //This allows a query object with regex values to be serialized to JSON
  //http://stackoverflow.com/questions/12075927/serialization-of-regexp
  //However, it doesn't solve the problem of parsing them back to regex on input
  RegExp.prototype.toJSON = RegExp.prototype.toString;

  if (typeof module != 'undefined') module.exports = Query;
  else if (typeof define != 'undefined' && define.amd)   define('query', [], function () {
    return Query;
  })
  else if (typeof window != 'undefined') window.Query = Query;
  else if (typeof GLOBAL != undefined && GLOBAL.global) GLOBAL.global.Query = Query;

  return Query;
})(this);
},{}],4:[function(require,module,exports){
'use strict';
module.exports = require('./lib/index');

},{"./lib/index":8}],5:[function(require,module,exports){
'use strict';

var randomFromSeed = require('./random/random-from-seed');

var ORIGINAL = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
var alphabet;
var previousSeed;

var shuffled;

function reset() {
    shuffled = false;
}

function setCharacters(_alphabet_) {
    if (!_alphabet_) {
        if (alphabet !== ORIGINAL) {
            alphabet = ORIGINAL;
            reset();
        }
        return;
    }

    if (_alphabet_ === alphabet) {
        return;
    }

    if (_alphabet_.length !== ORIGINAL.length) {
        throw new Error('Custom alphabet for shortid must be ' + ORIGINAL.length + ' unique characters. You submitted ' + _alphabet_.length + ' characters: ' + _alphabet_);
    }

    var unique = _alphabet_.split('').filter(function(item, ind, arr){
       return ind !== arr.lastIndexOf(item);
    });

    if (unique.length) {
        throw new Error('Custom alphabet for shortid must be ' + ORIGINAL.length + ' unique characters. These characters were not unique: ' + unique.join(', '));
    }

    alphabet = _alphabet_;
    reset();
}

function characters(_alphabet_) {
    setCharacters(_alphabet_);
    return alphabet;
}

function setSeed(seed) {
    randomFromSeed.seed(seed);
    if (previousSeed !== seed) {
        reset();
        previousSeed = seed;
    }
}

function shuffle() {
    if (!alphabet) {
        setCharacters(ORIGINAL);
    }

    var sourceArray = alphabet.split('');
    var targetArray = [];
    var r = randomFromSeed.nextValue();
    var characterIndex;

    while (sourceArray.length > 0) {
        r = randomFromSeed.nextValue();
        characterIndex = Math.floor(r * sourceArray.length);
        targetArray.push(sourceArray.splice(characterIndex, 1)[0]);
    }
    return targetArray.join('');
}

function getShuffled() {
    if (shuffled) {
        return shuffled;
    }
    shuffled = shuffle();
    return shuffled;
}

/**
 * lookup shuffled letter
 * @param index
 * @returns {string}
 */
function lookup(index) {
    var alphabetShuffled = getShuffled();
    return alphabetShuffled[index];
}

function get () {
  return alphabet || ORIGINAL;
}

module.exports = {
    get: get,
    characters: characters,
    seed: setSeed,
    lookup: lookup,
    shuffled: getShuffled
};

},{"./random/random-from-seed":11}],6:[function(require,module,exports){
'use strict';

var generate = require('./generate');
var alphabet = require('./alphabet');

// Ignore all milliseconds before a certain time to reduce the size of the date entropy without sacrificing uniqueness.
// This number should be updated every year or so to keep the generated id short.
// To regenerate `new Date() - 0` and bump the version. Always bump the version!
var REDUCE_TIME = 1459707606518;

// don't change unless we change the algos or REDUCE_TIME
// must be an integer and less than 16
var version = 6;

// Counter is used when shortid is called multiple times in one second.
var counter;

// Remember the last time shortid was called in case counter is needed.
var previousSeconds;

/**
 * Generate unique id
 * Returns string id
 */
function build(clusterWorkerId) {
    var str = '';

    var seconds = Math.floor((Date.now() - REDUCE_TIME) * 0.001);

    if (seconds === previousSeconds) {
        counter++;
    } else {
        counter = 0;
        previousSeconds = seconds;
    }

    str = str + generate(version);
    str = str + generate(clusterWorkerId);
    if (counter > 0) {
        str = str + generate(counter);
    }
    str = str + generate(seconds);
    return str;
}

module.exports = build;

},{"./alphabet":5,"./generate":7}],7:[function(require,module,exports){
'use strict';

var alphabet = require('./alphabet');
var random = require('./random/random-byte');
var format = require('nanoid/format');

function generate(number) {
    var loopCounter = 0;
    var done;

    var str = '';

    while (!done) {
        str = str + format(random, alphabet.get(), 1);
        done = number < (Math.pow(16, loopCounter + 1 ) );
        loopCounter++;
    }
    return str;
}

module.exports = generate;

},{"./alphabet":5,"./random/random-byte":10,"nanoid/format":2}],8:[function(require,module,exports){
'use strict';

var alphabet = require('./alphabet');
var build = require('./build');
var isValid = require('./is-valid');

// if you are using cluster or multiple servers use this to make each instance
// has a unique value for worker
// Note: I don't know if this is automatically set when using third
// party cluster solutions such as pm2.
var clusterWorkerId = require('./util/cluster-worker-id') || 0;

/**
 * Set the seed.
 * Highly recommended if you don't want people to try to figure out your id schema.
 * exposed as shortid.seed(int)
 * @param seed Integer value to seed the random alphabet.  ALWAYS USE THE SAME SEED or you might get overlaps.
 */
function seed(seedValue) {
    alphabet.seed(seedValue);
    return module.exports;
}

/**
 * Set the cluster worker or machine id
 * exposed as shortid.worker(int)
 * @param workerId worker must be positive integer.  Number less than 16 is recommended.
 * returns shortid module so it can be chained.
 */
function worker(workerId) {
    clusterWorkerId = workerId;
    return module.exports;
}

/**
 *
 * sets new characters to use in the alphabet
 * returns the shuffled alphabet
 */
function characters(newCharacters) {
    if (newCharacters !== undefined) {
        alphabet.characters(newCharacters);
    }

    return alphabet.shuffled();
}

/**
 * Generate unique id
 * Returns string id
 */
function generate() {
  return build(clusterWorkerId);
}

// Export all other functions as properties of the generate function
module.exports = generate;
module.exports.generate = generate;
module.exports.seed = seed;
module.exports.worker = worker;
module.exports.characters = characters;
module.exports.isValid = isValid;

},{"./alphabet":5,"./build":6,"./is-valid":9,"./util/cluster-worker-id":12}],9:[function(require,module,exports){
'use strict';
var alphabet = require('./alphabet');

function isShortId(id) {
    if (!id || typeof id !== 'string' || id.length < 6 ) {
        return false;
    }

    var nonAlphabetic = new RegExp('[^' +
      alphabet.get().replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&') +
    ']');
    return !nonAlphabetic.test(id);
}

module.exports = isShortId;

},{"./alphabet":5}],10:[function(require,module,exports){
'use strict';

var crypto = typeof window === 'object' && (window.crypto || window.msCrypto); // IE 11 uses window.msCrypto

var randomByte;

if (!crypto || !crypto.getRandomValues) {
    randomByte = function(size) {
        var bytes = [];
        for (var i = 0; i < size; i++) {
            bytes.push(Math.floor(Math.random() * 256));
        }
        return bytes;
    };
} else {
    randomByte = function(size) {
        return crypto.getRandomValues(new Uint8Array(size));
    };
}

module.exports = randomByte;

},{}],11:[function(require,module,exports){
'use strict';

// Found this seed-based random generator somewhere
// Based on The Central Randomizer 1.3 (C) 1997 by Paul Houle (houle@msc.cornell.edu)

var seed = 1;

/**
 * return a random number based on a seed
 * @param seed
 * @returns {number}
 */
function getNextValue() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed/(233280.0);
}

function setSeed(_seed_) {
    seed = _seed_;
}

module.exports = {
    nextValue: getNextValue,
    seed: setSeed
};

},{}],12:[function(require,module,exports){
'use strict';

module.exports = 0;

},{}],13:[function(require,module,exports){
(function (process){
var _nodejs = (
    typeof process !== 'undefined' && process.versions && process.versions.node);
if (_nodejs) {
    _nodejs = {
        version: process.versions.node
    };
}

var moment = require('moment');
var shortid = require('shortid');
var Query = require("query");

var CONSTANTS = {

    EVENT: {
        TYPE_RECURRING: 'recurring',
        TYPE_TERMINATING: 'terminating',
        ACTION: {
            TYPE_AUTORENEW: 'autorenew',
            TYPE_CONFIRM: 'confirm',
            TYPE_PROTOCOL: 'protocol'
        }
    },
    PROPERTY: {
        TYPE_SHORTTEXT: 'shortText',
        TYPE_LONGTEXT: 'longText',
        TYPE_INDEXEDTEXT: 'indexedText',
        TYPE_NUMBER: 'number',
        TYPE_DATE: 'date',
        TYPE_SHORTID: 'shortId',
        //TYPE_DURATION : 'duration',
        TYPE_REF_OBJ: 'objectRef',
        TYPE_REF_USR: 'userRef',
        TYPE_REF_FILE: 'fileRef',
        TYPE_PROPERTY_BAG: 'bag',
        TYPE_BOOLEAN: 'boolean',
        TYPE_ARRAY: 'array',
        TYPE_EVENT: 'event',
        TYPE_ACTION: 'action',
        TYPE_JSON: 'json'
    },

    MULTITENANCY: {
        ISOLATED: "isolated",
        SHARED: "shared"
    },
    TYPES: {
        SCHEDULED: 'scheduled',
        QUERIED: 'queried'
    }
}


/*
 * Default Mappers
 */

// SCHEDULED MAPPER

DefaultObserverMapper = function(SPOO, options) {
    this.type = (options || {}).type || CONSTANTS.TYPES.SCHEDULED;
    this.database = {};
    this.index = {};
    this.multitenancy = (options || {}).multitenancy || CONSTANTS.MULTITENANCY.ISOLATED;
}

DefaultObserverMapper.prototype.setMultiTenancy = function(value) {
    this.multitenancy = value;
};

DefaultObserverMapper.prototype.getDBByMultitenancy = function(client) {

    if (this.multitenancy == CONSTANTS.MULTITENANCY.ISOLATED) {
        if (!Array.isArray(this.database)) this.database = [];

        return this.database;
    } else if (this.multitenancy == CONSTANTS.MULTITENANCY.SHARED) {

        if (!this.database[client])
            throw new Error('no database for client ' + client);

        return this.database[client];
    }
};

DefaultObserverMapper.prototype.listTenants = function(success, error) {
    if (!this.database)
        return error('no database');


    success(Object.keys(this.database));
};


DefaultObserverMapper.prototype.getEvent = function(objId, propName, success, error, client) {

    var db = this.getDBByMultitenancy(client);

    if (!db[objId])
        return error('object not found: ' + objId);

    if (this.multitenancy == CONSTANTS.MULTITENANCY.ISOLATED)
        if (db[this.index[client][objId]].tenantId != client)
            error('object not found: ' + objId);

    success(db[this.index[client][objId]]);
}

DefaultObserverMapper.prototype.addEvent = function(objId, propName, event, success, error, client) {

    var self = this;

    if (!this.database[client])
        this.database[client] = [];

    if (!this.index[client]) this.index[client] = [];

    if (this.index[client][objId + ':' + propName])
        return error('object with taht id already exists: ' + objId);

    if (!this.index[client]) this.index[client] = {};

    var db = this.getDBByMultitenancy(client);

    if (this.multitenancy == CONSTANTS.MULTITENANCY.ISOLATED)
        event.tenantId = client;

    if (event.date) {
        var difference = Infinity;

        difference = moment().diff(event.date);

        db.push(setTimeout(function() {

            // @TODO: link to processor

        }, difference))
    } else if (event.interval) {

        var interval = Infinity; // @TODO: convert iso8601 duration to millis

        interval = moment.duration(event.interval).asMilliseconds()

        if (interval == 0) interval = Infinity;

        db.push(setInterval(function() {

            // @TODO: link to processor

            console.log(event.action);

            //self.processor.execute(dsl, obj, prop, data, callback, client, app, user, options);

        }, interval))
    }

    this.index[client][objId + ':' + propName] = db.length;

    success(event);

};

DefaultObserverMapper.prototype.removeEvent = function(objId, propName, success, error, client) {

    var db = this.getDBByMultitenancy(client);



    if (!this.index[client][objId + ':' + propName])
        return error('object not found: ' + objId + ':' + propName);



    /*if(this.multitenancy == CONSTANTS.MULTITENANCY.ISOLATED)
        if(this.index[client][objId + ':'+propName].tenantId != client) 
            return error('object not found: ' + objId + ':'+propName);*/

    console.log(this.index[client]);


    db.splice(this.index[client][objId + ':' + propName], 1);
    delete this.index[client][objId + ':' + propName];
    success('removed')

};


// Processor Mapper



DefaultProcessorMapper = function(SPOO) {
    this.SPOO = SPOO;
    this.multitenancy = CONSTANTS.MULTITENANCY.ISOLATED;
}

DefaultProcessorMapper.prototype.setMultiTenancy = function(value) {
    this.multitenancy = value;
};

DefaultProcessorMapper.prototype.execute = function(dsl, obj, prop, data, callback, client, app, user, options) {

    var SPOO = this.SPOO;

    if (this.multitenancy == CONSTANTS.MULTITENANCY.ISOLATED) {
        eval(dsl)
    } else {
        eval(dsl)
    }
}


// Storage Mapper


DefaultStorageMapper = function(options) {
    this.database = {};
    this.index = {};
    this.multitenancy = (options || {}).multitenancy || CONSTANTS.MULTITENANCY.DATABASE;
}

DefaultStorageMapper.prototype.connect = function(connectionString, success, error) {

}

DefaultStorageMapper.prototype.closeConnection = function(success, error) {

}

DefaultStorageMapper.prototype.setMultiTenancy = function(value) {
    this.multitenancy = value;
};

DefaultStorageMapper.prototype.createClient = function(client, success, error) {

    if (this.multitenancy == CONSTANTS.MULTITENANCY.DATABASE) {
        if (this.database[client])
            error('Client already exists')

        this.database[client] = [];
        this.index[client] = {};
        success()
    }
}

DefaultStorageMapper.prototype.getDBByMultitenancy = function(client) {

    if (this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER) {
        if (!Array.isArray(this.database)) this.database = [];

        return this.database;
    } else if (this.multitenancy == CONSTANTS.MULTITENANCY.DATABASE) {

        if (!this.database[client])
            error('no database for client ' + client);

        return this.database[client];
    }
};

DefaultStorageMapper.prototype.listClients = function(success, error) {
    if (!this.database)
        return error('no database');


    success(Object.keys(this.database));
};


DefaultStorageMapper.prototype.getObjById = function(id, success, error, app, client) {

    var db = this.getDBByMultitenancy(client);

    if (!db[id])
        return error('object not found: ' + id);

    if (this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER)
        if (db[this.index[client][id]].tenantId != client)
            error('object not found: ' + id);


    success(db[this.index[client][id]]);
}


DefaultStorageMapper.prototype.getObjsByCriteria = function(criteria, success, error, app, client, flags) {

    var db = this.getDBByMultitenancy(client);

    if (app)
        Object.assign(criteria, { applications: { $in: [app] } })

    if (this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER)
        Object.assign(criteria, { tenantId: client })

    success(Query.query(db, criteria));
}


DefaultStorageMapper.prototype.aggregateObjsByCriteria = function(aggregation, criteria, success, error, app, client, flags) {


    var db = this.getDBByMultitenancy(client);

    switch (aggregation) {
        case 'count':

            success(Query.query(db, criteria).length);

            break;
        default:
            error();
    }

}

DefaultStorageMapper.prototype.updateObj = function(spooElement, success, error, app, client) {

    var db = this.getDBByMultitenancy(client);

    if (!this.index[client][spooElement._id]);
    return error('object not found: ' + id);

    if (this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER)
        if (this.index[client][spooElement._id].tenantId != client)
            return error('object not found: ' + id);

    db[this.index[client][spooElement._id]] = spooElement;

    success(db[spooElement._id]);
};

DefaultStorageMapper.prototype.addObj = function(spooElement, success, error, app, client) {

    if (!this.database[client])
        this.database[client] = [];

    if (!this.index[client]) this.index[client] = [];

    if (this.index[client][spooElement._id])
        return error('object with taht id already exists: ' + id);
    if (!this.index[client]) this.index[client] = {};

    var db = this.getDBByMultitenancy(client);

    if (this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER)
        spooElement.tenantId = client;

    db.push(spooElement)
    this.index[client][spooElement._id] = db.length;

    success(spooElement);
};

DefaultStorageMapper.prototype.removeObj = function(spooElement, success, error, app, client) {

    var db = this.getDBByMultitenancy(client);

    if (!this.index[client][spooElement._id])
        return error('object not found: ' + spooElement._id);

    if (this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER)
        if (this.index[client][spooElement._id].tenantId != client)
            return error('object not found: ' + spooElement._id);


    db.splice(this.index[client][spooElement._id], 1);
    delete this.index[client][spooElement._id];
    success(spooElement)

};


function NoOnChangeException(message) {
    this.message = "onChange not found";
    this.name = 'NoOnChangeException';
}

function NoMetaException(message) {
    this.message = "meta not found";
    this.name = 'NoMetaException';
}

function NoOnDeleteException(message) {
    this.message = "onDelete not found";
    this.name = 'NoOnDeleteException';
}

function NoEventIdException(message) {
    this.message = "No Event ID provided";
    this.name = 'NoEventIdException';
}

function InvalidTypeException(message) {
    this.message = message + " is not a valid type";
    this.name = 'InvalidTypeException';
}

function InvalidValueException(value, type) {
    this.message = value + " is not valid. Type must be: " + type;
    this.name = 'InvalidValueException';
}

function InvalidFormatException() {
    this.message = "Invlid format";
    this.name = 'InvalidFormatException';
}

function DuplicatePropertyException(message) {
    this.message = "Property " + message + " already exists in this object";
    this.name = 'DuplicatePropertyException';
}

function DuplicateActionException(message) {
    this.message = "Action " + message + " already exists in this object";
    this.name = 'DuplicateActionException';
}

function DuplicateApplicationException(message) {
    this.message = "Application " + message + " already exists in this object";
    this.name = 'DuplicateApplicationException';
}

function NoSuchApplicationException(message) {
    this.message = "Application " + message + " does not exist in this object";
    this.name = 'NoSuchApplicationException';
}

function NoSuchReminderException(message) {
    this.message = "Reminder " + message + " does not exist in this event";
    this.name = 'NoSuchReminderException';
}

function DuplicateEventException(message) {
    this.message = "Event " + message + " already exists in this object";
    this.name = 'DuplicateEventException';
}

function NoSuchTemplateException(message) {
    this.message = "Template id " + message + " does not exist";
    this.name = 'NoSuchTemplateException';
}

function NotAnEventException(message) {
    this.message = "Property " + message + " is not an event";
    this.name = 'NotAnEventException';
}

function NoSuchObjectException(message) {
    this.message = "Object id " + message + " does not exist";
    this.name = 'NoSuchObjectException';
}

function NoSuchPropertyException(message) {
    this.message = "Property " + message + " does not exist in this object";
    this.name = 'NoSuchPropertyException';
}

function NoSuchEventException(message) {
    this.message = "Event " + message + " does not exist in this object";
    this.name = 'NoSuchEventException';
}

function PropertyNotFoundException(message) {
    this.message = "Property " + message + " does not exist in this object";
    this.name = 'PropertyNotFoundException';
}

function MissingAttributeException(message) {
    this.message = "Missing attibute " + message + " in this object";
    this.name = 'MissingAttributeException';
}

function CallbackErrorException(message) {
    this.message = message;
    this.name = 'CallbackErrorException';
}

function InvalidDateException(message) {
    this.message = message + " is not a valid date";
    this.name = 'InvalidDateException';
}

function InvalidActionException(message) {
    this.message = message + " is not a valid event action";
    this.name = 'InvalidActionException';
}

function InvalidDataTypeException(message, type) {
    this.message = message + " is not of type " + type;
    this.name = 'InvalidDataTypeException';
}

function NotATemplateExteptopn(message) {
    this.message = message + " is not a template";
    this.name = 'NotATemplateExteptopn';
}

function InvalidPrivilegeException(message) {
    this.message = "Invalid privileges format";
    this.name = 'InvalidPrivilegeException';
}

function NoSuchPrivilegeException(message) {
    this.message = "Privilege does not exist";
    this.name = 'NoSuchPrivilegeException';
}

function NoSuchPermissionException(message) {
    this.message = "Permission " + message + " does not exist";
    this.name = 'NoSuchPermissionException';
}

function InvalidPermissionException(message) {
    this.message = "Permission format invalid";
    this.name = 'InvalidPermissionException';
}

function InvalidEventIdException(message) {
    this.message = "Event ID format not valid: " + message;
    this.name = 'InvalidEventIdException';
}


function NoHandlerProvidedException(message) {
    this.message = "No handler provided " + message;
    this.name = 'NoHandlerProvidedException';
}

function HandlerExistsException(message) {
    this.message = "Handler " + message + " already exists";
    this.name = 'HandlerExistsException';
}

function HandlerNotFoundException(message) {
    this.message = "Handler " + message + " not found";
    this.name = 'HandlerNotFoundException';
}

function InvalidArgumentException(message) {
    this.message = "Invalid argument";
    this.name = 'InvalidArgumentException';
}

function InvalidHandlerException(message) {
    this.message = "Invalid handler";
    this.name = 'InvalidHandlerException';
}

function LackOfPermissionsException(message) {

    if (Array.isArray(message)) {
        var result = "No permissions to perform these operations: ";

        message.forEach(function(m) {
            result += "(" + m.name + ": " + m.key + ") ";
        })

        this.message = result;
        this.name = 'LackOfPermissionsException';
    } else {
        this.message = "No permissions to perform this operation";
        this.name = 'LackOfPermissionsException';
    }

}



var SPOO = {

    self: this,

    instance: this,

    activeTenant: null,

    activeUser: null,

    activeApp: null,

    handlerSequence: [],
    permissionSequence: [],
    eventAlterationSequence: [],

    tenant: function(tenant) {
        if (!tenant) throw new Error("No tenant specified");
        this.activeTenant = tenant;

        return this;
    },

    client: function(tenant) {
        if (!tenant) throw new Error("No tenant specified");
        this.activeTenant = tenant;

        return this;
    },

    user: function(user) {
        if (!user) throw new Error("No user specified");
        this.activeUser = user;

        return this;
    },

    app: function(app) {
        if (!app) throw new Error("No app specified");
        this.activeApp = app;

        return this;
    },


    checkPermissions: function(user, app, obj, permission, soft) {

        console.log("arguments p");
        console.log(arguments);
        console.log(privileges);
        var result = false;
        // if (privileges === undefined) result = false;

        if (!user) return true;

        var privileges = user.privileges;
        var permissions = obj.permissions;

        if (!privileges) {
            if (!soft) throw new LackOfPermissionsException();
            else return false;
        }


        if (app) {
            console.log("privofapp");
            console.log(app);
            console.log(privileges);
            if (privileges[app]) {
                var privArr = [];
                privileges[app].forEach(function(p) {
                    privArr.push(p.name);
                })
                privileges = privArr;
                console.log("PRIVILEGES CHECK");
                console.log(privileges);
            } else {
                if (!soft) throw new LackOfPermissionsException();
                else return false;
            }
        }


        if (permissions === undefined && privileges !== undefined) result = true;
        if (permissions !== undefined) {
            //if (!typeof privileges === 'array') result = false;
            console.log("PRIVVV");
            console.log(permissions);
            var i;
            for (i = 0; i < privileges.length; i++) {
                console.log("priv name: ");
                console.log(JSON.stringify(privileges[i]));
                if (permissions[privileges[i]]) {
                    //console.log("dsfdsfdsfdsfdsfdsf");
                    //console.log(permissions);
                    //var cloned = JSON.parse(JSON.stringify(permissions[privileges[i]]));
                    console.log("permissions[privileges[i]]");
                    console.log(permissions[privileges[i]]);

                    if (permissions[privileges[i]].hasOwnProperty('value')) {
                        if (permissions[privileges[i]].value == "*") return true;

                        if (permissions[privileges[i]].value.indexOf(permission) != -1) return true;
                    } else {
                        if (permissions[privileges[i]] == "*") return true;

                        if (permissions[privileges[i]].indexOf(permission) != -1) return true;
                    }



                    // if (permissions[privileges[i]].value.indexOf(permission) != -1) return true;
                }
            }

            try {
                if (permissions['*']) {
                    if (permissions['*'].hasOwnProperty('value')) {
                        if (permissions['*'].value == "*") return true;

                        if (permissions['*'].value.indexOf(permission) != -1) return true;
                    } else {
                        if (permissions['*'] == "*") return true;

                        if (permissions['*'].indexOf(permission) != -1) return true;
                    }
                }
            } catch (e) {

            }

        }

        if (Object.keys(permissions).length == 0) result = true;
        //console.log("perm length: " + Object.keys(permissions).length);
        //console.log(privileges + " " + permissions + " " + permission + " " + result);

        //console.log("res: " + result);

        if (result == false) {
            if (!soft) throw new LackOfPermissionsException();
            else return false;
        }
        return result;

    },

    chainPermission: function(obj, instance, code, name, key) {
        if (obj.permissions) {
            if (Object.keys(obj.permissions).length > 0) {
                if (!instance.permissionSequence[obj._id]) instance.permissionSequence[obj._id] = [];
                if (!SPOO.checkPermissions(instance.activeUser, instance.activeApp, obj, code, true))
                    instance.permissionSequence[obj._id].push({ name: name, key: key });
            }
        }
    },

    objectFamilies: [],

    getObjectFamilies: function() {
        return this.objectFamilies;
    },

    define: function(params) {

        if (!params.name || !params.pluralName) {
            throw new Error("Invalid arguments");
        }

        this[params.name] = function(obj) {

            if (params.authable) {
                obj.username = obj.username || null;
                obj.email = obj.email || null;
                obj.password = obj.password || null;
                obj.privileges = SPOO.PrivilegesChecker(obj) || {};
                obj.spooAdmin = obj.spooAdmin || false;

                obj.addPrivilege = function(privilege) {
                    new SPOO.PrivilegeChecker(obj, privilege);
                    return obj;
                };

                obj.setUsername = function(username) {
                    this.username = username;
                    SPOO.chainPermission(obj, this, 'o', 'setUsername', username);
                    return obj;
                }

                obj.setEmail = function(email) {
                    this.email = email;
                    SPOO.chainPermission(obj, this, 'h', 'setEmail', email);
                    return obj;
                }

                obj.setPassword = function(password) {
                    // should be encrypted at this point
                    this.password = password;
                    return obj;
                }

                obj.removePrivilege = function(privilege) {
                    new SPOO.PrivilegeRemover(obj, privilege);
                    return obj;
                };
            }

            return new SPOO.Obj(obj, params.name, this);
        }

        if (this.objectFamilies.indexOf(params.name) == -1) this.objectFamilies.push(params.name);

        this[params.pluralName] = function(objs) {

            if (!objs) throw new Error("No params defined");

            return new SPOO.Objs(objs, params.name, this);

        }

        if (params.persistence) this.plugInPersistenceMapper(params.name, params.persistence);

        if (params.processor) this.plugInProcessor(params.name, params.processor);

        if (params.observer) this.plugInObserver(params.name, params.observer);

        if (params.backend) {
            this.plugInPersistenceMapper(params.name, params.backend.persistence);
            this.plugInProcessor(params.name, params.backend.processor);
            this.plugInObserver(params.name, params.backend.observer);
        }

        return this[params.name];
    },

    ObjectFamily: function(params) {
        return this.define(params);
    },

    mappers: {},

    getPersistenceMapper: function(family) {
        if (!this.mappers[family]) throw new Error("No such Object Family");
        return this.mappers[family];
    },

    plugInPersistenceMapper: function(name, mapper) {
        if (!name) throw new Error("No mapper name provided");
        this.mappers[name] = mapper;
    },

    processors: {},

    plugInProcessor: function(name, processor) {
        if (!name) throw new Error("No mapper name provided");
        this.processors[name] = processor;
    },

    observers: {},

    plugInObserver: function(name, observer) {
        if (!name) throw new Error("No mapper name provided");
        this.observers[name] = observer;
    },

    ConditionsChecker: function(property, value) {


        if (property.hasOwnProperty('conditions')) {

            //new ConditionEngine(undefined, property, undefined, value).execute(property.conditions);
        }
    },

    execProcessorAction: function(dsl, obj, prop, data, callback, client, options) {

        if (!this.processors[obj.role])
            return defaultMappers.processor.execute(dsl, obj, prop, data, callback, client, this.instance.activeUser, options); //throw new Error("No Processor registered");

        this.processors[obj.role].execute(dsl, obj, prop, data, callback, client, this.instance.activeUser, options);
    },

    getElementPermisson: function(element) {

        if (!element) return {};
        else if (!element.permissions) return {};
        else return element.permissions;
    },

    getTemplateFieldsForObject: function(obj, templateId, success, error, client) {

        this.getTemplateById(templateId, function(template) {

                if (!template) {
                    error('no such template');
                    return;
                }

                if (template.type) {
                    if (!obj.type) obj.type = template.type;
                }

                if (template.onCreate) {
                    if (!obj.onCreate) obj.onCreate = template.onCreate;
                    if (!obj.onCreateOverwritten) {
                        if (!obj.onCreate) obj.onCreate = template.onCreate;
                    }
                }



                if (template.onDelete) {
                    if (!obj.onDelete) obj.onDelete = template.onDelete;
                    if (!obj.onDeleteOverwritten) {
                        if (!obj.onDelete) obj.onDelete = template.onDelete;
                    }
                }

                var propertyKeys = Object.keys(template.properties);

                var derievedProps = {};
                propertyKeys.forEach(function(property) {
                    if (!obj.properties.hasOwnProperty(property)) {

                        template.properties[property].template = templateId;

                        if (template.properties[property].overwritten) delete template.properties[property].overwritten;

                        var cloned = JSON.parse(JSON.stringify(template.properties[property]));

                        obj.properties[property] = cloned;

                    } else {
                        obj.properties[property].template = templateId;
                        obj.properties[property].overwritten = true;

                        if (!obj.properties[property].overwrittenOnCreate) {
                            if (!obj.properties[property].onCreate) obj.properties[property].onCreate = template.properties[property].onCreate;
                        }
                        if (!obj.properties[property].overwrittenOnChange) {
                            if (!obj.properties[property].onChange) obj.properties[property].onChange = template.properties[property].onChange;
                        }
                        if (!obj.properties[property].overwrittenOnDelete) {
                            if (!obj.properties[property].onDelete) obj.properties[property].onDelete = template.properties[property].onDelete;
                        }
                        if (!obj.properties[property].overwrittenMeta) {
                            if (!obj.properties[property].meta) obj.properties[property].meta = template.properties[property].meta;
                        }

                        function getBagProperties(objBag, tmplBag) {


                            if (!objBag) {
                                objBag = {};
                                objBag[Object.keys(tmplBag)[0]] = tmplBag;


                            } else {
                                if (!objBag.overwritten) {
                                    if (objBag.permissions) objBag.permissions = Object.assign(objBag.permissions, tmplBag.permissions);
                                    else objBag.permissions = tmplBag.permissions;
                                }

                            }

                            objBag.template = template._id;



                            if (!objBag.overwrittenOnCreate) objBag.onCreate = tmplBag.onCreate;
                            if (!objBag.overwrittenOnChange) objBag.onChange = tmplBag.onChange;
                            if (!objBag.overwrittenOnDelete) objBag.onDelete = tmplBag.onDelete;
                            if (!objBag.overwrittenMeta) objBag.onDelete = tmplBag.meta;

                            if (objBag.type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG && tmplBag.type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {

                                var templateInnerKeys = Object.keys(tmplBag.properties);
                                templateInnerKeys.forEach(function(templKey) {


                                    var hasProp = false;
                                    var innerPropKeys = Object.keys(objBag.properties);
                                    innerPropKeys.forEach(function(objKey) {
                                        if (templKey == objKey) hasProp = true;
                                    })

                                    if (!hasProp) {


                                        objBag.properties[templKey] = tmplBag.properties[templKey];
                                        objBag.properties[templKey].template = template._id;
                                    } else {
                                        if (objBag.properties[templKey].value === undefined && tmplBag.properties[templKey].hasOwnProperty('value')) {
                                            if (objBag.properties[templKey].triggered) tmplBag.properties[templKey].triggered = objBag.properties[templKey].triggered;
                                            objBag.properties[templKey] = tmplBag.properties[templKey];
                                            objBag.properties[templKey].template = template._id;
                                        }


                                    }


                                    if (tmplBag.properties[templKey].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG)
                                        getBagProperties(objBag.properties[templKey], tmplBag.properties[templKey])
                                    else objBag.properties[templKey].template = template._id;

                                })

                            } else {
                                objBag.template = template._id;
                            }
                        }

                        getBagProperties(obj.properties[property], template.properties[property]);



                    }
                });



                if (template.applications)
                    if (Array.isArray(template.applications)) {

                        if (!obj.applications) obj.applications = [];

                        template.applications.forEach(function(app) {

                            if (obj.applications.indexOf(app) == -1) obj.applications.push(app);
                        })
                    }

                var permissionKeys = Object.keys(template.permissions);
                var derievedPermissions = {};
                permissionKeys.forEach(function(permission) {
                    if (!obj.permissions.hasOwnProperty(permission)) {
                        template.permissions[permission].template = templateId;
                        var cloned = JSON.parse(JSON.stringify(template.permissions[permission]));
                        obj.permissions[permission] = cloned;
                    }
                });


                var privilegeAppKeys = Object.keys(template.privileges);
                var derievedPrivileges = {};
                if (!obj.privileges) obj.privileges = {};


                privilegeAppKeys.forEach(function(tApp) {


                    if (!obj.privileges[tApp]) obj.privileges[tApp] = [];

                    var j;
                    for (j = 0; j < template.privileges[tApp].length; j++) {
                        var contains = false;
                        var i;
                        for (i = 0; i < obj.privileges[tApp].length; i++) {
                            if (obj.privileges[tApp][i].name == template.privileges[tApp][j].name) contains = true;
                        }
                        if (!contains) {
                            obj.privileges[tApp].push(Object.assign({ template: templateId }, template.privileges[tApp][j]));
                        }
                    }
                })



                success();
            },
            function(err) {

                error(err);
            }, {}, client)

    },

    ID: function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,;-_"; // NO DOT!!! 

        for (var i = 0; i < 25; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },

    RANDOM: function(amount) {
        return shortid.generate();
    },

    removeTemplateFieldsToObject: function(obj, templateId) {
        this.getTemplateAsyn(templateId, function(template) {
                var propertyKeys = Object.keys(template.properties);
                propertyKeys.forEach(function(property) {
                    if (obj.properties[property] === undefined) {
                        this.removeTemplateFieldFromObjects(obj.template.properties[property])
                    }
                })
            },
            function(error) {

            })
    },

    addTemplateToObject: function(obj, templateId, instance) {
        var contains = false;
        obj.inherits.forEach(function(templ) {
            if (templ == templateId) contains = true;
        });
        if (!contains) {
            obj.inherits.push(templateId);
            SPOO.chainPermission(obj, instance, 'i', 'addInherit', templateId);
        }

    },

    addApplicationToObject: function(obj, application, instance) {
        var contains = false;
        obj.applications.forEach(function(app) {
            if (app == application) contains = true;
        });
        if (!contains) {

            obj.applications.push(application);
            SPOO.chainPermission(obj, instance, 'a', 'addApplication', application);

        } else throw new DuplicateApplicationException(application);

    },

    removeApplicationFromObject: function(obj, application, instance) {
        var contains = false;
        obj.applications.forEach(function(app, i) {
            if (app == application) {
                obj.applications.splice(i, 1);
                contains = true;
                return;
            }
        });

        SPOO.chainPermission(obj, instance, 'a', 'removeApplication', application);

        if (!contains) {
            throw new NoSuchApplicationException(application);
        }
    },

    removeTemplateFromObject: function(obj, templateId, success, error, instance) {
        var contains = false;
        obj.inherits.forEach(function(templ) {
            if (templ == templateId) contains = true;
        });

        if (contains) {
            var propKeys = Object.keys(obj.properties);
            var i;
            for (i = 0; i < propKeys.length; i++) {
                console.log("properties inherit");
                console.log(obj.properties[propKeys[i]] + ' . ' + templateId);
                if (obj.properties[propKeys[i]].template == templateId) delete obj.properties[propKeys[i]];
            }


            var permissionKeys = Object.keys(obj.permissions);
            var i;
            for (i = 0; i < permissionKeys.length; i++) {
                console.log("permissions inherit");
                console.log(obj.permissions[permissionKeys[i]] + ' . ' + templateId);
                if (obj.permissions[permissionKeys[i]].template == templateId) delete obj.permissions[permissionKeys[i]];
            }

            var i;
            for (i = 0; i < obj.inherits.length; i++) {
                if (obj.inherits[i] == templateId) obj.inherits.splice(i, 1);
            }

            SPOO.chainPermission(obj, instance, 'i', 'removeInherit', templateId);

            success(obj);
        } else {
            error('Template not found in object');
        }
    },

    remove: function(obj, success, error, app, client) {

        this.removeObject(obj, success, error, app, client);

    },

    removeObject: function(obj, success, error, app, client) {

        var self = this;

        if (!this.mappers[obj.role]) {
            return defaultMappers.persistence.removeObj(obj, function(data) {
                success(data);


            }, function(err) {
                error(err);
            }, app, client);
        }


        this.mappers[obj.role].removeObj(obj, function(data) {

            success(data);



        }, function(err) {
            error('Error - Could not remove object');
        }, app, client);
    },

    add: function(obj, success, error, app, client) {

        var propKeys = Object.keys(obj.properties);

        propKeys.forEach(function(property) {

            if (property.template) delete property;

            if (property.type == CONSTANTS.PROPERTY.TYPE_SHORTID) {
                if (property.value == '' && !property.value)
                    property.value = SPOO.RANDOM();
            }

        })

        this.addObject(obj, success, error, app, client);

    },

    addObject: function(obj, success, error, app, client) {

        if (!this.mappers[obj.role]) {
            return defaultMappers.persistence.addObj(obj, function(data) {
                success(data);

            }, function(err) {
                error(err);
            }, app, client);
        }

        this.mappers[obj.role].addObj(obj, function(data) {
            success(data);

        }, function(err) {
            error('Error - Could not add object');
        }, app, client);

    },


    updateO: function(obj, success, error, client) {
        var propKeys = Object.keys(obj.properties);


        propKeys.forEach(function(property) {
            {
                if (obj.properties[property].template) {

                    if (!obj.properties[property].overwrittenOnCreate) delete obj.properties[property].onCreate;
                    if (!obj.properties[property].overwrittenOnChange) delete obj.properties[property].onChange;
                    if (!obj.properties[property].overwrittenOnDelete) delete obj.properties[property].onDelete;
                    if (!obj.properties[property].meta) delete obj.properties[property].meta;
                    if (!obj.properties[property].overwritten) delete obj.properties[property];
                }
            }
        })

        if (obj.privileges) {
            var appKeys = Object.keys(obj.privileges);
            appKeys.forEach(function(app) {

                var k;
                for (k = 0; k < obj.privileges[app].length; k++) {

                }

                if (obj.privileges[app].length == 0) delete obj.privileges[app];
            })
        }

        this.updateObject(obj, success, error, client);


        // ADD TENANT AND APPLICATION!!!
    },

    updateObject: function(obj, success, error, client) {

        if (!this.mappers[obj.role]) {
            return defaultMappers.persistence.updateObj(obj, function(data) {
                success(data);

            }, function(err) {
                error('Error - Could not add object');
            }, client);
        }

        this.mappers[obj.role].updateObj(obj, function(data) {
            success(data);

        }, function(err) {
            error('Error - Could not update object');
        }, client);
    },

    getObjectById: function(role, id, success, error, app, client) {

        if (!this.mappers[role]) {
            return defaultMappers.persistence.getObjById(id, function(data) {
                success(data);

            }, function(err) {
                error('Error - Could not add object');
            }, app, client);
        }

        this.mappers[role].getObjById(id, function(data) {

            //console.log("---" + data)

            if (data == null) {
                error('Error - object not found');
                return;
            }

            success(data);



        }, function(err) {
            error('Error - Could get object: ' + err);
        }, app, client);
    },

    findObjects: function(criteria, role, success, error, app, client, flags) {


        var templatesCache = [];
        var objectsCache = [];

        if (!this.mappers[role]) {
            return defaultMappers.persistence.getObjsByCriteria(criteria, function(data) {
                success(data);

            }, function(err) {
                error(err);
            }, app, client, flags);
        }


        this.mappers[role].getObjsByCriteria(criteria, function(data) {
            var counter = 0;
            var num = data.length;
            if (num == 0) success([]);

            success(data);


            /*data.forEach(function(obj, i) {

                counter++;
                if (counter == data.length) success(data);

                /*new SPOO.Obj(obj).get(function(ob) {
                        counter++;
                        data[i] = ob

                        if (counter == data.length) success(data);
                    },
                    function(err) {
                        error(err);
                    }, client);*
            })*/


        }, function(err) {
            error('Error - Could get object: ' + err);
        }, app, client, flags);
    },

    findAllObjects: function(role, criteria, success, error, client, flags) {
        this.findObjects(role, criteria, success, error, client, flags, true);
    },


    PropertyRefParser: function(obj, propertyName, success, error) {
        var allProperties = obj.getProperties();

        try {
            propertyToReturn = allProperties[propertyName];
        } catch (e) {

        }

        if (!propertyToReturn) throw new PropertyNotFoundException(propertyName);

        if (!propertyToReturn.type == 'objectRef') throw new PropertyNotFoundException(propertyName);


        return SPOO.getObjectByIdSyn(propertyToReturn.value);


    },

    EventParser: function(obj, eventName) {
        var allEvents = obj.events;
        var thisRef = this;

        var eventToReturn;

        function getValue(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                getValue(obj.events[access.shift()], access);
            } else {

                try {
                    var t = obj.events[access[0]].type;
                } catch (e) {
                    throw new NoSuchEventException(propertyName);
                }

                eventToReturn = obj.events[access[0]];
            }
        }

        getValue(obj, eventName);

        return eventToReturn;


    },


    PropertyBagItemQueryRemover: function(obj, propertyName) {
        var allProperties = obj.properties;
        var thisRef = this;


        var propertyToReturn;

        function removeQuery(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                removeQuery(obj.properties[access.shift()], access);
            } else {


                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }

                if (!obj.properties[access[0]].query) throw new NoSuchPermissionException(permissionKey);


                delete obj.properties[access[0]].query;
                return;
            }
        }

        removeQuery(obj, propertyName);

    },


    PropertyBagItemConditionsRemover: function(obj, propertyName) {
        var allProperties = obj.properties;
        var thisRef = this;


        var propertyToReturn;

        function removeConditions(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                removeConditions(obj.properties[access.shift()], access);
            } else {


                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }

                if (!obj.properties[access[0]].conditions) throw new NoSuchPermissionException(permissionKey);


                delete obj.properties[access[0]].conditions;
                return;
            }
        }

        removeConditions(obj, propertyName);

    },


    PropertyBagItemOnChangeRemover: function(obj, propertyName, name) {
        var allProperties = obj.properties;
        var thisRef = this;

        var propertyToReturn;

        function removeOnChange(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                removeOnChange(obj.properties[access.shift()], access);
            } else {


                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }

                if (!obj.properties[access[0]].onChange[name]) throw new HandlerNotFoundException(name);

                delete obj.properties[access[0]].onChange[name];
                return;
            }
        }

        removeOnChange(obj, propertyName);

    },

    PropertyBagItemMetaRemover: function(obj, propertyName) {
        var allProperties = obj.properties;
        var thisRef = this;

        var propertyToReturn;

        function removeOnChange(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                removeOnChange(obj.properties[access.shift()], access);
            } else {


                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }

                if (!obj.properties[access[0]].meta) throw new NoSuchPermissionException(permissionKey);

                delete obj.properties[access[0]].meta;
                return;
            }
        }

        removeOnChange(obj, propertyName);

    },

    PropertyBagItemOnCreateRemover: function(obj, propertyName, handlerName) {
        var allProperties = obj.properties;
        var thisRef = this;

        var propertyToReturn;

        function removeOnCreate(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                removeOnCreate(obj.properties[access.shift()], access);
            } else {

                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }

                if (!obj.properties[access[0]].onCreate) throw new HandlerNotFoundException();
                if (!obj.properties[access[0]].onCreate[handlerName]) throw new HandlerNotFoundException();

                delete obj.properties[access[0]].onCreate[handlerName];
                return;
            }
        }

        removeOnCreate(obj, propertyName);

    },

    PropertyBagItemOnDeleteRemover: function(obj, propertyName, name) {
        var allProperties = obj.properties;
        var thisRef = this;

        var propertyToReturn;

        function removeOnDelete(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                removeOnDelete(obj.properties[access.shift()], access);
            } else {

                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }

                if (!obj.properties[access[0]].onDelete[name]) throw new HandlerNotFoundException(name);

                delete obj.properties[access[0]].onDelete[name];
                return;
            }
        }

        removeOnDelete(obj, propertyName);

    },


    PropertyBagItemPermissionRemover: function(obj, propertyName, permissionKey, instance) {
        var allProperties = obj.properties;
        var thisRef = this;



        var propertyToReturn;

        function removePermission(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                removePermission(obj.properties[access.shift()], access);
            } else {


                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }
                console.log(obj.properties[access[0]]);
                console.log(obj.properties[access[0]].permissions);
                console.log(permissionKey);
                console.log(obj.properties[access[0]].permissions[permissionKey]);

                if (!obj.properties[access[0]].permissions) throw new NoSuchPermissionException(permissionKey);
                if (!obj.properties[access[0]].permissions[permissionKey]) throw new NoSuchPermissionException(permissionKey);

                SPOO.chainPermission(obj, instance, 'x', 'removePropertyPermission', propertyName)

                delete obj.properties[access[0]].permissions[permissionKey];
                return;
            }
        }

        removePermission(obj, propertyName);

    },

    PropertyBagItemRemover: function(obj, propertyName, instance) {
        var allProperties = obj.properties; //obj.getProperties();
        var thisRef = this;


        var propertyToReturn;

        function getValue(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                getValue(obj.properties[access.shift()], access);
            } else {


                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }


                if (obj.properties[access[0]].onDelete) {
                    if (Object.keys(obj.properties[access[0]].onDelete).length > 0) {
                        if (!instance.handlerSequence[obj._id]) instance.handlerSequence[obj._id] = {};
                        if (!instance.handlerSequence[obj._id].onDelete) instance.handlerSequence[obj._id].onDelete = [];
                        instance.handlerSequence[obj._id].onDelete.push(obj.properties[access[0]].onDelete);
                    }
                }


                SPOO.chainPermission(obj.properties[access[0]], instance, 'd', 'removeProperty', propertyName);

                delete obj.properties[access[0]];

                return;
            }
        }

        getValue(obj, propertyName);

    },

    PropertyParser: function(obj, propertyName) {
        var allProperties = obj.properties;
        var thisRef = this;

        var propertyToReturn;

        function getValue(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                getValue(obj.properties[access.shift()], access);
            } else {

                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }

                propertyToReturn = obj.properties[access[0]];
            }
        }

        getValue(obj, propertyName);

        console.log(thisRef);

        if (propertyToReturn.type == "action") {
            propertyToReturn.call = function(callback, client) {
                thisRef.execProcessorAction(propertyToReturn.value, obj, propertyToReturn, {}, callback, client, {});
            }
        }

        return propertyToReturn;

    },


    ValuePropertyMetaSubstituter: function(property) {
        if (typeof property !== 'undefined')
            if (typeof property.value === 'undefined') property.value = null;
    },


    ActionCreateWrapper: function(obj, action, client) {
        console.debug(obj);
        console.log("pppa");
        console.debug(action);

        action = Object.assign({}, action);

        if (typeof action !== 'object') throw new InvalidFormatException();
        var actionKey = Object.keys(action)[0];

        try {
            existing = obj.actions[actionKey]
            console.debug(obj.actions);
            console.debug(action);
        } catch (e) {}

        if (existing) throw new DuplicateActionException(actionKey);
    },



    PropertyCreateWrapper: function(obj, property, isBag, instance) {

        property = Object.assign({}, property);


        var propertyKey = Object.keys(property)[0];

        if (typeof property !== 'object') {
            throw new InvalidFormatException();
            //obj.properties[propertyKey] = property[propertyKey];
            //return;
        }






        try {
            existing = obj.properties[propertyKey]

        } catch (e) {}

        /*iif (!property[propertyKey].type) {

            obj.properties[propertyKey] = property[propertyKey];

           

            f (typeof property[propertyKey].value === 'string') {
                if (property[propertyKey].value.length <= 255) property[propertyKey].type = CONSTANTS.PROPERTY.TYPE_SHORTTEXT;
                else property[propertyKey].type = CONSTANTS.PROPERTY.TYPE_LONGTEXT;
            } else if (typeof property[propertyKey].value === 'boolean')
                property[propertyKey].type = CONSTANTS.PROPERTY.TYPE_BOOLEAN;
            else property[propertyKey].type = CONSTANTS.PROPERTY.TYPE_SHORTTEXT;
        }*/


        if (existing) throw new DuplicatePropertyException(propertyKey);

        //console.debug(property);
        switch (property[propertyKey].type) {
            case undefined:
                obj.properties[propertyKey] = property[propertyKey];
                break;

            case CONSTANTS.PROPERTY.TYPE_SHORTTEXT:
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_LONGTEXT:
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_INDEXEDTEXT:
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_JSON:
                if (property[propertyKey].value) {
                    if (typeof property[propertyKey].value === 'string') {
                        try {
                            obj.properties[propertyKey].value = JSON.parse(obj.properties[propertyKey].value);
                        } catch (e) {
                            //throw new InvalidValueException(property[propertyKey].value, CONSTANTS.PROPERTY.TYPE_JSON);
                        }
                    } else {

                    }
                }
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_NUMBER:
                if (property[propertyKey].value != '') {
                    if (property[propertyKey].value != null)
                        if (isNaN(property[propertyKey].value)) throw new InvalidValueException(property[propertyKey].value, CONSTANTS.PROPERTY.TYPE_NUMBER);
                }
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

                /*
            case CONSTANTS.PROPERTY.TYPE_ARRAY:
                if (!Array.isArray(property[propertyKey].value)) throw new InvalidValueException(property[propertyKey].value, CONSTANTS.PROPERTY.TYPE_ARRAY);
                obj.properties[propertyKey] = property[propertyKey];
                break;
*/
            case CONSTANTS.PROPERTY.TYPE_EVENT:

                var _event = {};
                var eventKey = propertyKey;
                _event[eventKey] = property[propertyKey];

                if (!_event[eventKey].eventId) _event[eventKey].eventId = SPOO.ID();

                if (!_event[eventKey].reminders) _event[eventKey].reminders = {};


                if (_event[eventKey].interval !== undefined) {

                    if (_event[eventKey].lastOccurence == undefined) _event[eventKey].lastOccurence = null;
                    else if (!moment(_event[eventKey].lastOccurence).isValid()) throw new InvalidDateException(_event[eventKey].lastOccurence);
                    else _event[eventKey].lastOccurence = moment(_event[eventKey].lastOccurence).format();



                    if (_event[eventKey].nextOccurence == undefined)
                        _event[eventKey].nextOccurence = null;

                    if (_event[eventKey].action === undefined) _event[eventKey].action = '';


                    if (_event[eventKey].interval === undefined) throw new MissingAttributeException('interval');

                    _event[eventKey].nextOccurence = moment(_event[eventKey].lastOccurence).add(_event[eventKey].interval)

                    instance.eventAlterationSequence.push({ operation: 'add', obj: obj, propName: propertyKey, property: property, date: _event[eventKey].nextOccurence })


                } else if (_event[eventKey].date !== undefined) {


                    if (_event[eventKey].date == null) _event[eventKey].date = moment().toISOString();

                    if (!_event[eventKey].date) throw new MissingAttributeException('date');

                    try {
                        _event[eventKey].date = moment(_event[eventKey].date).format();
                    } catch (e) {

                    }

                    instance.eventAlterationSequence.push({ operation: 'add', obj: obj, propName: propertyKey, property: property, date: _event[eventKey].date })


                    if (!_event[eventKey].action) _event[eventKey].action = '';
                } else {
                    //throw new InvalidTypeException("No interval or date provided");
                }

                obj.properties[propertyKey] = _event[eventKey];
                break;

            case CONSTANTS.PROPERTY.TYPE_DATE:
                if (!property[propertyKey].value || property[propertyKey].value == '') property[propertyKey].value = null;
                //else property[propertyKey].value = property[propertyKey];
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;


            case CONSTANTS.PROPERTY.TYPE_SHORTID:
                if (!property[propertyKey].value || property[propertyKey].value == '') property[propertyKey].value = SPOO.RANDOM();
                if (obj.role == 'template') property[propertyKey].value = null;
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_REF_OBJ:


                // FOR NOW: no checking for existing object, since callback!!!
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_REF_USR:



                // FOR NOW: no checking for existing object, since callback!!!
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_REF_FILE:



                // FOR NOW: no checking for existing object, since callback!!!
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG:

                if (!property[propertyKey].properties) property[propertyKey].properties = {};

                var innerProperties = property[propertyKey].properties;

                var propertyKeys = Object.keys(innerProperties);
                console.debug(propertyKeys);
                parentProp = property;

                obj.properties[propertyKey] = property[propertyKey];
                obj.properties[propertyKey].type = CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG;
                obj.properties[propertyKey].properties = {};



                propertyKeys.forEach(function(property) {
                    tmpProp = {};
                    tmpProp[property] = innerProperties[property];

                    new SPOO.PropertyCreateWrapper(obj.properties[propertyKey], Object.assign({}, tmpProp), true, instance);
                })

                break;

            case CONSTANTS.PROPERTY.TYPE_ARRAY:

                if (!property[propertyKey].properties) property[propertyKey].properties = {};

                var innerProperties = property[propertyKey].properties;

                var propertyKeys = Object.keys(innerProperties);
                console.debug(propertyKeys);
                parentProp = property;

                obj.properties[propertyKey] = { type: CONSTANTS.PROPERTY.TYPE_ARRAY, properties: {}, query: property[propertyKey].query, meta: property[propertyKey].meta };


                propertyKeys.forEach(function(property) {
                    tmpProp = {};
                    tmpProp[property] = innerProperties[property];

                    new SPOO.PropertyCreateWrapper(obj.properties[propertyKey], Object.assign({}, tmpProp), true, instance);
                })

                break;

            case CONSTANTS.PROPERTY.TYPE_BOOLEAN:
                if (!typeof property[propertyKey].value === 'boolean') throw new InvalidValueException(property[propertyKey].value, CONSTANTS.PROPERTY.TYPE_BOOLEAN);
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_ACTION:

                if (property[propertyKey].value) {
                    if (typeof property[propertyKey].value !== 'string') throw new InvalidValueException(property[propertyKey].value, CONSTANTS.PROPERTY.TYPE_ACTION);
                }

                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            default:
                throw new InvalidTypeException(property[propertyKey].type);
        }

        if (property[propertyKey].onCreate) {
            if (Object.keys(property[propertyKey].onCreate).length > 0) {
                if (!instance.handlerSequence[obj._id]) instance.handlerSequence[obj._id] = {};
                if (!instance.handlerSequence[obj._id].onCreate) instance.handlerSequence[obj._id].onCreate = [];
                instance.handlerSequence[obj._id].onCreate.push({ handler: property[propertyKey].onCreate, prop: property[propertyKey] });
            }
        }


        SPOO.chainPermission(obj, instance, 'p', 'addProperty', propertyKey);

        /*if(obj.permissions) {
            if(Object.keys(obj.permissions).length > 0)  {
                if(!instance.permissionSequence[obj._id]) instance.permissionSequence[obj._id] = [];
                    if(!SPOO.checkPermissions(instance.activeUser, instance.activeApp, obj, 'p', true))
                        instance.permissionSequence[obj._id].push({name:'addProperty', key: propertyKey});
            }
        */

    },


    EventSetWrapper: function(obj, _event, fieldKey, newValue) {
        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setValue(obj.events[_event][access.shift()], access, value);
            } else {

                if (obj.events[_event] === undefined) throw new NoSuchEventException(_event);

                try {
                    var t = obj.events[_event][access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(fieldKey);
                }
                obj.events[_event][access[0]] = newValue;
            }
        }

        setValue(obj, fieldKey, newValue);
    },


    EventCreateWrapper: function(obj, _event) {

        if (typeof _event !== 'object') throw new InvalidFormatException();
        var eventKey = Object.keys(_event)[0];
        try {
            existing = obj.events[eventKey]
            console.debug(obj.events);
            console.debug(_event);
        } catch (e) {}

        if (existing) throw new DuplicateEventException(eventKey);

        if (!_event[eventKey]._id) _event[eventKey]._id = SPOO.ID();

        switch (_event[eventKey].type) {
            case CONSTANTS.EVENT.TYPE_RECURRING:
                if (_event[eventKey].lastOccurence == undefined) _event[eventKey].lastOccurence = null;
                else if (!moment(_event[eventKey].lastOccurence).isValid()) throw new InvalidDateException(_event[eventKey].lastOccurence);
                else _event[eventKey].lastOccurence = moment(_event[eventKey].lastOccurence).format();

                if (_event[eventKey].action === undefined) _event[eventKey].action = 'confirm';

                if (_event[eventKey].interval === undefined) throw new MissingAttributeException('interval');

                _event[eventKey].interval = moment.duration(_event[eventKey].interval);

                switch (_event[eventKey].action) {
                    case CONSTANTS.EVENT.ACTION.TYPE_AUTORENEW:

                        break;
                    case CONSTANTS.EVENT.ACTION.TYPE_CONFIRM:

                        break;
                    default:
                        throw new InvalidActionException(_event[eventKey].action);
                        break;
                }

                obj.events[eventKey] = _event[eventKey];
                break;
            case CONSTANTS.EVENT.TYPE_TERMINATING:
                if (_event[eventKey].date === undefined) throw new MissingAttributeException('date');
                if (!moment(_event[eventKey].date).isValid()) throw new InvalidDateException(_event[eventKey].date);
                _event[eventKey].date = moment(_event[eventKey].date).format();
                if (_event[eventKey].action === undefined) _event[eventKey].action = 'deactivate';
                obj.events[eventKey] = _event[eventKey];
                break;
            default:
                throw new InvalidTypeException(_event.type);
        }


    },


    EventLogTemplatesCreateWrapper: function(obj, template) //addTemplateToObject!!!
    {
        var existing = false;
        obj.inherits.forEach(function(_template) {
            if (_template == template) existing = true;
        })
        if (!existing) {
            obj.inherits.push(template);

        }
    },

    TemplatesCreateWrapper: function(obj, template) //addTemplateToObject!!!
    {
        var existing = false;
        obj.inherits.forEach(function(_template) {
            if (_template == template) existing = true;
        })
        if (!existing) {
            obj.inherits.push(template);

        }
    },


    ObjectPermissionsCreateWrapper: function(obj, permissions) //addTemplateToObject!!!
    {
        if (!typeof permissions == 'object') throw new InvalidPermissionException();

        if (!permissions) return {};

        var permissionKeys = Object.keys(permissions);
        permissionKeys.forEach(function(permission) {
            //if (!typeof permissions[permission] == 'string') throw new InvalidPermissionException();
            if (typeof permissions[permission] == 'string') {
                permissions[permission] = { value: permissions[permission] };
            } else {
                permissions[permission] = permissions[permission];
            }
        })
        return permissions;
    },

    ObjectOnCreateSetWrapper: function(obj, name, onCreate, trigger, type, instance) {
        //if (!typeof onchange == 'object') throw new InvalidPermissionException();

        if (!onCreate) throw new InvalidHandlerException();

        if (obj.onCreate[name]) throw new HandlerExistsException(name);

        if (!name) name = SPOO.RANDOM();

        if (!obj.onCreate[name]) obj.onCreate[name] = {}

        obj.onCreate[name].value = onCreate;
        obj.onCreate[name].trigger = trigger || 'after';
        obj.onCreate[name].type = type || 'async';

        if (obj.onCreate[name].templateId) obj.onCreate[name].overwritten = true;

        SPOO.chainPermission(obj, instance, 'v', 'setOnCreateHandler', name);

        return onCreate;
    },

    ObjectOnChangeSetWrapper: function(obj, name, onChange, trigger, type, instance) {
        //if (!typeof onchange == 'object') throw new InvalidPermissionException();

        if (!onChange) throw new InvalidHandlerException();

        if (obj.onChange[name]) throw new HandlerExistsException(name);

        if (!name) name = SPOO.RANDOM();

        if (!obj.onChange[name]) obj.onChange[name] = {}

        obj.onChange[name].value = onChange;
        obj.onChange[name].trigger = trigger || 'after';
        obj.onChange[name].type = type || 'async';

        if (obj.onChange[name].templateId) obj.onChange[name].overwritten = true;

        SPOO.chainPermission(obj, instance, 'w', 'setOnChangeHandler', name);

        return onChange;
    },

    ObjectOnDeleteSetWrapper: function(obj, name, onDelete, trigger, type, isntance) {
        //if (!typeof onchange == 'object') throw new InvalidPermissionException();

        if (!onDelete) throw new InvalidHandlerException();

        if (obj.onDelete[name]) throw new HandlerExistsException(name);

        if (!name) name = SPOO.RANDOM();

        if (!obj.onDelete[name]) obj.onDelete[name] = {}

        obj.onDelete[name].value = onDelete;
        obj.onDelete[name].trigger = trigger || 'after';
        obj.onDelete[name].type = type || 'async';

        if (obj.onDelete[name].templateId) obj.onDelete[name].overwritten = true;

        SPOO.chainPermission(obj, instance, 'z', 'setOnDeleteHandler', name);

        return onDelete;
    },

    ObjectPermissionSetWrapper: function(obj, permission, instance) //addTemplateToObject!!!
    {
        if (!typeof permission == 'object') throw new InvalidPermissionException();

        if (!permission) throw new InvalidPermissionException();

        var permissionKey = Object.keys(permission)[0];

        if (!obj.permissions[permissionKey]) obj.permissions[permissionKey] = permission[permissionKey];
        else {
            obj.permissions[permissionKey] = permission[permissionKey];
        }

        SPOO.chainPermission(obj, instance, 'x', 'setPermission', permissionKey);

        return permission;
    },

    ObjectPermissionRemoveWrapper: function(obj, permissionName, instance) //addTemplateToObject!!!
    {
        if (!permissionName) throw new InvalidPermissionException();

        if (!typeof permissionName == 'string') throw new InvalidPermissionException();

        if (!obj.permissions[permissionName]) throw new NoSuchPermissionException(permissionName);

        SPOO.chainPermission(obj, instance, 'x', 'removePermission', permissionName);

        delete obj.permissions[permissionName];

        return permissionName;
    },


    PropertyQuerySetWrapper: function(obj, propertyKey, query) {
        console.debug(obj);
        console.debug(propertyKey);



        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setValue(obj.properties[access.shift()], access, value);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }


                if (typeof value !== 'object') throw new InvalidDataTypeException(value, 'object');

                obj.properties[access[0]].query = query;
            }
        }

        setValue(obj, propertyKey, query);



    },



    PropertyMetaSetWrapper: function(obj, propertyKey, meta) {
        function setOnChange(obj, access, meta) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setOnChange(obj.properties[access.shift()], access, meta);
            } else {

                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }

                //if (!obj.properties[access[0]].on) obj.properties[access[0]].on = {};

                if (obj.properties[access[0]].template) obj.properties[access[0]].metaOverwritten = true;
                obj.properties[access[0]].meta = meta;
            }
        }

        setOnChange(obj, propertyKey, meta);
    },


    PropertyOnChangeSetWrapper: function(obj, propertyKey, name, onChange, trigger, type, instance) {
        function setOnChange(obj, access, onChange) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setOnChange(obj.properties[access.shift()], access, onChange);
            } else {

                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }

                //if (!obj.properties[access[0]].on) obj.properties[access[0]].on = {};

                if (!obj.properties[access[0]].onChange) obj.properties[access[0]].onChange = {}

                if (!obj.properties[access[0]].onChange[name]) obj.properties[access[0]].onChange[name] = {}

                if (obj.properties[access[0]].onChange[name].template) obj.properties[access[0]].onChange[name].overwritten = true;
                obj.properties[access[0]].onChange[name].value = onChange;
                obj.properties[access[0]].onChange[name].trigger = trigger || 'after';
                obj.properties[access[0]].onChange[name].type = type || 'async';

                SPOO.chainPermission(obj, instance, 'w', 'setPropertyOnChangeHandler', name);
            }
        }

        setOnChange(obj, propertyKey, onChange);
    },

    PropertyOnCreateSetWrapper: function(obj, propertyKey, name, onCreate, trigger, type, instance) {
        function setOnCreate(obj, access, onCreate) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setOnCreate(obj.properties[access.shift()], access, onCreate);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }

                //if (!obj.properties[access[0]].on) obj.properties[access[0]].on = {};

                if (!obj.properties[access[0]].onCreate) obj.properties[access[0]].onCreate = {};

                if (!obj.properties[access[0]].onCreate[name]) obj.properties[access[0]].onCreate[name] = {};

                if (obj.properties[access[0]].onCreate[name].templateId) obj.properties[access[0]].onCreate[name].overwritten = true;

                obj.properties[access[0]].onCreate[name].value = onCreate;
                obj.properties[access[0]].onCreate[name].trigger = trigger || 'after';
                obj.properties[access[0]].onCreate[name].type = type || 'async';

                SPOO.chainPermission(obj, instance, 'v', 'setPropertyOnCreateHandler', name);

            }
        }

        setOnCreate(obj, propertyKey, onCreate);
    },

    PropertyOnDeleteSetWrapper: function(obj, propertyKey, name, onDelete, trigger, type, instance) {
        function setOnDelete(obj, access, onDelete) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setOnDelete(obj.properties[access.shift()], access, onDelete);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }

                if (!obj.properties[access[0]].onDelete) obj.properties[access[0]].onDelete = {};
                if (!obj.properties[access[0]].onDelete[name]) obj.properties[access[0]].onDelete[name] = {};

                //if (!obj.properties[access[0]].on) obj.properties[access[0]].on = {};
                if (obj.properties[access[0]].onDelete[name].template) obj.properties[access[0]].onDelete[name].overwritten = true;
                obj.properties[access[0]].onDelete[name].value = onDelete;
                obj.properties[access[0]].onDelete[name].trigger = trigger || 'after';
                obj.properties[access[0]].onDelete[name].type = type || 'async';

                SPOO.chainPermission(obj, instance, 'z', 'setPropertyOnDeleteHandler', name);
            }
        }

        setOnDelete(obj, propertyKey, onDelete);
    },

    PropertyConditionsSetWrapper: function(obj, propertyKey, conditions) {

        function setConditions(obj, access, conditions) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setConditions(obj.properties[access.shift()], access, conditions);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }

                //if (!obj.properties[access[0]].on) obj.properties[access[0]].on = {};

                obj.properties[access[0]].conditions = conditions;
            }
        }

        setConditions(obj, propertyKey, conditions);
    },

    PropertyPermissionSetWrapper: function(obj, propertyKey, permission, instance) {
        console.debug(obj);
        console.debug(propertyKey);


        function setPermission(obj, access, permission) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setPermission(obj.properties[access.shift()], access, permission);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }

                var permissionKey = Object.keys(permission)[0];
                if (!obj.properties[access[0]].permissions) obj.properties[access[0]].permissions = {};

                obj.properties[access[0]].permissions[permissionKey] = permission[permissionKey];

                SPOO.chainPermission(obj, instance, 'x', 'setPropertyPermission', propertyKey);
            }
        }

        setPermission(obj, propertyKey, permission);



        /*switch(existingProperty.type)
        {
            case constants.PROPERTY_TYPE_SHORTTEXT:
                obj.properties[propertyKey].value = newValue;
            break;

            default : 
                throw new InvalidTypeException(existingProperty.type);
        }*/

        /*if(obj.role == 'template') 
        {
            SPOO.addTemplateFieldToObjects(obj, propertyKey, function(data)
                {
                    console.log("template added!");
                },
                function(error)
                {
                    throw new NoSuchTemplateException(error);
                });
        }*/
    },


    PropertySetWrapper: function(obj, propertyKey, newValue, instance, notPermitted) {


        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }

                if (obj.properties[access[0]].type == 'boolean') {
                    if (typeof(newValue) != 'boolean') throw new InvalidValueException(newValue, obj.properties[access[0]].type);
                }
                if (obj.properties[access[0]].type == 'number') {
                    if (isNaN(newValue)) throw new InvalidValueException(newValue, obj.properties[access[0]].type);
                }


                if (obj.properties[access[0]].template) obj.properties[access[0]].overwritten = true;
                obj.properties[access[0]].value = newValue;


                if (obj.properties[access[0]].onChange) {
                    if (Object.keys(obj.properties[access[0]].onChange).length > 0) {
                        if (!instance.handlerSequence[obj._id]) instance.handlerSequence[obj._id] = {};
                        if (!instance.handlerSequence[obj._id].onChange) instance.handlerSequence[obj._id].onChange = [];
                        instance.handlerSequence[obj._id].onChange.push({ handler: obj.properties[access[0]].onChange, prop: obj.properties[access[0]] });
                    }
                }

                SPOO.chainPermission(obj, instance, 'u', 'setPropertyValue', propertyKey);


            }
        }

        setValue(obj, propertyKey, newValue);



        /*switch(existingProperty.type)
        {
            case constants.PROPERTY_TYPE_SHORTTEXT:
                obj.properties[propertyKey].value = newValue;
            break;

            default : 
                throw new InvalidTypeException(existingProperty.type);
        }*/

        /*if(obj.role == 'template') 
        {
            SPOO.addTemplateFieldToObjects(obj, propertyKey, function(data)
                {
                    console.log("template added!");
                },
                function(error)
                {
                    throw new NoSuchTemplateException(error);
                });
        }*/
    },

    EventIntervalSetWrapper: function(obj, propertyKey, newValue, client, instance) {


        var prop = obj.getProperty(propertyKey);

        if (prop.type != CONSTANTS.PROPERTY.TYPE_EVENT) throw new NotAnEventException(propertyKey);



        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }


                if (obj.properties[access[0]].template) obj.properties[access[0]].overwritten = true;

                delete obj.properties[access[0]].date;
                obj.properties[access[0]].interval = newValue;

                if (obj.properties[access[0]].lastOccurence) {

                    var nextOccurence = moment(obj.properties[access[0]].lastOccurence).add(newValue);
                    instance.eventAlterationSequence.push({ operation: 'remove', obj: obj, propName: propertyKey, property: obj.properties[access[0]], date: nextOccurence })
                    instance.eventAlterationSequence.push({ operation: 'add', obj: obj, propName: propertyKey, property: obj.properties[access[0]], date: nextOccurence })
                }



            }
        }

        setValue(obj, propertyKey, newValue);

    },

    EventTriggeredSetWrapper: function(obj, propertyKey, newValue, client, notPermitted) {

        var prop = obj.getProperty(propertyKey);

        if (prop.type != CONSTANTS.PROPERTY.TYPE_EVENT) throw new NotAnEventException(propertyKey);


        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }

            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }


                obj.properties[access[0]].triggered = newValue;
                obj.properties[access[0]].overwritten = true;
            }
        }

        setValue(obj, propertyKey, newValue);

    },


    EventLastOccurenceSetWrapper: function(obj, propertyKey, newValue, client, notPermitted) {

        var prop = obj.getProperty(propertyKey);

        if (prop.type != CONSTANTS.PROPERTY.TYPE_EVENT) throw new NotAnEventException(propertyKey);


        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {
                //obj[access[0]] = value;
                try {

                    var t = obj.properties[access[0]].type;

                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }


                obj.properties[access[0]].lastOccurence = newValue;

                obj.properties[access[0]].nextOccurence = moment(newValue).add(moment.duration(obj.properties[access[0]].interval)).toISOString();
            }
        }

        setValue(obj, propertyKey, newValue);

    },

    EventReminderSetWrapper: function(obj, propertyKey, reminder, client, notPermitted) {


        var prop = obj.getProperty(propertyKey);

        if (prop.type != CONSTANTS.PROPERTY.TYPE_EVENT) throw new NotAnEventException(propertyKey);

        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }


                if (obj.properties[access[0]].template) obj.properties[access[0]].overwritten = true;

                if (!obj.properties[access[0]].reminders)
                    obj.properties[access[0]].reminders = {};

                obj.properties[access[0]].reminders[reminder.diff] = { action: reminder.action };
            }
        }

        setValue(obj, propertyKey, reminder);

    },


    EventReminderRemover: function(obj, propertyKey, reminder, client, notPermitted) {


        var prop = obj.getProperty(propertyKey);

        if (prop.type != CONSTANTS.PROPERTY.TYPE_EVENT) throw new NotAnEventException(propertyKey);

        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }


                if (obj.properties[access[0]].reminders) {
                    try {
                        delete obj.properties[access[0]].reminders[reminder];
                    } catch (e) {
                        throw new NoSuchReminderException(reminder);
                    }
                }

            }
        }

        setValue(obj, propertyKey, reminder);

    },


    EventDateSetWrapper: function(obj, propertyKey, newValue, client, instance) {


        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }


                if (obj.properties[access[0]].template) obj.properties[access[0]].overwritten = true;
                delete obj.properties[access[0]].interval;
                delete obj.properties[access[0]].lastOccurence;
                delete obj.properties[access[0]].nextOccurence;
                obj.properties[access[0]].date = newValue;


                instance.eventAlterationSequence.push({ operation: 'remove', obj: obj, propName: propertyKey, property: obj.properties[access[0]], date: newValue })
                instance.eventAlterationSequence.push({ operation: 'add', obj: obj, propName: propertyKey, property: obj.properties[access[0]], date: newValue })

            }
        }

        setValue(obj, propertyKey, newValue);

    },

    EventActionSetWrapper: function(obj, propertyKey, newValue, client, instance) {

        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {

                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }



                if (obj.properties[access[0]].template) obj.properties[access[0]].overwritten = true;

                obj.properties[access[0]].action = newValue;

                //instance.eventAlterationSequence.push({ operation: 'remove', obj: obj, propName: propertyKey, property: obj.properties[access[0]], date: newValue })
                //instance.eventAlterationSequence.push({ operation: 'add', obj: obj, propName: propertyKey, property: obj.properties[access[0]], date: newValue })
            }
        }

        setValue(obj, propertyKey, newValue);

    },

    ObjectRoleChecker: function(obj, role) {
        switch (role) {
            case 'object':
                return role;
                break;
            case 'template':
                return role;
                break;
            case 'tenant':
                return role;
                break;
            case 'application':
                return role;
                break;
            case 'user':
                obj.username = '';
                obj.password = '';
                return role;
                break;
            default:
                return 'object';
        }
    },

    PropertiesChecker: function(obj, properties, instance) {
        if (properties === undefined) return {};

        obj.properties = {};
        var propertyKeys = Object.keys(properties);
        propertyKeys.forEach(function(property) {
            var propKey = {};
            propKey[property] = properties[property];
            var newProp = propKey;
            new SPOO.PropertyCreateWrapper(obj, newProp, false, instance);
        })
        return obj.properties;
    },

    ApplicationsChecker: function(obj, applications) {
        if (applications === undefined) return [];

        obj.applications = [];
        applications.forEach(function(application) {
            obj.applications.push(application);
        })
        return obj.applications;
    },

    ActionsChecker: function(obj, actions) {
        if (actions === undefined) return {};

        obj.actions = {};
        var actionKeys = Object.keys(actions);
        actionKeys.forEach(function(action) {
            var actionKey = {};
            actionKey[action] = actions[action];
            var newAction = actionKey;
            new SPOO.ActionCreateWrapper(obj, newAction, false);
        })
        return obj.actions;
    },

    TemplatesChecker: function(obj, templates) {
        if (templates === undefined) return [];
        if (typeof templates !== 'object') return [];
        obj.inherits = [];

        templates.forEach(function(template) {
            if (template != obj._id) new SPOO.TemplatesCreateWrapper(obj, template);
        })

        return obj.inherits;
    },


    PrivilegesChecker: function(obj) {

        obj = JSON.stringify(obj);
        var nObj = JSON.parse(obj);

        return nObj.privileges;
    },

    PrivilegeChecker: function(obj, privilege) {

        if (!typeof privilege == 'object') throw new InvalidPrivilegeException();
        var privilegeKey = Object.keys(privilege)[0];

        if (!obj.privileges[privilegeKey]) {
            obj.privileges[privilegeKey] = [];
        }

        if (obj.privileges[privilegeKey].indexOf(privilege[privilegeKey]) == -1) obj.privileges[privilegeKey].push(privilege[privilegeKey]);

        return privilege;
    },

    PrivilegeRemover: function(obj, privilege) {

        if (!typeof privilege == 'object') throw new InvalidPrivilegeException();
        var privilegeKey = Object.keys(privilege)[0];

        if (!obj.privileges[privilegeKey]) {
            throw new NoSuchPrivilegeException();
        }

        var i;
        for (i = 0; i < obj.privileges[privilegeKey].length; i++) {
            if (obj.privileges[privilegeKey][i].name == privilege[privilegeKey]) obj.privileges[privilegeKey].splice(i, 1);
        }

        if (obj.privileges[privilegeKey].length == 0) {
            delete obj.privileges[privilegeKey];
        }

        return privilege;
    },

    Objs: function(objs, role, instance) {
        var self = this;

        if (typeof objs === "object") {

            this.get = function(success, error) {

                var client = instance.activeTenant;
                var app = instance.activeApp;

                var thisRef = this;
                var counter = 0;

                var flags = {} // TODO!!!


                SPOO.findObjects(objs, role, function(data) {
                    success(data);

                }, function(err) { error(err) }, app, client, flags);
                return;

                if (this.inherits.length == 0) {
                    success(thisRef);
                    return this;
                }


                this.inherits.forEach(function(template) {

                    if (thisRef._id != template) {

                        SPOO.getTemplateFieldsForObject(thisRef, template, function() {
                                counter++;
                                if (counter == thisRef.inherits.length) {
                                    success(thisRef);
                                    return this;
                                }
                            },
                            function(err) {

                                success(thisRef);
                                return this;
                            }, client)
                    } else {
                        if (thisRef.inherits.length == 1) {
                            success(thisRef);
                            return this;
                        } else {
                            counter++;
                            return;
                        }
                    }
                });



            }


        } else if (Array.isArray(objs)) {
            var i;
            for (i = 0; i < objs.length; i++) {
                objs[i] = new SPOO.Obj(objs[i], role);
            }

            return objs;
        }

    },

    Obj: function(obj, role, instance) {

        if (typeof obj === "string") {
            this._id = obj;
        }

        if (obj === undefined) obj = {};

        this.role = role || 'object';

        this.type = obj.type || null;

        if (this.role != 'application' && this.role != 'tenant') {

            this.applications = SPOO.ApplicationsChecker(this, obj.applications) || [];
        }

        this.inherits = SPOO.TemplatesChecker(this, obj.inherits) || [];

        if (obj._id) this._id = obj._id;
        this.name = obj.name || null;

        this.onCreate = obj.onCreate || {};
        this.onChange = obj.onChange || {};
        this.onDelete = obj.onDelete || {};

        this.created = obj.created || moment().toDate().toISOString();
        this.lastModified = obj.lastModified || moment().toDate().toISOString();

        this.properties = SPOO.PropertiesChecker(this, obj.properties, instance) || {};

        this.permissions = new SPOO.ObjectPermissionsCreateWrapper(this, obj.permissions) || {};

        this.aggregatedEvents = obj.aggregatedEvents || [];

        if (this.role == 'template') {
            this.privileges = obj.privileges;
            this.addPrivilege = obj.addPrivilege;
            this.removePrivilege = obj.removePrivilege;
        }

        if (this.role == 'user') {
            this.username = obj.username;
            this.email = obj.email;
            this.password = obj.password;
            this.spooAdmin = obj.spooAdmin;
            this.privileges = obj.privileges;
            this.addPrivilege = obj.addPrivilege;
            this.removePrivilege = obj.removePrivilege;
            this.setUsername = obj.setUsername;
            this.setEmail = obj.setEmail;
            this.setPassword = obj.setPassword;
        }

        this.addInherit = function(templateId) {
            SPOO.addTemplateToObject(this, templateId, instance);
            return this;
        };

        this.removeInherit = function(templateId, success, error) {
            SPOO.removeTemplateFromObject(this, templateId, function(data) {
                    //if (success) success(templateId);
                },
                function(err) {
                    //if (error) error(err);
                }, instance);
            return this;
        };


        this.addApplication = function(application) {
            SPOO.addApplicationToObject(this, application, instance);
            return this;
        };

        this.removeApplication = function(application) {
            SPOO.removeApplicationFromObject(this, application, instance);
            return this;
        };

        this.addProperty = function(name, property) {

            var prop = {};
            prop[name] = property;
            property = prop;

            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                newProp[newProKey] = property[propertyKey];

                this.addPropertyToBag(bag, newProp);

                return;
            }

            new SPOO.PropertyCreateWrapper(this, property, false, instance);


            return this;
        };

        this.setOnChange = function(name, onChangeObj) {

            if (typeof onChangeObj !== 'object') throw new InvalidArgumentException()
            var key = name; //Object.keys(onChangeObj)[0];

            new SPOO.ObjectOnChangeSetWrapper(this, key, onChangeObj.value, onChangeObj.trigger, onChangeObj.type, instance);
            return this;
        };

        this.setOnDelete = function(name, onDeleteObj) {

            if (typeof onDeleteObj !== 'object') throw new InvalidArgumentException()
            var key = name; //Object.keys(onDeleteObj)[0];

            new SPOO.ObjectOnDeleteSetWrapper(this, key, onDeleteObj.value, onDeleteObj.trigger, onDeleteObj.type, instance);
            return this;
        };

        this.setOnCreate = function(name, onCreateObj) {

            if (typeof onCreateObj !== 'object') throw new InvalidArgumentException()
            var key = name; //Object.keys(onCreateObj)[0];

            new SPOO.ObjectOnCreateSetWrapper(this, key, onCreateObj.value, onCreateObj.trigger, onCreateObj.type, instance);
            return this;
        };

        this.removeOnChange = function(name) {
            if (!this.onChange[name]) throw new HandlerNotFoundException(name);
            else delete this.onChange[name];
            return this;
        };

        this.removeOnDelete = function(name) {
            if (!this.onDelete[name]) throw new HandlerNotFoundException(name);
            else delete this.onDelete[name];
            return this;
        };

        this.removeOnCreate = function(name) {
            if (!this.onCreate[name]) throw new HandlerNotFoundException(name);
            else delete this.onCreate[name];
            return this;
        };

        this.setPermission = function(name, permission) {

            var perm = {};
            perm[name] = permission;
            permission = perm;

            new SPOO.ObjectPermissionSetWrapper(this, permission, instance);
            return this;
        };

        this.removePermission = function(permission) {
            new SPOO.ObjectPermissionRemoveWrapper(this, permission, instance);
            return this;
        };

        this.setPropertyValue = function(property, value, client) {

            /*var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagPropertyValue(bag, newProKey, value,  client);
                return;
            }

            new SPOO.ConditionsChecker(this.getProperty(property), value);*/

            new SPOO.PropertySetWrapper(this, property, value, instance, ['addObject']);


            return this;
        };

        this.setEventDate = function(property, value, client) {

            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagEventDate(bag, newProKey, value, client);
                return;
            }


            new SPOO.EventDateSetWrapper(this, property, value, client, instance);
            return this;
        };

        this.setEventAction = function(property, value, client) {

            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagEventAction(bag, newProKey, value, client);
                return;
            }

            // new SPOO.ConditionsChecker(this.getProperty(property), value);

            new SPOO.EventActionSetWrapper(this, property, value, client, instance);
            return this;
        };

        this.setEventTriggered = function(property, value, client) {

            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagEventTriggered(bag, newProKey, value, client);
                return;
            }

            // new SPOO.ConditionsChecker(this.getProperty(property), value);

            new SPOO.EventTriggeredSetWrapper(this, property, value, client, instance);
            return this;
        };

        this.setEventLastOccurence = function(property, value, client) {

            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagEventLastOccurence(bag, newProKey, value, client);
                return;
            }

            // new SPOO.ConditionsChecker(this.getProperty(property), value);


            new SPOO.EventLastOccurenceSetWrapper(this, property, value, client, ['addObject']);
            return this;
        };

        this.setEventInterval = function(property, value, client) {

            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagEventInterval(bag, newProKey, value, client);
                return;
            }

            // new SPOO.ConditionsChecker(this.getProperty(property), value);

            new SPOO.EventIntervalSetWrapper(this, property, value, client, instance);
            return this;
        };

        this.addEventReminder = function(property, reminder, client) {

            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.addBagEventReminder(bag, newProKey, reminder, client);
                return;
            }

            // new SPOO.ConditionsChecker(this.getProperty(property), value);

            new SPOO.EventReminderSetWrapper(this, property, reminder, client, ['addObject']);
            return this;
        };

        this.removeEventReminder = function(propertyName, reminder) {
            if (propertyName.indexOf('.') != -1) {
                this.removeEventReminderFromBag(propertyName, reminder);
                return;
            } else {

                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].reminders) throw new NoSuchReminderException(reminder); // CHANGE!!!

                try {
                    delete this.properties[propertyName].reminders[reminder];
                } catch (e) {
                    throw new NoSuchReminderException(reminder);
                }

            }

            return this;
        };

        this.pushToArray = function(array, value) {

            var propKey = Object.keys(value)[0];
            var tmpProp = {};
            var tmpName;
            tmpName = shortid.generate();

            tmpProp[tmpName] = value[propKey];
            console.log(tmpProp);
            this.addPropertyToBag(array, tmpProp);
        };

        this.setPropertyPermission = function(property, name, permission) {

            var perm = {};
            perm[name] = permission;
            permission = perm;

            /*var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagPropertyPermission(bag, newProKey, value);
                return;
            }*/
            new SPOO.PropertyPermissionSetWrapper(this, property, permission, instance);
            return this;
        };

        this.setPropertyOnCreate = function(property, name, onCreateObj) {

            if (typeof onCreateObj !== 'object') throw new InvalidArgumentException()
            var key = name; //Object.keys(onCreateObj)[0];

            new SPOO.PropertyOnCreateSetWrapper(this, property, key, onCreateObj.value, onCreateObj.trigger, onCreateObj.type, instance);
            return this;
        };

        this.removePropertyOnCreate = function(propertyName, handlerName) {
            if (propertyName.indexOf('.') != -1) {
                this.removePropertyOnCreateFromBag(propertyName, handlerName);
                return;
            } else {

                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].onCreate) throw new NoOnCreateException(); // CHANGE!!!
                if (!this.properties[propertyName].onCreate[handlerName]) throw new NoOnCreateException(); // CHANGE!!!
                delete this.properties[propertyName].onCreate[propertyName];
            }

            return this;
        };

        this.removePropertyOnCreateFromBag = function(property, handlerName) {
            var bag = this.getProperty(property);
            if (this.role == 'template') {

            }
            new SPOO.PropertyBagItemOnCreateRemover(this, property, handlerName);
            return this;
        };

        this.removeEventReminderFromBag = function(property, reminder) {
            var bag = this.getProperty(property);
            new SPOO.EventReminderRemover(this, property, reminder);
            return this;
        };

        this.setPropertyMeta = function(property, meta) {
            new SPOO.PropertyMetaSetWrapper(this, property, meta);
            return this;
        };

        this.removePropertyMetaFromBag = function(property) {
            var bag = this.getProperty(property);
            if (this.role == 'template') {

            }
            new SPOO.PropertyBagItemMetaRemover(this, property);
            return this;
        };

        this.removePropertyMeta = function(propertyName) {
            if (propertyName.indexOf('.') != -1) {
                this.removePropertyMetaFromBag(propertyName);
                return;
            } else {

                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].meta) throw new NoMetaException(); // CHANGE!!!
                delete this.properties[propertyName].meta;
            }

            return this;
        };


        this.setPropertyOnChange = function(property, name, onChangeObj) {

            if (typeof onChangeObj !== 'object') throw new InvalidArgumentException()
            var key = name; //Object.keys(onChangeObj)[0];


            new SPOO.PropertyOnChangeSetWrapper(this, property, key, onChangeObj.value, onChangeObj.trigger, onChangeObj.type, instance);
            return this;
        };

        this.removePropertyOnChange = function(propertyName, name) {
            if (propertyName.indexOf('.') != -1) {
                this.removePropertyOnChangeFromBag(propertyName, name);
                return;
            } else {

                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].onDelete[name]) throw new HandlerNotFoundException(name); // CHANGE!!!
                delete this.properties[propertyName][name];
            }

            return this;
        };

        this.removePropertyOnChangeFromBag = function(property, name) {
            var bag = this.getProperty(property);

            new SPOO.PropertyBagItemOnChangeRemover(this, property, name);
            return this;
        };

        this.setPropertyOnDelete = function(property, name, onDeleteObj) {

            if (typeof onDeleteObj !== 'object') throw new InvalidArgumentException()
            var key = name; //Object.keys(onDeleteObj)[0];

            new SPOO.PropertyOnDeleteSetWrapper(this, property, key, onDeleteObj.value, onDeleteObj.trigger, onDeleteObj.type, instance);
            return this;
        };

        this.removePropertyOnDelete = function(propertyName, name) {
            if (propertyName.indexOf('.') != -1) {
                this.removePropertyOnDeleteFromBag(propertyName, name);
                return;
            } else {

                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].onDelete[name]) throw new HandlerNotFoundException(name); // CHANGE!!!
                delete this.properties[propertyName].onDelete[name]
            }

            return this;
        };

        this.removePropertyOnDeleteFromBag = function(property, name) {
            var bag = this.getProperty(property);

            new SPOO.PropertyBagItemOnDeleteRemover(this, property, name);
            return this;
        };



        this.setPropertyConditions = function(property, conditions) {
            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagPropertyConditions(bag, newProKey, conditions);
                return;
            }
            new SPOO.PropertyConditionsSetWrapper(this, property, conditions);
            return this;
        };

        this.setBagPropertyConditions = function(bag, property, conditions) {
            new SPOO.PropertyConditionsSetWrapper(this.getProperty(bag), property, conditions);
            return this;
        };


        this.setBagPropertyPermission = function(bag, property, permission) {
            new SPOO.PropertyPermissionSetWrapper(this.getProperty(bag), property, permission);
            return this;
        };

        this.setPropertyQuery = function(property, options) {
            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagPropertyQuery(bag, newProKey, value);
                return;
            }
            new SPOO.PropertyQuerySetWrapper(this, property, options);
            return this;
        };

        this.setPropertyEventInterval = function(property, interval) {
            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagPropertyEventInterval(bag, newProKey, value);
                return;
            }
            new SPOO.PropertyEventIntervalSetWrapper(this, property, interval, instance);
            return this;
        };

        this.removePropertyQuery = function(propertyName) {
            if (propertyName.indexOf('.') != -1) {
                this.removePropertyQueryFromBag(propertyName);
                return;
            } else {

                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].query) throw new NoSuchPermissionException(permissionKey); // CHANGE!!!
                delete this.properties[propertyName].query;
            }

            return this;
        };

        this.removePropertyQueryFromBag = function(property) {
            var bag = this.getProperty(property);

            new SPOO.PropertyBagItemQueryRemover(this, property);
            return this;
        };

        this.removePropertyConditions = function(propertyName) {
            if (propertyName.indexOf('.') != -1) {
                this.removePropertyConditionsFromBag(propertyName);
                return;
            } else {

                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].conditions) throw new NoSuchPermissionException(permissionKey); // CHANGE!!!
                delete this.properties[propertyName].conditions;
            }

            return this;
        };

        this.removePropertyConditionsFromBag = function(property) {
            var bag = this.getProperty(property);

            new SPOO.PropertyBagItemConditionsRemover(this, property);
            return this;
        };

        this.setBagPropertyQuery = function(bag, property, options) {
            new SPOO.setBagPropertyQuery(this.getProperty(bag), property, permoptionsission);
            return this;
        };

        this.removePropertyPermission = function(propertyName, permissionKey) {
            if (propertyName.indexOf('.') != -1) {
                this.removePropertyPermissionFromBag(propertyName, permissionKey);
                return;
            } else {
                console.log(permissionKey);
                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].permissions[permissionKey]) throw new NoSuchPermissionException(permissionKey);

                SPOO.chainPermission(this, instance, 'x', 'removePropertyPermission', permissionKey);


                delete this.properties[propertyName].permissions[permissionKey];
            }

            return this;
        };

        this.setBagPropertyValue = function(bag, property, value, client) {
            new SPOO.PropertySetWrapper(this.getProperty(bag), property, value, instance);
            return this;
        };

        this.setBagEventDate = function(bag, property, value, client) {
            new SPOO.EventDateSetWrapper(this.getProperty(bag), property, value, ['addObject']);
            return this;
        };

        this.setBagEventAction = function(bag, property, value, client) {
            new SPOO.EventActionSetWrapper(this.getProperty(bag), property, value, ['addObject']);
            return this;
        };

        this.setBagEventInterval = function(bag, property, value, client) {
            new SPOO.EventIntervalSetWrapper(this.getProperty(bag), property, value, instance);
            return this;
        };

        this.setBagEventTriggered = function(bag, property, value, client) {
            new SPOO.EventTriggeredSetWrapper(this.getProperty(bag), property, value, ['addObject']);
            return this;
        };

        this.setBagEventLastOccurence = function(bag, property, value, client) {
            new SPOO.EventLastOccurenceSetWrapper(this.getProperty(bag), property, value, ['addObject']);
            return this;
        };

        this.addBagEventReminder = function(bag, property, value, client) {
            new SPOO.EventReminderSetWrapper(this.getProperty(bag), property, value, ['addObject']);
            return this;
        };

        this.addPropertyToBag = function(bag, property) {


            var tmpBag = this.getProperty(bag);
            if (tmpBag.template) tmpBag.overwritten = true;

            new SPOO.PropertyCreateWrapper(tmpBag, property, true, instance);

            return this;
        };

        this.removePropertyFromBag = function(property, client) {
            var bag = this.getProperty(property);

            new SPOO.PropertyBagItemRemover(this, property, instance);
            return this;
        };

        this.removePropertyPermissionFromBag = function(property, permissionKey) {
            var bag = this.getProperty(property);

            new SPOO.PropertyBagItemPermissionRemover(this, property, permissionKey, instance);
            return this;
        };

        this.removeProperty = function(propertyName, client) {


            if (propertyName.indexOf('.') != -1) {
                this.removePropertyFromBag(propertyName, client);
                return;
            } else {
                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);

                var tmpProp = Object.assign({}, this.properties[propertyName]);

                if (tmpProp.onDelete) {
                    if (Object.keys(tmpProp.onDelete).length > 0) {
                        if (!instance.handlerSequence[this._id]) instance.handlerSequence[this._id] = {};
                        if (!instance.handlerSequence[this._id].onDelete) instance.handlerSequence[this._id].onDelete = [];
                        instance.handlerSequence[this._id].onDelete.push({ handler: tmpProp.onDelete, prop: tmpProp });
                    }
                }

                SPOO.chainPermission(this.properties[propertyName], instance, 'd', 'removeProperty', propertyName);

                if (this.properties[propertyName].type == 'date') instance.eventAlterationSequence.push({ operation: 'remove', obj: this, propName: propertyName, date: date })

                delete this.properties[propertyName];

            }

            return this;
        };


        this.getId = function() {
            return this._id;
        };

        this.getName = function() {
            return this.name;
        };

        this.setName = function(name) {
            this.name = name;

            SPOO.chainPermission(this, instance, 'n', 'setName', name);

            return this;
        };

        this.setType = function(type) {
            this.type = type;
            SPOO.chainPermission(this, instance, 't', 'setType', type);
            return this;
        };

        this.getType = function() {
            return this.type;
        };

        this.getRef = function(propertyName) {
            return new SPOO.PropertyRefParser(this, propertyName);
        };

        this.getProperty = function(propertyName) {
            //return this.properties[propertyName];
            return SPOO.PropertyParser(this, propertyName);
        };

        this.getProperties = function() {
            return this.properties;
        };

        this.add = function(success, error) {

            var client = instance.activeTenant;
            var app = instance.activeApp;

            var thisRef = this;

            console.log(thisRef.onCreate);

            Object.keys(thisRef.onCreate).forEach(function(key) {

                if (thisRef.onCreate[key].trigger == 'before') {
                    console.log("####");
                    //dsl, obj, prop, data, callback, client, options
                    instance.execProcessorAction(thisRef.onCreate[key].value, thisRef, null, null, function(data) {

                    }, client, null);
                }
            })

            this.created = moment().toDate().toISOString();
            this.lastModified = moment().toDate().toISOString();

            var thisRef = this;

            thisRef.aggregatedEvents = [];

            function aggregateAllEvents(props, prePropsString) {

                Object.keys(props).forEach(function(p) {
                    if (props[p].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG)
                        if (prePropsString) {
                            aggregateAllEvents(props[p].properties, prePropsString + "." + p)
                        }
                    else {
                        aggregateAllEvents(props[p].properties, p)
                    }

                    if (props[p].type == CONSTANTS.PROPERTY.TYPE_EVENT) {

                        var date = null;

                        if (props[p].date) {
                            if (!props[p].date.triggered) date = props[p].date;
                            else date = null;
                        } else if (props[p].interval) {
                            if (props[p].nextOccurence) {
                                date = props[p].nextOccurence;
                            } else date = moment().toISOString();
                        }

                        if (prePropsString) {

                            instance.eventAlterationSequence.push({ operation: 'add', obj: thisRef, propName: prePropsString + "." + p, property: props[p], date: date })

                            var found = false;
                            thisRef.aggregatedEvents.forEach(function(aE) {
                                if (aE.propName == prePropsString + "." + p) found = true;
                            })

                            if (!found) thisRef.aggregatedEvents.push({ propName: prePropsString + "." + p, date: date });

                        } else {

                            instance.eventAlterationSequence.push({ operation: 'add', obj: thisRef, propName: p, property: props[p], date: date })

                            var found = false;
                            thisRef.aggregatedEvents.forEach(function(aE) {
                                if (aE.propName == p) found = true;
                            })

                            if (!found) thisRef.aggregatedEvents.push({ propName: p, date: date });

                        }
                    }

                })
            }

            var mapper = null;

            if (!instance.observers[obj.role])
                mapper = defaultMappers.observer;
            else
                mapper = instance.observers[obj.role];


            aggregateAllEvents(this.properties);

            if (!this._id) this._id = SPOO.ID();

            if (app)
                if (this.applications.indexOf(app) == -1) this.applications.push(app);


            SPOO.add(this, function(data) {

                    this._id = data._id;

                    Object.keys(data.onCreate).forEach(function(key) {
                        if (data.onCreate[key].trigger == 'after') {
                            //dsl, obj, prop, data, callback, client, options
                            instance.execProcessorAction(data.onCreate[key].value, data, null, null, function(data) {

                            }, client, null);
                        }
                    })

                    var mapper = null;

                    if (!instance.observers[obj.role])
                        mapper = defaultMappers.observer;
                    else
                        mapper = instance.observers[obj.role];



                    if (mapper.type == 'scheduled') {

                        instance.eventAlterationSequence.forEach(function(evt) {

                            if (evt.operation == 'add') {
                                mapper.addEvent(this._id, evt.propName, evt.property, function(evtData) {

                                }, function(evtErr) {

                                }, instance.activeTenant)
                            } else if (evt.operation == 'remove') {
                                mapper.addEvent(this._id, evt.propName, function(evtData) {

                                }, function(evtErr) {

                                }, instance.activeTenant)
                            }

                        })
                    }

                    instance.eventAlterationSequence = [];

                    //if(this.role == 'template') this.inherit();


                    /*
                        Call event Aggregator
                        method(this)
                            -> get with template
                            -> add all events
                    */


                    success(data);

                    delete thisRef.instance;

                },
                function(err) {
                    error(err);
                    //throw new CallbackErrorException(error);
                }, app, client);

            return this;
        };

        this.update = function(success, error) {

            var client = instance.activeTenant;
            var app = instance.activeApp;

            var thisRef = this;


            SPOO.checkPermissions(instance.activeUser, instance.activeApp, thisRef, 'u')

            if ((instance.permissionSequence[obj._id] || []).length > 0) {
                throw new LackOfPermissionsException(instance.permissionSequence[obj._id]);
            }


            Object.keys(thisRef.onChange).forEach(function(key) {
                if (thisRef.onChange[key].trigger == 'before') {
                    instance.execProcessorAction(thisRef.onChange[key].value, thisRef, null, null, function(data) {

                    }, client, null);
                }
            })

            if (instance.handlerSequence[this._id]) {
                for (var type in instance.handlerSequence[this._id]) {
                    for (var item in instance.handlerSequence[this._id][type]) {
                        var handlerObj = instance.handlerSequence[this._id][type][item];

                        for (var handlerItem in handlerObj.handler) {
                            if (handlerObj.handler[handlerItem].trigger == 'before') {
                                instance.execProcessorAction(handlerObj.handler[handlerItem].value, thisRef, handlerObj.prop, null, function(data) {

                                }, client, null);
                            }
                        }
                    }
                }
            }


            this.lastModified = moment().toDate().toISOString();

            var thisRef = this;

            thisRef.aggregatedEvents = [];

            function aggregateAllEvents(props, prePropsString) {

                Object.keys(props).forEach(function(p) {
                    if (props[p].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG)
                        if (prePropsString) {
                            aggregateAllEvents(props[p].properties, prePropsString + "." + p)
                        }
                    else {
                        aggregateAllEvents(props[p].properties, p)
                    }

                    if (props[p].type == CONSTANTS.PROPERTY.TYPE_EVENT) {

                        var date = null;

                        if (props[p].date) {
                            if (!props[p].date.triggered) date = props[p].date;
                            else date = null;
                        } else if (props[p].interval) {
                            if (props[p].nextOccurence) {
                                date = props[p].nextOccurence;
                            } else date = moment().toISOString();
                        }

                        if (prePropsString) {

                            // instance.eventAlterationSequence.push({ operation: 'add', obj: thisRef, propName: prePropsString + "." + p, date: date });

                            var found = false;
                            thisRef.aggregatedEvents.forEach(function(aE) {
                                if (aE.propName == prePropsString + "." + p) found = true;
                            })

                            if (!found) thisRef.aggregatedEvents.push({ propName: prePropsString + "." + p, date: date });

                        } else {

                            //instance.eventAlterationSequence.push({ operation: 'add', obj: thisRef, propName: p, date: date })

                            var found = false;
                            thisRef.aggregatedEvents.forEach(function(aE) {
                                if (aE.propName == p) found = true;
                            })

                            if (!found) thisRef.aggregatedEvents.push({ propName: p, date: date });

                        }
                    }

                })
            }

            var mapper = null;

            if (!instance.observers[obj.role])
                mapper = defaultMappers.observer;
            else
                mapper = instance.observers[obj.role];


            if (mapper.type != 'scheduled') aggregateAllEvents(this.properties);


            SPOO.updateO(this, function(data) {


                    Object.keys(data.onChange).forEach(function(key) {
                        if (data.onChange[key].trigger == 'after') {
                            //dsl, obj, prop, data, callback, client, options
                            instance.execProcessorAction(data.onChange[key].value, data, null, null, function(data) {

                            }, client, null);
                        }
                    })


                    if (instance.handlerSequence[this._id]) {
                        for (var type in instance.handlerSequence[this._id]) {
                            for (var item in instance.handlerSequence[this._id][type]) {
                                var handlerObj = instance.handlerSequence[this._id][type][item];

                                for (var handlerItem in handlerObj.handler) {
                                    if (handlerObj.handler[handlerItem].trigger == 'after') {
                                        instance.execProcessorAction(handlerObj.handler[handlerItem].value, thisRef, handlerObj.prop, null, function(data) {

                                        }, client, null);
                                    }
                                }
                            }
                        }
                    }

                    delete instance.handlerSequence[this._id];


                    if (mapper.type == 'scheduled') {
                        instance.eventAlterationSequence.forEach(function(evt) {
                            if (evt.type == 'add') {
                                mapper.addEvent(this._id, evt.propName, evt.property, function(evtData) {

                                }, function(evtErr) {

                                }, instance.activeTenant)
                            }

                        })
                    }


                    instance.eventAlterationSequence = [];



                    //if (this.role == 'template') this.inherit();
                    if (success) success(data);

                    /*
                        Call event Aggregator
                        method(this)
                            -> get with template
                            -> add all events
                    */

                },
                function(err) {
                    if (error) error(err);
                    //throw new CallbackErrorException(err);
                }, app, client);

            return this;
        };

        this.remove = function(success, error) {

            var client = instance.activeTenant;
            var app = instance.activeApp;

            var thisRef = this;

            SPOO.checkPermissions(instance.activeUser, instance.activeApp, thisRef, 'd');

            Object.keys(thisRef.onDelete).forEach(function(key) {
                if (thisRef.onDelete[key].trigger == 'before') {
                    //dsl, obj, prop, data, callback, client, options
                    instance.execProcessorAction(thisRef.onDelete[key].value, thisRef, null, null, function(data) {

                    }, client, null);
                }
            })


            SPOO.getObjectById(this.role, this._id, function(data) {

                return SPOO.remove(thisRef, function(_data) {

                    Object.keys(thisRef.onDelete).forEach(function(key) {
                        if (thisRef.onDelete[key].trigger == 'after') {
                            //dsl, obj, prop, data, callback, client, options
                            instance.execProcessorAction(thisRef.onDelete[key].value, thisRef, null, null, function(data) {

                            }, client, null);
                        }
                    })



                    function aggregateAllEvents(props, prePropsString) {

                        Object.keys(props).forEach(function(p) {
                            if (props[p].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG)
                                if (prePropsString) {
                                    aggregateAllEvents(props[p].properties, prePropsString + "." + p)
                                }
                            else {
                                aggregateAllEvents(props[p].properties, p)
                            }

                            if (props[p].type == CONSTANTS.PROPERTY.TYPE_EVENT) {

                                var date = null;

                                if (props[p].date) {
                                    if (!props[p].date.triggered) date = props[p].date;
                                    else date = null;
                                } else if (props[p].interval) {
                                    if (props[p].nextOccurence) {
                                        date = props[p].nextOccurence;
                                    } else date = moment().toISOString();
                                }

                                if (prePropsString) {

                                    instance.eventAlterationSequence.push({ operation: 'remove', obj: thisRef, propName: prePropsString + "." + p, date: date });

                                    var found = false;

                                } else {

                                    instance.eventAlterationSequence.push({ operation: 'remove', obj: thisRef, propName: p, date: date })


                                }
                            }

                        })
                    }

                    var mapper = null;

                    if (!instance.observers[obj.role])
                        mapper = defaultMappers.observer;
                    else
                        mapper = instance.observers[obj.role];


                    aggregateAllEvents(data.properties);



                    if (mapper.type == 'scheduled') {

                        instance.eventAlterationSequence.forEach(function(evt) {

                            if (evt.operation == 'add') {
                                mapper.addEvent(data._id, evt.propName, evt.property, function(evtData) {

                                }, function(evtErr) {

                                }, instance.activeTenant)
                            } else if (evt.operation == 'remove') {
                                mapper.removeEvent(data._id, evt.propName, function(evtData) {

                                }, function(evtErr) {
                                    console.log(evtErr);
                                }, instance.activeTenant)
                            }

                        })
                    }

                    success(data);


                }, function(err) { error(err) }, app, client);


            }, function(err) { error(err) }, app, client);



        };


        this.get = function(success, error) {

            var client = instance.activeTenant;
            var app = instance.activeApp;

            var thisRef = this;
            var counter = 0;

            function arrayDeserialize(obj, parentArray) {

                if (obj.properties) {
                    var propsArray = [];
                    var propertyKeys = Object.keys(obj.properties);
                    propertyKeys.forEach(function(propKey) {

                        if (obj.properties[propKey].type == 'array')
                            arrayDeserialize(obj.properties[propKey], true);

                        if (obj.properties[propKey].permissions) {
                            obj.properties[propKey].permissions = permDeserialize(obj.properties[propKey].permissions);
                        }

                        propsArray.push(Object.assign({ name: propKey }, obj.properties[propKey]));
                    });
                    obj.properties = propsArray;
                }

            }
            // arrayDeserialize(this);

            SPOO.getObjectById(this.role, this._id, function(data) {


                success(SPOO[thisRef.role](data))

            }, function(err) { error(err) }, app, client);
            return;

            if (this.inherits.length == 0) {
                success(thisRef);
                return this;
            }


            this.inherits.forEach(function(template) {

                if (thisRef._id != template) {

                    SPOO.getTemplateFieldsForObject(thisRef, template, function() {
                            counter++;
                            if (counter == thisRef.inherits.length) {
                                success(thisRef);
                                return this;
                            }
                        },
                        function(err) {

                            success(thisRef);
                            return this;
                        }, client)
                } else {
                    if (thisRef.inherits.length == 1) {
                        success(thisRef);
                        return this;
                    } else {
                        counter++;
                        return;
                    }
                }
            });

        }

        return this;
    },

    hello: function() {
        console.log("Hello from SPOO");
    }
}

var defaultPersistence = new DefaultStorageMapper({ multitenancy: 'tenantIdentifier' });
var defaultObserver = new DefaultObserverMapper(defaultPersistence);
var defaultProcessor = new DefaultProcessorMapper(SPOO);

var defaultMappers = {
    persistence: defaultPersistence,
    observer: defaultObserver,
    processor: defaultProcessor
}



if (_nodejs) module.exports = SPOO;
}).call(this,require('_process'))
},{"_process":14,"moment":1,"query":3,"shortid":4}],14:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[13]);
