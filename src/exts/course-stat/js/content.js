/**
 * Created by meanmail on 20.03.17.
 */

;'use strict';

window.extensions.register("course-stat", new function () {
    var EXT_ID = "course-stat";

    this.init = function () {
        var course_list = $("#" + EXT_ID + "_course");
        course_list.empty();

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

                    paint();
                });
        });

        function paint() {
            draw_course_statistics();
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
                        var statistics_lessons = $("#" + EXT_ID + "_lessons");
                        statistics_lessons.html("Lessons:<br>");
                        lessons.forEach(function (lesson) {
                            step_count += lesson.steps.length;
                            statistics_lessons.append("<a href='?ext=lesson-stat" + "&lesson=" + lesson.id + "'>" + lesson.title + "</a><br>");
                        });
                        $("#" + EXT_ID + "_course_info").text("Lessons: " + lessons.length + ", steps: " + step_count);
                    });

                stepik.getCourseGrades(course)
                    .done(function (data) {
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

                        $.plot("#" + EXT_ID + "_joined", [{
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

                        $("#" + EXT_ID + "_joined").bind("plothover", function (event, pos, item) {
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

        course_list.change(function () {
            if (course_list.val() === null) {
                return;
            }

            location.search = "?ext=" + EXT_ID + "&course=" + course_list.val();
        });
    }
});
