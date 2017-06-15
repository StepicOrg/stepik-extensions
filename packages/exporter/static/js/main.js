"use strict";
requirejs.config({
    paths: {
        'domReady': '../../imports/js/domReady',
        jquery: '../../imports/jquery/js/jquery.min',
        'jquery.cookie': '../../imports/jquery/js/jquery.cookie',
        'stepik-api': '../../imports/js/stepik-api',
        bootstrap: '../../imports/bootstrap/js/bootstrap.min',
        'bootstrap-select': '../../imports/bootstrap-select/js/bootstrap-select.min',
        pdfmake: '../../imports/pdfmake/js/pdfmake.min',
        vfs_fonts: '../../imports/pdfmake/js/vfs_fonts'
    },
    shim: {
        bootstrap: ['jquery'],
        'bootstrap-select': {
            deps: ['jquery', 'bootstrap'],
            exports: '$.fn.selectpicker'
        },
        pdfmake: [],
        vfs_fonts: ['pdfmake']
    }
});

define(['index']);
