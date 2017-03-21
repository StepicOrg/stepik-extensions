/**
 * Created by meanmail on 22.02.17.
 */

;'use strict';

window.extensions.register("dashboard", new function () {
    var EXT_ID = "dashboard";

    var ratings = {};

    this.init = function () {
        var courses_list = $("#dashboard_course");
        courses_list.empty();

        stepik.getCourses({"enrolled": true})
            .done(function (courses) {
                courses.forEach(function (course) {
                    courses_list.append("<option value='" + course.slug + "'>" + course.title + "</option>");
                });

                paint();
            });

        function paint() {
            if (courses_list.val() == null) {
                return;
            }

            $("<div id='tooltip'></div>").css({
                position: "absolute",
                display: "none",
                border: "1px solid #fdd",
                padding: "2px",
                "background-color": "#fee",
                opacity: 0.80
            }).appendTo("body");

            stepik.getJson('course/' + courses_list.val() + '/dashboard/ratings.json')
                .done(function (ratings) {
                    var counts = ratings.counts;
                    var bins = ratings.bins;

                    $(function () {
                        var d1 = [];
                        var max = 0;
                        for (var index in counts) {
                            var user_count = counts[index]
                            d1.push([bins[index], user_count]);
                            if (max < user_count) {
                                max = user_count;
                            }
                        }

                        var d2 = [[ratings.rating, 0], [ratings.rating, max]];

                        function plotWithOptions() {
                            $.plot("#dashboard_raiting", [{
                                data: d1,
                                label: "Users count",
                                bars: {
                                    show: true,
                                    barWidth: 10
                                },
                                color: "green",

                            }, {
                                data: d2,
                                label: "Your rating",
                                lines: {
                                    show: true
                                },
                                color: "blue"
                            }], {
                                yaxis: {
                                    transform: function (v) {
                                        if (v == 0) {
                                            return 0;
                                        }
                                        return Math.log(v);
                                    },
                                    inverseTransform: function (v) {
                                        return Math.exp(v);
                                    },
                                    ticks: tickGenerator,
                                    label: "Count"

                                },
                                xaxis: {
                                    label: "Points, %"
                                },

                                selection: {mode: "x"},
                                grid: {
                                    hoverable: true
                                }
                            });

                            $("#dashboard_raiting").bind("plothover", function (event, pos, item) {
                                if (item) {
                                    var x = item.datapoint[0],
                                        y = item.datapoint[1];
                                    var text;
                                    if (item.series.bars.show) {
                                        text = y + " users have from " + x + " to " + (x + 10) + "% points";
                                    } else {
                                        text = "Your points " + x + "%"
                                    }
                                    $("#tooltip").html(text)
                                        .css({top: item.pageY + 5, left: item.pageX + 5})
                                        .fadeIn(200);
                                } else {
                                    $("#tooltip").hide();
                                }
                            });
                        }

                        plotWithOptions();

                        function tickGenerator(axis) {
                            var res = [];
                            var step = Math.log(axis.max) / 10;
                            var i = 1;
                            do {
                                var v = Math.round(Math.exp(step * i));
                                res.push([v, v]);
                                ++i;
                            } while (v < axis.max);
                            return res;
                        }
                    });
                });

            stepik.getJson('course/' + courses_list.val() + '/dashboard/timeline.json')
                .done(function (data) {
                    var timeline = data.timeline;
                    $(function () {
                        var d1 = [];
                        var d2 = [];
                        var d3 = [];
                        var d4 = [];
                        var max = 0;
                        for (var i in timeline) {
                            var item = timeline[i];
                            var date = new Date(item.date).getTime();
                            d1.push([date, item.practice]);
                            d2.push([date, item.theory]);
                            d3.push([date, item.practicePerDay]);
                            d4.push([date, item.theoryPerDay]);
                        }

                        function plotWithOptions() {
                            $.plot("#dashboard_progress", [{
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
                                xaxis: {mode: "time"},
                                yaxis: {
                                    min: 0
                                },
                                selection: {mode: "x"},
                                grid: {
                                    hoverable: true
                                },
                                legend: {
                                    position: "nw",
                                    noColumns: 5
                                }
                            });

                            $("#dashboard_progress").bind("plothover", function (event, pos, item) {
                                if (item) {
                                    var x = item.datapoint[0];
                                    var y = Math.round(item.datapoint[1] * 10) / 10;

                                    $("#tooltip").html(y + "% " + item.series.label + "<br>" + new Date(x))
                                        .css({top: item.pageY + 5, left: item.pageX + 5})
                                        .fadeIn(200);
                                } else {
                                    $("#tooltip").hide();
                                }
                            });
                        }

                        plotWithOptions();
                    });
                });

        }

        courses_list.change(function () {
            if (courses_list.val() == null) {
                return;
            }
            paint();
        });
    }
});
