/**
 * Created by meanmail on 22.02.17.
 */

var APP_ID = "dashboard";

var ratings = {};
var courses_list = $("#dashboard_course");

function init() {
    function loadCourses(page) {
        console.log(page);
        stepik.getJson("api/courses?enrolled=true&page=" + page, (function (page) {
            return function (data) {
                var courses = data.courses;
                for (var index in courses) {
                    var course = courses[index];
                    courses_list.append("<option value='" + course.slug + "'>" + course.title + "</option>")
                }

                if (data.meta.has_next) {
                    loadCourses(page + 1);
                } else {
                    paint();
                }
            }
        })(page));
    }

    courses_list.empty();
    loadCourses(1);

    function paint() {
        $("#dashboard_svg").empty();
        stepik.getJson('course/' + $("#dashboard_course").val() + '/dashboard/ratings.json', function (data) {
            ratings = data;
            var s = Snap("#dashboard_svg");
            var counts = ratings.counts;
            var bins = ratings.bins;
            var max = Math.log(counts[0]);
            var bottom = 250;
            var left = 60;
            var max_height = 200;
            var column_width = 25;
            var column_period = 30;

            for (var index in counts) {
                var height = (Math.log(counts[index]) * max_height) / max;
                if (height < 1) {
                    height = 1;
                }
                var x = column_period * index + left;
                var rect = s.rect(x, bottom - height, column_width, height);
                rect.attr({
                    fill: "green"
                });
                s.text(x, bottom + 15, bins[+index + 1]);
            }

            for (var i = 20; i < max_height; i += 20) {
                var value = Math.round(Math.exp(i * max / max_height));
                var y = bottom - i;
                s.text(0, y, value);
                s.rect(50, y, 5, 1);
            }

            s.text(0, bottom, "0");
            s.rect(50, bottom, 5, 1);
            s.text(0, bottom - max_height, counts[0]);
            s.rect(50, bottom - max_height, 5, 1);

            var rating = column_period * (ratings.rating / 10 - 1) + left + column_width;

            var rating_rect = s.rect(rating, bottom - max_height, 2, max_height);
            rating_rect.attr({
                fill: "red"
            });

            s.text(175, 15, "Рейтинг")
        });
    }

    $("#dashboard_course").change(function () {
        paint();
    });
}

apps.getApp(APP_ID).init = init;
