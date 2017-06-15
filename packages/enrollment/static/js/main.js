"use strict";
requirejs.config({
    paths: {
        'domReady': '../../imports/js/domReady',
        jquery: '../../imports/jquery/js/jquery.min',
        'stepik-api': '../../imports/js/stepik-api',
        'jquery.cookie': '../../imports/jquery/js/jquery.cookie',
        bootstrap: '../../imports/bootstrap/js/bootstrap.min',
        'bootstrap-select': '../../imports/bootstrap-select/js/bootstrap-select.min',
    },
    shim: {
        'bootstrap': ['jquery'],
        'bootstrap-select': {
            deps: ['jquery', 'bootstrap'],
            exports: '$.fn.selectpicker'
        }
    }
});

define(['index']);
