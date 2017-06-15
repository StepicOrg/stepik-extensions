import "domReady!";
import $ from "jquery";
import stepik from "stepik-api";
import "bootstrap"
import "bootstrap-select"
import "flot"
import "flot.time"
import "flot.errorbars"

let params = getParams();
let lesson_list = $("#lesson");
lesson_list.empty();
$('.selectpicker').selectpicker('refresh');

stepik.getCurrentUser().done(data => {
    let user_id = data['users'][0].id;

    stepik.getLessons({"teacher": user_id})
        .done(lessons => {
            lessons.forEach(lesson => {
                lesson_list.append(`<option value='${lesson.id}' data-slug='${lesson.slug}'>${lesson.title}</option>`);
            });

            let lesson = params["lesson"];
            if (!!lesson) {
                lesson_list.val(lesson);
            }

            $('.selectpicker').selectpicker('refresh');

            paint();
        });
});

$("<div id='tooltip'></div>").css({
    position: "absolute",
    display: "none",
    border: "1px solid #fdd",
    padding: "2px",
    "background-color": "#fee",
    opacity: 0.80
}).appendTo("body");

function paint() {
    let option = lesson_list.find("option:selected");
    let slug = option.attr("data-slug");
    if (!slug) {
        return;
    }

    stepik.getJson(`lesson/${slug}/stats-json/`)
        .done(data => {
            let total_views = [];
            let unique_views = [];
            let unique_successes = [];
            let ticks = [];
            data.forEach((item, index) => {
                total_views.push([index, item['total_views']]);
                unique_views.push([index, item['unique_views']]);
                unique_successes.push([index, item['unique_successes']]);
                ticks.push([index, item['title']])
            });

            $.plot("#views", [{
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

            $("#views").bind("plothover", (event, pos, item) => {
                if (item) {
                    let count = item.datapoint[1];

                    $("#tooltip").html(item.series.label + ": " + count)
                        .css({top: item.pageY + 5, left: item.pageX + 5})
                        .fadeIn(200);
                } else {
                    $("#tooltip").hide();
                }
            });
        });

    function avg(values) {
        if (!values) {
            return;
        }
        return values.reduce((sum, value) => {
                return sum + value;
            }, 0) / values.length;
    }

    function median(values) {
        if (!values) {
            return;
        }
        values.sort((a, b) => {
            if (a > b) {
                return 1;
            }
            if (a < b) {
                return -1;
            }

            return 0;
        });

        let length = values.length;
        let index = Math.floor(length / 2);

        if (length % 2 !== 0) {
            return values[index];
        } else {
            return (values[index] + values[index - 1]) / 2;
        }
    }

    stepik.getJson(`lesson/${slug}/stats-boxplot-json/`)
        .done(data => {
            if (!data) {
                return;
            }
            let steps = data['steps'] || [];
            let stat = data['stat'] || [];
            let views = stat['views'] || [];
            let attempts = stat['attempts'] || [];

            let avr_views = [];
            let avr_attempts = [];
            let medians = [];
            let points = [];
            let ticks = [];
            for (let step_id in views) {
                if (!views.hasOwnProperty(step_id)) {
                    continue;
                }
                let view = views[step_id] || [];
                let attempt = attempts[step_id] || [];
                let step = steps[step_id] || [];
                let index = step[2];
                avr_views.push([index, avg(view)]);
                avr_attempts.push([index, avg(attempt)]);
                medians.push([index, median(view), 1, 1]);
                view.forEach(value => points.push([index, value]));
                ticks.push([index, step[0]])
            }

            $.plot("#avg_views", [{
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

            $("#avg_views").bind("plothover", (event, pos, item) => {
                if (item) {
                    let count = item.datapoint[1].toFixed(2);

                    $("#tooltip").html(count)
                        .css({top: item.pageY + 5, left: item.pageX + 5})
                        .fadeIn(200);
                } else {
                    $("#tooltip").hide();
                }
            });

            $.plot("#avg_attempts", [{
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

            $("#avg_attempts").bind("plothover", (event, pos, item) => {
                if (item) {
                    let count = item.datapoint[1].toFixed(2);

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

            $.plot("#quartiles_views", [{
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

            $("#quartiles_views").bind("plothover", (event, pos, item) => {
                if (item) {
                    let count = item.datapoint[1].toFixed(2);

                    $("#tooltip").html(count)
                        .css({top: item.pageY + 5, left: item.pageX + 5})
                        .fadeIn(200);
                } else {
                    $("#tooltip").hide();
                }
            });
        })
}

lesson_list.change(() => paint());

function getParams() {
    let params = {};

    let parts = window.location.search.substr(1).split("&");

    for (let index in parts) {
        let pair = parts[index].split("=");
        params[pair[0]] = decodeURIComponent(pair[1]);
    }

    return params;
}
