/**
 * Created by meanmail on 20.03.17.
 */

;'use strict';

window.extensions.register("statistics", new function () {
    var EXT_ID = "statistics";

    this.init = function () {
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
            panel.trigger("panelShow")
        });

        var course_list = $("#statistics_course");
        course_list.empty();

        var lesson_list = $("#statistics_lesson");
        lesson_list.empty();

        stepik.getCurrentUser().done(function (data) {
            var user_id = data.users[0].id;
            stepik.getCourses(null, user_id)
                .done(function (courses) {
                    courses.forEach(function (course) {
                        course_list.append("<option value='" + course.slug + "'>" + course.title + "</option>");
                    });
                    paint();
                });

            stepik.getLessons(null, user_id)
                .done(function (lessons) {
                    lessons.forEach(function (lesson) {
                        lesson_list.append("<option value='" + lesson.slug + "'>" + lesson.title + "</option>");
                    });
                    paint();
                });
        });

        function paint() {
        }

        course_list.change(function () {
            if (course_list.val() == null) {
                return;
            }

            paint();
        });
    }
});
