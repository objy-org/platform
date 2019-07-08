// platform.js

var SPOO = require('./spoo.js');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');

SPOO.ObjectFamily({
    name: "Object",
    pluralName: 'Objects'
})

