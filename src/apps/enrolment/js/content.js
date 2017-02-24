/**
 * Created by meanmail on 22.02.17.
 */

var APP_ID = "enrolment";

var localStorage = window['localStorage'];
var rows = [];
var course_id_column = 0;
var user_id_column = 1;

function reset_app() {
    clear_table();
    rows = readRows();
    if (!!!rows || rows.length == 0) {
        rows = [];
        var header = [];
        header[0] = "course_id";
        header[1] = "user_id";
        rows[0] = header;
    }
    course_id_column = localStorage.getItem(APP_ID + "_course_column_index");
    if (course_id_column == null) {
        course_id_column = 0;
    }

    user_id_column = localStorage.getItem(APP_ID + "_user_column_index");
    if (user_id_column == null) {
        user_id_column = 1;
    }
    init_column_selector();
}

function init_column_selector(lines) {
    if (rows.length > 0) {
        var header = rows[0];
        var userIdColumn = $("#enrollment_user-id-column");
        var courseIdColumn = $("#enrollment_course-id-column");
        userIdColumn.empty();
        courseIdColumn.empty();

        for (var column in header) {
            var option = "<option value='" + column + "'>" + header[column] + "</option>";
            userIdColumn.append(option);
            courseIdColumn.append(option);
        }
        courseIdColumn.children("option[value='" + course_id_column + "']").attr("selected", "selected");
        userIdColumn.children("option[value='" + user_id_column + "']").attr("selected", "selected");
    }
}

function clear_table() {
    $(".enrollment_table").empty();
}

function repaintTable() {
    clear_table();

    var table = $(".enrollment_table");
    var counter = 0;
    for (var row_index in rows) {
        var columns = rows[row_index];
        var row = "<tr><td>" + counter++ + "</td>";
        for (var column in columns) {
            row += "<td>" + columns[column] + "</td>";
        }
        row += "</tr>";
        table.append(row);
    }
}

function init() {
    $("#enrollment_as-single-id").click(function () {
        var id = +prompt("Input id", 0);

        if (isNaN(id)) {
            return;
        }

        var row = [];
        row[user_id_column] = id;
        row[course_id_column] = 548;
        rows[rows.length] = row;

        repaintTable();
    });

    $("#enrollment_clear").click(function () {
        clearRows();
        reset_app();
        repaintTable();
        $("#enrollment_ids_file").val(null);
    });

    $("#enrollment_ids_file").change(function (event) {
        var tfile;
        var reader = new FileReader();

        tfile = event.target.files[0];
        reader.readAsText(tfile);
        reset_app();
        reader.onload = function (e) {
            var str = e.target.result;
            var lines = str.split("\n");
            if (lines.length > 0) {
                rows = [];
                if (!isNaN(+lines[0][0])) {
                    var header = [];
                    for (var i = 0; i < (lines[0]).split(",").length; i++) {
                        header[i] = i + 1;
                    }
                    rows[0] = header;
                }
                lines.forEach(function (line) {
                    if (line.length == 0) {
                        return;
                    }
                    var columns = line.split(",");

                    var row = [];
                    for (var column in columns) {
                        row[row.length] = columns[column];
                    }
                    rows[rows.length] = row;
                });
            }

            init_column_selector();
            repaintTable();
        };
    });

    $("#enrollment_user-id-column").change(function (e) {
        user_id_column = $("#enrollment_user-id-column").val();
    });

    $("#enrollment_course-id-column").change(function (e) {
        course_id_column = $("#enrollment_course-id-column").val();
    });

    init_column_selector();
    repaintTable();
}

function saveRows() {
    localStorage.setItem(APP_ID + "_rows_count", rows.length);
    rows.forEach(function (item, i) {
        localStorage.setItem(APP_ID + "_rows_" + i, item);
    });

    localStorage.setItem(APP_ID + "_course_column_index", course_id_column);
    localStorage.setItem(APP_ID + "_user_column_index", user_id_column);
}

function readRows() {
    var count = localStorage.getItem(APP_ID + "_rows_count");

    if (isNaN(+count)) {
        return [];
    }
    var rows = [];
    for (var i = 0; i < count; i++) {
        var item = localStorage.getItem(APP_ID + "_rows_" + i);
        rows[i] = item.split(",");
    }

    return rows;
}

function clearRows() {
    localStorage.setItem(APP_ID + "_rows_count", 0);
    localStorage.setItem(APP_ID + "_course_column_index", 0);
    localStorage.setItem(APP_ID + "_user_column_index", 1);
}

window.onbeforeunload = function () {
    saveRows();
};

apps.getApp(APP_ID).init = init;
reset_app();