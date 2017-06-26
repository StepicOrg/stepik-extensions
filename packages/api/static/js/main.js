"use strict";
requirejs.config({
    paths: {
        'domReady': '../../imports/domReady/domReady',
        jquery: '../../imports/jquery/dist/jquery.min',
        bootstrap: '../../imports/bootstrap/dist/js/bootstrap.min'
    },
    shim: {
        'bootstrap': ['jquery']
    }
});

define(['domReady!', 'index', 'bootstrap']);
