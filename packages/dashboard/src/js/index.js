import {$} from "../../imports/js/jquery";
import {stepik} from "../../imports/js/stepik-api";

export let init = (function () {
    const {get} = $;
    let ratings = {};

    let courses_list = $("#course");
    courses_list.empty();

    stepik.getCourses({"enrolled": true})
        .done(function (courses) {
            courses.forEach(function (course) {
                let slug = course['slug'];
                courses_list.append(`<option value='${slug}'>${course['title']}</option>`);
            });

            paint();
        });

    function paint() {
        let course = courses_list.val();
        if (!course) {
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

        stepik.getJson(`course/${course}/dashboard/ratings.json`)
            .done(function (ratings) {
                let counts = ratings['counts'];
                let bins = ratings['bins'];

                $(function () {
                    let d1 = [];
                    let max = 0;
                    for (let index of counts) {
                        let user_count = counts[index];
                        d1.push([bins[index], user_count]);
                        if (max < user_count) {
                            max = user_count;
                        }
                    }

                    let d2 = [[ratings['rating'], 0], [ratings['rating'], max]];

                    function plotWithOptions() {
                        $.plot("#rating", [{
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
                                transform: function (v) {
                                    if (v === 0) {
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

                        $("#rating").bind("plothover", function (event, pos, item) {
                            if (item) {
                                let x = item.datapoint[0],
                                    y = item.datapoint[1];
                                let text;
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
                        let res = [];
                        let step = Math.log(axis.max) / 10;
                        let i = 1;
                        let v;
                        do {
                            v = Math.round(Math.exp(step * i));
                            res.push([v, v]);
                            ++i;
                        } while (v < axis.max);
                        return res;
                    }
                });
            });

        stepik.getJson(`course/${course}/dashboard/timeline.json`)
            .done(function (data) {
                let timeline = data['timeline'];

                $(function () {
                    let d1 = [];
                    let d2 = [];
                    let d3 = [];
                    let d4 = [];

                    if (timeline) {
                        for (let i in timeline) {
                            if (!timeline.hasOwnProperty(i)) {
                                return;
                            }
                            let item = timeline[i];
                            let date = new Date(item.date).getTime();
                            d1.push([date, item['practice']]);
                            d2.push([date, item['theory']]);
                            d3.push([date, item['practicePerDay']]);
                            d4.push([date, item['theoryPerDay']]);
                        }
                    }

                    function plotWithOptions() {
                        $.plot("#progress", [{
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

                        $("#progress").bind("plothover", function (event, pos, item) {
                            if (item) {
                                let x = item.datapoint[0];
                                let y = Math.round(item.datapoint[1] * 10) / 10;

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
        if (courses_list.val() === null) {
            return;
        }
        paint();
    });
})();

