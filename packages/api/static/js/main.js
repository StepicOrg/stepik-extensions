"use strict";
requirejs.config({
    paths: {
        'domReady': '../../imports/js/domReady',
        jquery: '../../imports/jquery/js/jquery.min',
        bootstrap: '../../imports/bootstrap/js/bootstrap.min'
    },
    shim: {
        'bootstrap': ['jquery']
    }
});

define(['domReady!', 'index', 'bootstrap']);
