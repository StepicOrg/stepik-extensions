define(["jquery", "stepik-api", "pdfmake", "domReady!", "bootstrap-select", "bootstrap", "vfs_fonts"], function (_jquery, _stepikApi, _pdfmake) {
    "use strict";

    var _jquery2 = _interopRequireDefault(_jquery);

    var _stepikApi2 = _interopRequireDefault(_stepikApi);

    var _pdfmake2 = _interopRequireDefault(_pdfmake);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var courses_list = (0, _jquery2.default)("#course");
    courses_list.empty();
    (0, _jquery2.default)('.selectpicker').selectpicker('refresh');

    _stepikApi2.default.getCourses({ "enrolled": true }).done(function (courses) {
        courses.forEach(function (course) {
            var id = course['id'];
            courses_list.append("<option value='" + id + "'>" + course['title'] + "</option>");
        });

        courses_list.selectpicker('refresh');
    });
});