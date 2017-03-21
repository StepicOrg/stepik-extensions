/**
 * Created by meanmail on 20.03.17.
 */

;'use strict';

window.extensions.register("lesson-stat", new function () {
    var EXT_ID = "lesson-stat";

    this.init = function () {
        var lesson_list = $("#" + EXT_ID + "_lesson");
        lesson_list.empty();

        stepik.getCurrentUser().done(function (data) {
            var user_id = data.users[0].id;

            stepik.getLessons({"teacher": user_id})
                .done(function (lessons) {
                    lessons.forEach(function (lesson) {
                        lesson_list.append("<option value='" + lesson.id + "' data-slug='" + lesson.slug + "'>" + lesson.title + "</option>");
                    });

                    var lesson = extensions.getParam("lesson");
                    if (!!lesson) {
                        lesson_list.val(lesson);
                    }

                    paint();
                });
        });

        function paint() {
            draw_lesson_statistics();
        }

        $("<div id='tooltip'></div>").css({
            position: "absolute",
            display: "none",
            border: "1px solid #fdd",
            padding: "2px",
            "background-color": "#fee",
            opacity: 0.80
        }).appendTo("body");

        function draw_lesson_statistics() {
            var option = lesson_list.find("option:selected");
            var slug = option.attr("data-slug");
            if (!slug) {
                return;
            }

            stepik.getJson("lesson/" + slug + "/stats-json/")
                .done(function (data) {
                    var total_views = [];
                    var unique_views = [];
                    var unique_successes = [];
                    var ticks = [];
                    data.forEach(function (item, index) {
                        total_views.push([index, item.total_views]);
                        unique_views.push([index, item.unique_views]);
                        unique_successes.push([index, item.unique_successes]);
                        ticks.push([index, item.title])
                    });

                    $.plot("#" + EXT_ID + "_views", [{
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
                    },
                        {
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
                        },
                        {
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
                        }
                    ], {
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

                        selection: {mode: "x"},
                        grid: {
                            hoverable: true
                        }
                    });

                    $("#" + EXT_ID + "_views").bind("plothover", function (event, pos, item) {
                        if (item) {
                            var count = item.datapoint[1];

                            $("#tooltip").html(item.series.label + ": " + count)
                                .css({top: item.pageY + 5, left: item.pageX + 5})
                                .fadeIn(200);
                        } else {
                            $("#tooltip").hide();
                        }
                    });
                });

            function avg(values) {
                if (values.length === 0) {
                    return;
                }

                return values.reduce(function (sum, value) {
                        return sum + value;
                    }, 0) / values.length;
            }

            function median(values) {
                var length = values.length;
                if (length === 0) {
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

                var index = Math.floor(length / 2);

                if (length % 2 !== 0) {
                    return values[index];
                } else {
                    return (values[index] + values[index - 1]) / 2;
                }
            }

            stepik.getJson("lesson/" + slug + "/stats-boxplot-json/")
                .done(function (data) {
                    var steps = data.steps;
                    var views = data.stat.views;
                    var attempts = data.stat.attempts;

                    var avr_views = [];
                    var avr_attempts = [];
                    var medians = [];
                    var points = [];
                    var ticks = [];
                    for (var step_id in views) {
                        var view = views[step_id];
                        var attempt = attempts[step_id];
                        var step = steps[step_id];
                        var index = step[2];
                        avr_views.push([index, avg(view)]);
                        avr_attempts.push([index, avg(attempt)]);
                        medians.push([index, median(view), 1, 1]);
                        view.forEach(function (value) {
                            points.push([index, value]);
                        });
                        ticks.push([index, step[0]])
                    }

                    $.plot("#" + EXT_ID + "_avg_views", [{
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

                        selection: {mode: "x"},
                        grid: {
                            hoverable: true
                        }
                    });

                    $("#" + EXT_ID + "_avg_views").bind("plothover", function (event, pos, item) {
                        if (item) {
                            var count = item.datapoint[1].toFixed(2);

                            $("#tooltip").html(count)
                                .css({top: item.pageY + 5, left: item.pageX + 5})
                                .fadeIn(200);
                        } else {
                            $("#tooltip").hide();
                        }
                    });

                    $.plot("#" + EXT_ID + "_avg_attempts", [{
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

                        selection: {mode: "x"},
                        grid: {
                            hoverable: true
                        }
                    });

                    $("#" + EXT_ID + "_avg_attempts").bind("plothover", function (event, pos, item) {
                        if (item) {
                            var count = item.datapoint[1].toFixed(2);

                            $("#tooltip").html(count)
                                .css({top: item.pageY + 5, left: item.pageX + 5})
                                .fadeIn(200);
                        } else {
                            $("#tooltip").hide();
                        }
                    });

                    function line(ctx, x, y, radius) {
                        ctx.moveTo(x - radius, y);
                        ctx.lineTo(x + radius, y);
                    }

                    $.plot("#" + EXT_ID + "_quartiles_views", [{
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
                            yerr: {show: true, asymmetric: true, upperCap: "-", lowerCap: "-", radius: 10},
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

                        selection: {mode: "x"},
                        grid: {
                            hoverable: true
                        }
                    });

                    $("#" + EXT_ID + "_quartiles_views").bind("plothover", function (event, pos, item) {
                        if (item) {
                            var count = item.datapoint[1].toFixed(2);

                            $("#tooltip").html(count)
                                .css({top: item.pageY + 5, left: item.pageX + 5})
                                .fadeIn(200);
                        } else {
                            $("#tooltip").hide();
                        }
                    });
                })
        }

        lesson_list.change(function () {
            if (lesson_list.val() === null) {
                return;
            }

            location.search = "?ext=" + EXT_ID + "&lesson=" + lesson_list.val();
        });
    }
});
