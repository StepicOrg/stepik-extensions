define(["exports", "jquery"], function (exports, _jquery) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.swagger = undefined;

    var _jquery2 = _interopRequireDefault(_jquery);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var swagger = exports.swagger = {
        getApiDocs: function getApiDocs(url) {
            return _jquery2.default.get({
                url: url,
                dataType: "json"
            });
        },

        isPrimitive: function isPrimitive(type) {
            var PRIMITIVES = ["integer", "boolean", "number", "string", "void", "datetime", "choice", "object", "array", "float", "file upload", "url", "decimal", "email"];
            return PRIMITIVES.indexOf(type) !== -1;
        }
    };
});