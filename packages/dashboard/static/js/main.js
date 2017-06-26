"use strict";
requirejs.config({
    paths: {
        'domReady': '../../imports/domReady/domReady',
        jquery: '../../imports/jquery/dist/jquery.min',
        'stepik-api': '../../imports/js/stepik-api',
        'jquery.cookie': '../../imports/jquery/js/jquery.cookie',
        bootstrap: '../../imports/bootstrap/dist/js/bootstrap.min',
        'bootstrap-select': '../../imports/bootstrap-select/dist/js/bootstrap-select.min',
        flot: '../../imports/Flot/jquery.flot',
        'flot.time': '../../imports/Flot/jquery.flot.time',
    },
    shim: {
        'bootstrap': ['jquery'],
        'bootstrap-select': {
            deps: ['jquery', 'bootstrap'],
            exports: '$.fn.selectpicker'
        },
        'flot': ['jquery'],
        'flot.time': ['jquery', 'flot']
    }
});

define(['index']);
