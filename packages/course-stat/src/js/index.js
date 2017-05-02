import "../../imports/js/domReady!";
import {$} from "../../imports/jquery/js/jquery";
import {stepik} from "../../imports/js/stepik-api";

let params = getParams();
let course_list = $("#course");
course_list.empty();

stepik.getCurrentUser().done(data => {
    let user_id = data['users'][0].id;
    stepik.getCourses({"teacher": user_id})
        .done(courses => {
            courses.forEach(course => {
                course_list.append(`<option value='${course.id}'>${course.title}</option>`);
            });

            let course = params['course'];
            if (!!course) {
                course_list.val(course);
            }

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
    let course = course_list.val();

    if (!!course) {
        stepik.getLessons({"course": course})
            .done(lessons => {
                let step_count = 0;
                let statistics_lessons = $("#lessons");
                statistics_lessons.html("Lessons:<br>");
                lessons.forEach(lesson => {
                    step_count += lesson.steps.length;
                    statistics_lessons.append(`<a href='?ext=lesson-stat&lesson=${lesson.id}'>${lesson.title}</a><br>`);
                });
                $("#course-info").text(`Lessons: ${lessons.length}, steps: ${step_count}`);
            });

        stepik.getCourseGrades(course)
            .done(data => {
                let users_joined = {};
                data.forEach(item => {
                    let date_joined = item.date_joined;
                    if (!date_joined) {
                        return;
                    }
                    let date = new Date(date_joined.substring(0, 10)).getTime();
                    let count = users_joined[date] || 0;
                    users_joined[date] = ++count;
                });

                let d1 = [];

                for (let date in users_joined) {
                    d1.push([date, users_joined[date]]);
                }

                $.plot("#joined", [{
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

                $("#joined").bind("plothover", (event, pos, item) => {
                    if (item) {
                        let date = new Date(item.datapoint[0]).toDateString();
                        let count = item.datapoint[1];

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

course_list.change(() => paint());

function getParams() {
    let params = {};

    let parts = window.location.search.substr(1).split("&");

    for (let index in parts) {
        let pair = parts[index].split("=");
        params[pair[0]] = decodeURIComponent(pair[1]);
    }

    return params;
}