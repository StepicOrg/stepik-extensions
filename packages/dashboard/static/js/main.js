"use strict";
requirejs.config({
    paths: {
        'domReady': '../../imports/js/domReady',
        jquery: '../../imports/jquery/js/jquery.min',
        'stepik-api': '../../imports/js/stepik-api',
        'jquery.cookie': '../../imports/jquery/js/jquery.cookie',
        bootstrap: '../../imports/bootstrap/js/bootstrap.min',
        'bootstrap-select': '../../imports/bootstrap-select/js/bootstrap-select.min',
        flot: '../../imports/flot/js/jquery.flot',
        flot_time: '../../imports/flot/js/jquery.flot.time',
    },
    shim: {
        'bootstrap': ['jquery'],
        'bootstrap-select': {
            deps: ['jquery', 'bootstrap'],
            exports: '$.fn.selectpicker'
        },
        'flot': ['jquery'],
        'flot_time': ['jquery', 'flot']
    }
});

define(['domReady!',
    'index',
    'bootstrap',
    'bootstrap-select',
    'flot',
    'flot_time'], function () {
    console.log("Loaded index")
});