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
    var lesson_list = (0, _jquery2.default)("#lesson");
    lesson_list.empty();
    (0, _jquery2.default)('.selectpicker').selectpicker('refresh');

    _stepikApi2.default.getCurrentUser().done(function (data) {
        var user_id = data['users'][0].id;

        _stepikApi2.default.getLessons({ "teacher": user_id }).done(function (lessons) {
            lessons.forEach(function (lesson) {
                lesson_list.append("<option value='" + lesson.id + "' data-slug='" + lesson.slug + "'>" + lesson.title + "</option>");
            });

            var lesson = params["lesson"];
            if (!!lesson) {
                lesson_list.val(lesson);
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
        var option = lesson_list.find("option:selected");
        var slug = option.attr("data-slug");
        if (!slug) {
            return;
        }

        _stepikApi2.default.getJson("lesson/" + slug + "/stats-json/").done(function (data) {
            var total_views = [];
            var unique_views = [];
            var unique_successes = [];
            var ticks = [];
            data.forEach(function (item, index) {
                total_views.push([index, item['total_views']]);
                unique_views.push([index, item['unique_views']]);
                unique_successes.push([index, item['unique_successes']]);
                ticks.push([index, item['title']]);
            });

            _jquery2.default.plot("#views", [{
                data: total_views,
                label: "Total views",
                points: {
                    radius: 3,
                    symbol: "circle",
                    show: true
                },
                lines: {
                    show: true
                },
                color: "green"
            }, {
                data: unique_views,
                label: "Unique views",
                points: {
                    radius: 3,
                    symbol: "circle",
                    show: true
                },
                lines: {
                    show: true
                },
                color: "red"
            }, {
                data: unique_successes,
                label: "Unique successes",
                points: {
                    radius: 3,
                    symbol: "circle",
                    show: true
                },
                lines: {
                    show: true
                },
                color: "blue"
            }], {
                yaxis: {
                    label: "Count",
                    min: 0,
                    minTickSize: 1,
                    tickDecimals: 0
                },
                xaxis: {
                    label: "Step",
                    ticks: ticks
                },

                selection: { mode: "x" },
                grid: {
                    hoverable: true
                }
            });

            (0, _jquery2.default)("#views").bind("plothover", function (event, pos, item) {
                if (item) {
                    var count = item.datapoint[1];

                    (0, _jquery2.default)("#tooltip").html(item.series.label + ": " + count).css({ top: item.pageY + 5, left: item.pageX + 5 }).fadeIn(200);
                } else {
                    (0, _jquery2.default)("#tooltip").hide();
                }
            });
        });

        function avg(values) {
            if (!values) {
                return;
            }
            return values.reduce(function (sum, value) {
                return sum + value;
            }, 0) / values.length;
        }

        function median(values) {
            if (!values) {
                return;
            }
            values.sort(function (a, b) {
                if (a > b) {
                    return 1;
                }
                if (a < b) {
                    return -1;
                }

                return 0;
            });

            var length = values.length;
            var index = Math.floor(length / 2);

            if (length % 2 !== 0) {
                return values[index];
            } else {
                return (values[index] + values[index - 1]) / 2;
            }
        }

        _stepikApi2.default.getJson("lesson/" + slug + "/stats-boxplot-json/").done(function (data) {
            if (!data) {
                return;
            }
            var steps = data['steps'] || [];
            var stat = data['stat'] || [];
            var views = stat['views'] || [];
            var attempts = stat['attempts'] || [];

            var avr_views = [];
            var avr_attempts = [];
            var medians = [];
            var points = [];
            var ticks = [];

            var _loop = function _loop(step_id) {
                if (!views.hasOwnProperty(step_id)) {
                    return "continue";
                }
                var view = views[step_id] || [];
                var attempt = attempts[step_id] || [];
                var step = steps[step_id] || [];
                var index = step[2];
                avr_views.push([index, avg(view)]);
                avr_attempts.push([index, avg(attempt)]);
                medians.push([index, median(view), 1, 1]);
                view.forEach(function (value) {
                    return points.push([index, value]);
                });
                ticks.push([index, step[0]]);
            };

            for (var step_id in views) {
                var _ret = _loop(step_id);

                if (_ret === "continue") continue;
            }

            _jquery2.default.plot("#avg_views", [{
                data: avr_views,
                label: "Avg views",
                bars: {
                    show: true,
                    align: "center"
                },
                color: "green"
            }], {
                yaxis: {
                    label: "Value",
                    min: 0
                },
                xaxis: {
                    label: "Step",
                    ticks: ticks
                },

                selection: { mode: "x" },
                grid: {
                    hoverable: true
                }
            });

            (0, _jquery2.default)("#avg_views").bind("plothover", function (event, pos, item) {
                if (item) {
                    var count = item.datapoint[1].toFixed(2);

                    (0, _jquery2.default)("#tooltip").html(count).css({ top: item.pageY + 5, left: item.pageX + 5 }).fadeIn(200);
                } else {
                    (0, _jquery2.default)("#tooltip").hide();
                }
            });

            _jquery2.default.plot("#avg_attempts", [{
                data: avr_attempts,
                label: "Avg attempts",
                bars: {
                    show: true,
                    align: "center"
                },
                color: "red"
            }], {
                yaxis: {
                    label: "Value",
                    min: 0
                },
                xaxis: {
                    label: "Step",
                    ticks: ticks
                },

                selection: { mode: "x" },
                grid: {
                    hoverable: true
                }
            });

            (0, _jquery2.default)("#avg_attempts").bind("plothover", function (event, pos, item) {
                if (item) {
                    var count = item.datapoint[1].toFixed(2);

                    (0, _jquery2.default)("#tooltip").html(count).css({ top: item.pageY + 5, left: item.pageX + 5 }).fadeIn(200);
                } else {
                    (0, _jquery2.default)("#tooltip").hide();
                }
            });

            function line(ctx, x, y, radius) {
                ctx.moveTo(x - radius, y);
                ctx.lineTo(x + radius, y);
            }

            _jquery2.default.plot("#quartiles_views", [{
                data: points,
                label: "Views",
                points: {
                    show: true
                },
                color: "lightgray"
            }, {
                data: medians,
                label: "Median views",
                points: {
                    radius: 10,
                    symbol: line,
                    errorbars: "y",
                    yerr: { show: true, asymmetric: true, upperCap: "-", lowerCap: "-", radius: 10 },
                    show: true
                },
                color: "red"
            }], {
                yaxis: {
                    label: "Value",
                    min: 0
                },
                xaxis: {
                    label: "Step",
                    ticks: ticks
                },

                selection: { mode: "x" },
                grid: {
                    hoverable: true
                }
            });

            (0, _jquery2.default)("#quartiles_views").bind("plothover", function (event, pos, item) {
                if (item) {
                    var count = item.datapoint[1].toFixed(2);

                    (0, _jquery2.default)("#tooltip").html(count).css({ top: item.pageY + 5, left: item.pageX + 5 }).fadeIn(200);
                } else {
                    (0, _jquery2.default)("#tooltip").hide();
                }
            });
        });
    }

    lesson_list.change(function () {
        return paint();
    });

    function getParams() {
        var params = {};

        var parts = window.location.search.substr(1).split("&");

        for (var _index in parts) {
            var pair = parts[_index].split("=");
            params[pair[0]] = decodeURIComponent(pair[1]);
        }

        return params;
    }
});