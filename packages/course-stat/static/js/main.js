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
        'flot.time': '../../imports/flot/js/jquery.flot.time',
        'flot.errorbars': '../../imports/flot/js/jquery.flot.errorbars'
    },
    shim: {
        'bootstrap': ['jquery'],
        'bootstrap-select': {
            deps: ['jquery', 'bootstrap'],
            exports: '$.fn.selectpicker'
        },
        'flot': ['jquery'],
        'flot.time': ['jquery', 'flot'],
        'flot.errorbars': ['jquery', 'flot']
    }
});

define(['index']);
