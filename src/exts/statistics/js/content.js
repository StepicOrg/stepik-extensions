/**
 * Created by meanmail on 20.03.17.
 */

;'use strict';

window.extensions.register("statistics", new function () {
    var EXT_ID = "statistics";

    this.init = function () {
        var courses_list = $("#statistics_course");
        courses_list.empty();

        stepik.getCourses(null, $.cookie("last_user_id"))
            .done(function (courses) {
                courses.forEach(function (course) {
                    courses_list.append("<option value='" + course.slug + "'>" + course.title + "</option>");
                });
            });
    }
});
