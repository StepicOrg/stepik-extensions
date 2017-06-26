"use strict";
requirejs.config({
    paths: {
        'domReady': '../../imports/domReady/domReady',
        jquery: '../../imports/jquery/dist/jquery.min',
        'stepik-api': '../../imports/js/stepik-api',
        'jquery.cookie': '../../imports/jquery/js/jquery.cookie',
        bootstrap: '../../imports/bootstrap/dist/js/bootstrap.min',
        'bootstrap-select': '../../imports/bootstrap-select/dist/js/bootstrap-select.min',
        pdfmake: '../../imports/pdfmake/build/pdfmake.min',
        vfs_fonts: '../../imports/pdfmake/build/vfs_fonts'
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

define(['index', 'to_pdf', 'to_html', 'to_md']);
