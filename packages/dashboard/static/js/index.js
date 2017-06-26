define(["exports", "jquery", "stepik-api", "domReady!", "bootstrap-select", "bootstrap", "flot", "flot.time"], function (exports, _jquery, _stepikApi) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.init = undefined;

    var _jquery2 = _interopRequireDefault(_jquery);

    var _stepikApi2 = _interopRequireDefault(_stepikApi);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var init = exports.init = function () {
        var ratings = {};

        var courses_list = (0, _jquery2.default)("#course");
        courses_list.empty();
        (0, _jquery2.default)('.selectpicker').selectpicker('refresh');

        _stepikApi2.default.getCourses({ "enrolled": true }).done(function (courses) {
            courses.forEach(function (course) {
                var slug = course['slug'];
                courses_list.append("<option value='" + slug + "'>" + course['title'] + "</option>");
            });

            courses_list.selectpicker('refresh');

            paint();
        });

        function paint() {
            var course = courses_list.val();
            if (!course) {
                return;
            }

            (0, _jquery2.default)("<div id='tooltip'></div>").css({
                position: "absolute",
                display: "none",
                border: "1px solid #fdd",
                padding: "2px",
                "background-color": "#fee",
                opacity: 0.80
            }).appendTo("body");

            _stepikApi2.default.getJson("course/" + course + "/dashboard/ratings.json").done(function (ratings) {
                var counts = ratings['counts'];
                var bins = ratings['bins'];

                (0, _jquery2.default)(function () {
                    var d1 = [];
                    var max = 0;
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = counts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var index = _step.value;

                            var user_count = counts[index];
                            d1.push([bins[index], user_count]);
                            if (max < user_count) {
                                max = user_count;
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    var d2 = [[ratings['rating'], 0], [ratings['rating'], max]];

                    function plotWithOptions() {
                        _jquery2.default.plot("#rating", [{
                            data: d1,
                            label: "Users count",
                            bars: {
                                show: true,
                                barWidth: 10
                            },
                            color: "green"

                        }, {
                            data: d2,
                            label: "Your rating",
                            lines: {
                                show: true
                            },
                            color: "blue"
                        }], {
                            yaxis: {
                                transform: function transform(v) {
                                    if (v === 0) {
                                        return 0;
                                    }
                                    return Math.log(v);
                                },
                                inverseTransform: function inverseTransform(v) {
                                    return Math.exp(v);
                                },
                                ticks: tickGenerator,
                                label: "Count"

                            },
                            xaxis: {
                                label: "Points, %"
                            },

                            selection: { mode: "x" },
                            grid: {
                                hoverable: true
                            }
                        });

                        (0, _jquery2.default)("#rating").bind("plothover", function (event, pos, item) {
                            if (item) {
                                var x = item.datapoint[0],
                                    y = item.datapoint[1];
                                var text = void 0;
                                if (item.series.bars.show) {
                                    text = y + " users have from " + x + " to " + (x + 10) + "% points";
                                } else {
                                    text = "Your points " + x + "%";
                                }
                                (0, _jquery2.default)("#tooltip").html(text).css({ top: item.pageY + 5, left: item.pageX + 5 }).fadeIn(200);
                            } else {
                                (0, _jquery2.default)("#tooltip").hide();
                            }
                        });
                    }

                    plotWithOptions();

                    function tickGenerator(axis) {
                        var res = [];
                        var step = Math.log(axis.max) / 10;
                        var i = 1;
                        var v = void 0;
                        do {
                            v = Math.round(Math.exp(step * i));
                            res.push([v, v]);
                            ++i;
                        } while (v < axis.max);
                        return res;
                    }
                });
            });

            _stepikApi2.default.getJson("course/" + course + "/dashboard/timeline.json").done(function (data) {
                var timeline = data['timeline'];

                (0, _jquery2.default)(function () {
                    var d1 = [];
                    var d2 = [];
                    var d3 = [];
                    var d4 = [];

                    if (timeline) {
                        for (var i in timeline) {
                            if (!timeline.hasOwnProperty(i)) {
                                return;
                            }
                            var item = timeline[i];
                            var date = new Date(item.date).getTime();
                            d1.push([date, item['practice']]);
                            d2.push([date, item['theory']]);
                            d3.push([date, item['practicePerDay']]);
                            d4.push([date, item['theoryPerDay']]);
                        }
                    }

                    function plotWithOptions() {
                        _jquery2.default.plot("#progress", [{
                            data: d1,
                            label: "Practice",
                            lines: {
                                show: true
                            },
                            color: "green"

                        }, {
                            data: d2,
                            label: "Theory",
                            lines: {
                                show: true
                            },
                            color: "blue"

                        }, {
                            data: d3,
                            label: "Practice per Day",
                            lines: {
                                show: true
                            },
                            color: "red"

                        }, {
                            data: d4,
                            label: "Theory per Day",
                            lines: {
                                show: true
                            },
                            color: "yellow"

                        }], {
                            xaxis: { mode: "time" },
                            yaxis: {
                                min: 0
                            },
                            selection: { mode: "x" },
                            grid: {
                                hoverable: true
                            },
                            legend: {
                                position: "nw",
                                noColumns: 5
                            }
                        });

                        (0, _jquery2.default)("#progress").bind("plothover", function (event, pos, item) {
                            if (item) {
                                var x = item.datapoint[0];
                                var y = Math.round(item.datapoint[1] * 10) / 10;

                                (0, _jquery2.default)("#tooltip").html(y + "% " + item.series.label + "<br>" + new Date(x)).css({ top: item.pageY + 5, left: item.pageX + 5 }).fadeIn(200);
                            } else {
                                (0, _jquery2.default)("#tooltip").hide();
                            }
                        });
                    }

                    plotWithOptions();
                });
            });
        }

        courses_list.change(function () {
            if (courses_list.val() === null) {
                return;
            }
            paint();
        });
    }();
});