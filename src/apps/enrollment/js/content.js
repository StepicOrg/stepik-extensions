/**
 * Created by meanmail on 22.02.17.
 */
;'use strict';

(function () {
    var APP_ID = "enrollment";

    var localStorage = window.localStorage;
    var rows = [];
    var course_id_column = 0;
    var user_id_column = 1;

    function reset_app() {
        clear_table();
        rows = readRows();
        if (!rows || rows.length == 0) {
            rows = [];
            var header = [];
            header[0] = "course_id";
            header[1] = "user_id";
            rows[0] = {
                fields: header,
                status: ""
            };
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

    function init_column_selector() {
        if (rows.length > 0) {
            var header = rows[0].fields;
            var userIdColumn = $("#enrollment_user-id-column");
            var courseIdColumn = $("#enrollment_course-id-column");
            userIdColumn.empty();
            courseIdColumn.empty();

            for (var column in header) {
                if (!header.hasOwnProperty(column)) {
                    continue;
                }
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
            var row = rows[row_index];
            var columns = row.fields;
            var td_class = APP_ID + "_" + row.status;
            var index = counter != 0 ? counter : "#";
            var title = counter != 0 ? row.status_description : "";
            counter++;
            var table_row = "<tr title='" + title + "'><td class='" + td_class + "'>" + index + "</td>";
            for (var column in columns) {
                table_row += "<td>" + columns[column] + "</td>";
            }
            table_row += "</tr>";
            table.append(table_row);
        }
    }

    function init() {
        $("#enrollment_as-single-id").click(function () {
            var user_id = prompt("User id", "0");
            if (user_id == null) {
                return
            }
            var course_id = prompt("Course id", "0");
            if (course_id == null) {
                return
            }
            var row = {
                fields: []
            };
            row.fields[user_id_column] = user_id;
            row.fields[course_id_column] = course_id;
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
            var file;
            var reader = new FileReader();

            file = event.target.files[0];
            reader.readAsText(file);
            reset_app();
            reader.onload = function (e) {
                var str = e.target.result;
                var lines = str.split("\n");
                if (lines.length > 0) {
                    rows = [];
                    if (!isNaN(+lines[0][0])) {
                        var header = [];
                        var line = split(lines[0]);
                        for (var i = 0; i < line.length; i++) {
                            header[i] = i + 1;
                        }
                        rows[0] = {
                            fields: header
                        };
                    }
                    lines.forEach(function (line) {
                        if (line.length == 0) {
                            return;
                        }
                        var columns = split(line);

                        var fields = [];
                        for (var column in columns) {
                            fields[fields.length] = columns[column];
                        }
                        rows[rows.length] = {
                            fields: fields
                        };
                    });
                }

                init_column_selector();
                repaintTable();
            };
        });

        $("#enrollment_user-id-column").change(function () {
            user_id_column = $("#enrollment_user-id-column").val();
        });

        $("#enrollment_course-id-column").change(function () {
            course_id_column = $("#enrollment_course-id-column").val();
        });

        $("#enrollment_enroll").click(
            function () {
                var members = {};
                for (var i = 1; i < rows.length; i++) {
                    var course_id = rows[i].fields[course_id_column];
                    var users = members[course_id] || (members[course_id] = []);
                    users.push({
                        user_id: rows[i].fields[user_id_column],
                        row: rows[i]
                    });
                }

                for (course_id in members) {
                    addLearners(course_id, members[course_id]);
                }
            }
        );

        init_column_selector();
        repaintTable();
    }

    function addLearners(course_id, users) {
        course_id = +course_id;

        if (isNaN(course_id) || users == null || users.length == 0) {
            users.forEach(function (user) {
                user.row.status = "fail";
                user.row.status_description = "Not a correct data";
            });
            return
        }

        stepik.getCourse(course_id)
            .done(function (data) {
                var learners_group = data.courses[0].learners_group;
                if (!learners_group) {
                    users.forEach(function (user) {
                        user.row.status = "fail";
                        user.row.status_description = "Course: You do not have permission to perform this action.";
                    });
                    repaintTable();
                    return;
                }

                stepik.getMembers(learners_group)
                    .done(function (data) {
                        var members = [];
                        for (var i = 0; i < data.members.length; i++) {
                            members.push('' + data.members[i].user)
                        }
                        console.log(members);
                        for (var index = 0; index < users.length; index++) {
                            var user = users[index];
                            if (members.indexOf(user.user_id) != -1) {
                                user.skip = true;
                                user.row.status = "added";
                                user.row.status_description = "Already";
                            }
                        }
                        repaintTable();
                    })
                    .always(function () {
                        users.filter(function (user) {
                            return !user.skip;
                        })
                            .forEach(function (user) {
                                stepik.addMembers(learners_group, user.user_id)
                                    .done(function () {
                                        user.row.status = "added";
                                        user.row.status_description = "Done";
                                        repaintTable();
                                    })
                                    .fail(function (data) {
                                        user.row.status = "fail";
                                        var json = data.responseJSON;
                                        user.row.status_description = json.detail || json.__all__;
                                        repaintTable();
                                    });
                            });
                    });
            })
            .fail(function (data) {
                users.forEach(function (user) {
                    user.row.status = "fail";
                    user.row.status_description = "Course: " + data.responseJSON.detail;
                });
                repaintTable();
            });
    }

    function saveState() {
        localStorage.setItem(APP_ID + "_rows_count", rows.length);
        rows.forEach(function (item, i) {
            localStorage.setItem(APP_ID + "_rows_fields_" + i, join(item.fields));
            localStorage.setItem(APP_ID + "_rows_status_" + i, item.status);
            localStorage.setItem(APP_ID + "_rows_status_description_" + i, item.status_description);
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
            var item = localStorage.getItem(APP_ID + "_rows_fields_" + i);
            var status = localStorage.getItem(APP_ID + "_rows_status_" + i);
            var status_description = localStorage.getItem(APP_ID + "_rows_status_description_" + i);

            if (!!item) {
                rows[i] = {
                    fields: split(item),
                    status: status,
                    status_description: status_description
                }
            }
        }

        return rows;
    }

    function clearRows() {
        localStorage.setItem(APP_ID + "_rows_count", 0);
        localStorage.setItem(APP_ID + "_course_column_index", 0);
        localStorage.setItem(APP_ID + "_user_column_index", 1);
    }

    function split(line) {
        var fields = [];
        var quoted = false;
        var start = 0;

        for (var i = 0; i < line.length; i++) {
            var char = line[i];

            if (char == '"') {
                quoted = !quoted;
            } else if (!quoted && char == ",") {
                var field = line.substring(start, i);
                if (field[0] == '"' && field[field.length - 1] == '"') {
                    field = field.substring(1, field.length - 1);
                    field = field.replace(new RegExp('""', 'g'), '"')
                }
                start = i + 1;
                fields[fields.length] = field;
            }
        }
        if (start != line.length) {
            field = line.substring(start, line.length);
            if (field[0] == '"' && field[field.length - 1] == '"') {
                field = field.substring(1, field.length - 1);
                field = field.replace(new RegExp('""', 'g'), '"')
            }
            start = i + 1;
            fields[fields.length] = field;
        }
        return fields;
    }

    function join(fields) {
        var prepared = [];

        fields.forEach(function (item) {
            var field = item.replace(new RegExp('"', 'g'), '""');
            prepared.push('"' + field + '"');
        });

        return prepared;
    }

    window.onbeforeunload = function () {
        saveState();
    };

    apps.applications[APP_ID].init = init;
    reset_app();
})();