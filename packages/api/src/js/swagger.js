import $ from "jquery";

export let swagger = {
    getApiDocs: function (url) {
        return $.get({
            url: url,
            dataType: "json"
        });
    },

    isPrimitive: function (type) {
        let PRIMITIVES = ["integer", "boolean", "number", "string", "void", "datetime", "choice",
            "object", "array", "float", "file upload", "url", "decimal", "email"];
        return PRIMITIVES.indexOf(type) !== -1;
    }
};