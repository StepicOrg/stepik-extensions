define(["jquery", "stepik-api", "domReady!", "bootstrap", "bootstrap-select", "flot", "flot.time", "flot.errorbars"], function (_jquery, _stepikApi) {
    "use strict";

    var _jquery2 = _interopRequireDefault(_jquery);

    var _stepikApi2 = _interopRequireDefault(_stepikApi);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var params = getParams();
    var course_list = (0, _jquery2.default)("#course");
    course_list.empty();
    (0, _jquery2.default)('.selectpicker').selectpicker('refresh');

    _stepikApi2.default.getCurrentUser().done(function (data) {
        var user_id = data['users'][0].id;
        _stepikApi2.default.getCourses({ "teacher": user_id }).done(function (courses) {
            courses.forEach(function (course) {
                course_list.append("<option value='" + course.id + "'>" + course.title + "</option>");
            });

            var course = params['course'];
            if (!!course) {
                course_list.val(course);
            }
            (0, _jquery2.default)('.selectpicker').selectpicker('refresh');

            paint();
        });
    });

    (0, _jquery2.default)("<div id='tooltip'></div>").css({
        position: "absolute",
        display: "none",
        border: "1px solid #fdd",
        padding: "2px",
        "background-color": "#fee",
        opacity: 0.80
    }).appendTo("body");

    function paint() {
        var course = course_list.val();

        if (!!course) {
            _stepikApi2.default.getLessons({ "course": course }).done(function (lessons) {
                var step_count = 0;
                var statistics_lessons = (0, _jquery2.default)("#lessons");
                statistics_lessons.html("Lessons:<br>");
                lessons.forEach(function (lesson) {
                    step_count += lesson.steps.length;
                    statistics_lessons.append("<a href='" + window.location.origin + "/extensions/org.stepik.extensions.stat.lesson/running/?lesson=" + lesson.id + "'>" + lesson.title + "</a><br>");
                });
                (0, _jquery2.default)("#course-info").text("Lessons: " + lessons.length + ", steps: " + step_count);
            });

            _stepikApi2.default.getCourseGrades(course).done(function (data) {
                var users_joined = {};
                data.forEach(function (item) {
                    var date_joined = item.date_joined;
                    if (!date_joined) {
                        return;
                    }
                    var date = new Date(date_joined.substring(0, 10)).getTime();
                    var count = users_joined[date] || 0;
                    users_joined[date] = ++count;
                });

                var d1 = [];

                for (var date in users_joined) {
                    d1.push([date, users_joined[date]]);
                }

                d1.sort(function (a, b) {
                    return a[0] - b[0];
                });

                _jquery2.default.plot("#joined", [{
                    data: d1,
                    label: "Users count",
                    points: {
                        radius: 3,
                        symbol: "circle",
                        show: true
                    },
                    lines: {
                        show: true
                    },
                    color: "green"
                }], {
                    yaxis: {
                        label: "Count",
                        min: 0,
                        minTickSize: 1,
                        tickDecimals: 0
                    },
                    xaxis: {
                        label: "Date",
                        mode: "time"
                    },

                    selection: { mode: "x" },
                    grid: {
                        hoverable: true
                    }
                });

                (0, _jquery2.default)("#joined").bind("plothover", function (event, pos, item) {
                    if (item) {
                        var _date = new Date(item.datapoint[0]).toDateString();
                        var count = item.datapoint[1];

                        (0, _jquery2.default)("#tooltip").html(count + " user" + (count > 1 ? "s" : "") + " joined at " + _date).css({ top: item.pageY + 5, left: item.pageX + 5 }).fadeIn(200);
                    } else {
                        (0, _jquery2.default)("#tooltip").hide();
                    }
                });
            });
        }
    }

    course_list.change(function () {
        return paint();
    });

    function getParams() {
        var params = {};

        var parts = window.location.search.substr(1).split("&");

        for (var index in parts) {
            var pair = parts[index].split("=");
            params[pair[0]] = decodeURIComponent(pair[1]);
        }

        return params;
    }
});