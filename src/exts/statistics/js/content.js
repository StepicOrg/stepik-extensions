/**
 * Created by meanmail on 20.03.17.
 */

;'use strict';

window.extensions.register("statistics", new function () {
    var EXT_ID = "statistics";

    this.init = function () {
        var selected_kind = !!extensions.getParam("lesson") ? "lesson" : "course";

        $(".tab").click(function (event) {
            var target = event.currentTarget;
            if (target != this) {
                return;
            }
            var panel_id = target.getAttribute("data-panel-id");

            $(target).parent(".tabs").find(".tab").each(function (index, tab) {
                $(tab).removeClass("tab-active");
                var panel = tab.getAttribute("data-panel-id");
                $("#" + panel).hide();
            });
            $(target).addClass("tab-active");
            var panel = $("#" + panel_id);
            panel.show();
            panel.trigger("panelShow");

            selected_kind = target.id == "statistics-tab-course" ? "course" : "lesson";

            paint();
        });

        var course_list = $("#statistics_course");
        course_list.empty();

        var lesson_list = $("#statistics_lesson");
        lesson_list.empty();

        $("#statistics-tab-" + selected_kind).trigger("click");

        stepik.getCurrentUser().done(function (data) {
            var user_id = data.users[0].id;
            stepik.getCourses({"teacher": user_id})
                .done(function (courses) {
                    courses.forEach(function (course) {
                        course_list.append("<option value='" + course.id + "'>" + course.title + "</option>");
                    });

                    var course = extensions.getParam("course");
                    if (!!course) {
                        course_list.val(course);
                    }

                    if (selected_kind == "course") {
                        paint();
                    }
                });

            stepik.getLessons({"teacher": user_id})
                .done(function (lessons) {
                    lessons.forEach(function (lesson) {
                        lesson_list.append("<option value='" + lesson.id + "' data-slug='" + lesson.slug + "'>" + lesson.title + "</option>");
                    });

                    var lesson = extensions.getParam("lesson");
                    if (!!lesson) {
                        lesson_list.val(lesson);
                    }

                    if (selected_kind == "lesson") {
                        paint();
                    }
                });
        });

        function paint() {
            if (selected_kind == "course") {
                draw_course_statistics();
            } else if (selected_kind == "lesson") {
                draw_lesson_statistics();
            }
        }

        $("<div id='tooltip'></div>").css({
            position: "absolute",
            display: "none",
            border: "1px solid #fdd",
            padding: "2px",
            "background-color": "#fee",
            opacity: 0.80
        }).appendTo("body");

        function draw_course_statistics() {
            var course = course_list.val();

            if (!!course) {
                stepik.getLessons({"course": course})
                    .done(function (lessons) {
                        var step_count = 0;
                        var statistics_lessons = $("#statistics_lessons");
                        statistics_lessons.html("Lessons:<br>");
                        lessons.forEach(function (lesson) {
                            step_count += lesson.steps.length;
                            statistics_lessons.append("<a href='?ext=" + EXT_ID + "&lesson=" + lesson.id + "'>" + lesson.title + "</a><br>");
                        });
                        $("#statistics_course_info").text("Lessons: " + lessons.length + ", steps: " + step_count);
                    });

                stepik.getCourseGrades(course)
                    .done(function (data) {
                        var users_joined = {};
                        data.forEach(function (item) {
                            var date = new Date(item.date_joined.substring(0, 10)).getTime();
                            var count = users_joined[date] || 0;
                            users_joined[date] = ++count;
                        });

                        var d1 = [];

                        for (var date in users_joined) {
                            d1.push([date, users_joined[date]]);
                        }

                        $.plot("#statistics_joined", [{
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

                            selection: {mode: "x"},
                            grid: {
                                hoverable: true
                            }
                        });

                        $("#statistics_joined").bind("plothover", function (event, pos, item) {
                            if (item) {
                                var date = new Date(item.datapoint[0]).toDateString();
                                var count = item.datapoint[1];

                                $("#tooltip").html(count + " user" + (count > 1 ? "s" : "") + " joined at " + date)
                                    .css({top: item.pageY + 5, left: item.pageX + 5})
                                    .fadeIn(200);
                            } else {
                                $("#tooltip").hide();
                            }
                        });
                    });
            }
        }

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

                    $.plot("#statistics_views", [{
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

                    $("#statistics_views").bind("plothover", function (event, pos, item) {
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
                if (values.length == 0) {
                    return;
                }

                return values.reduce(function (sum, value) {
                        return sum + value;
                    }, 0) / values.length;
            }

            function median(values) {
                var length = values.length;
                if (length == 0) {
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

                if (length % 2 != 0) {
                    return values[index];
                } else {
                    return (values[index] + values[index - 1])/2;
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
                        var data = steps[step_id];
                        var index = data[2];
                        avr_views.push([index, avg(views[step_id])]);
                        avr_attempts.push([index, avg(attempts[step_id])]);
                        medians.push([index, median(views[step_id]), 1, 1]);
                        views[step_id].forEach(function (value) {
                            points.push([index, value]);
                        });
                        ticks.push([index, data[0]])
                    }

                    $.plot("#statistics_avg_views", [{
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

                    $("#statistics_avg_views").bind("plothover", function (event, pos, item) {
                        if (item) {
                            var count = item.datapoint[1].toFixed(2);

                            $("#tooltip").html(count)
                                .css({top: item.pageY + 5, left: item.pageX + 5})
                                .fadeIn(200);
                        } else {
                            $("#tooltip").hide();
                        }
                    });

                    $.plot("#statistics_avg_attempts", [{
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

                    $("#statistics_avg_attempts").bind("plothover", function (event, pos, item) {
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

                    $.plot("#statistics_quartiles_views", [{
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
                            yerr: {show:true, asymmetric:true, upperCap: "-", lowerCap: "-", radius: 10},
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

                    $("#statistics_quartiles_views").bind("plothover", function (event, pos, item) {
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

        course_list.change(function () {
            if (course_list.val() === null) {
                return;
            }

            location.search = "?ext=" + EXT_ID + "&course=" + course_list.val();
        });

        lesson_list.change(function () {
            if (lesson_list.val() === null) {
                return;
            }

            location.search = "?ext=" + EXT_ID + "&lesson=" + lesson_list.val();
        });
    }
});
