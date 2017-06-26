import "domReady!";
import $ from "jquery";
import stepik from "stepik-api";
import "bootstrap-select";
import "bootstrap";
import pdfMake from "pdfmake";
import "vfs_fonts";

let courses_list = $("#course");
courses_list.empty();
$('.selectpicker').selectpicker('refresh');

stepik.getCourses({"enrolled": true})
    .done(courses => {
        courses.forEach(course => {
            let id = course['id'];
            courses_list.append(`<option value='${id}'>${course['title']}</option>`);
        });

        courses_list.selectpicker('refresh');
    });
