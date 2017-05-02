import "../../imports/js/domReady!";
import {stepik} from "../../imports/js/stepik-api";
import {$} from "../../imports/jquery/js/jquery";

let local_storage_prefix = 'enrollment';
let localStorage = window.localStorage;
let rows = [];
let course_id_column = 0;
let user_id_column = 1;

function reset_ext() {
    clear_table();
    rows = readRows();
    if (!rows || rows.length === 0) {
        rows = [];
        let header = [];
        header[0] = "course_id";
        header[1] = "user_id";
        rows[0] = {
            fields: header,
            status: ""
        };
    }
    course_id_column = localStorage.getItem(local_storage_prefix + "_course_column_index");
    if (course_id_column === null) {
        course_id_column = 0;
    }

    user_id_column = localStorage.getItem(local_storage_prefix + "_user_column_index");
    if (user_id_column === null) {
        user_id_column = 1;
    }
    init_column_selector();
}

function init_column_selector() {
    if (rows.length > 0) {
        let header = rows[0].fields;
        let userIdColumn = $("#user-id-column");
        let courseIdColumn = $("#course-id-column");
        userIdColumn.empty();
        courseIdColumn.empty();

        for (let column in header) {
            if (!header.hasOwnProperty(column)) {
                continue;
            }
            let option = "<option value='" + column + "'>" + header[column] + "</option>";
            userIdColumn.append(option);
            courseIdColumn.append(option);
        }
        courseIdColumn.children("option[value='" + course_id_column + "']").attr("selected", "selected");
        userIdColumn.children("option[value='" + user_id_column + "']").attr("selected", "selected");
    }
}

function clear_table() {
    $(".table").empty();
}

function repaintTable() {
    clear_table();

    let table = $(".table");
    let counter = 0;
    let done_counter = 0;
    for (let row_index in rows) {
        let row = rows[row_index];
        if (row.status === "added") {
            done_counter++;
        }
        let columns = row.fields;
        let index = counter !== 0 ? counter : "#";
        let title = counter !== 0 ? row.status_description : "";
        counter++;
        let table_row = `<tr title='${title}'><td class='${row.status}'>${index}</td>`;
        for (let column in columns) {
            table_row += "<td>" + columns[column] + "</td>";
        }
        table_row += "</tr>";
        table.append(table_row);
    }

    $(".info").text(done_counter + " of " + (rows.length - 1) + " is completed.");
}

reset_ext();

$("#as-single-id").click(() => {
    let user_id = prompt("User id", "0");
    if (user_id === null) {
        return
    }
    let course_id = prompt("Course id", "0");
    if (course_id === null) {
        return
    }
    let row = {
        fields: []
    };
    row.fields[user_id_column] = user_id;
    row.fields[course_id_column] = course_id;
    rows[rows.length] = row;

    repaintTable();
});

$("#clear").click(() => {
    clearRows();
    reset_ext();
    repaintTable();
    $("#ids_file").val(null);
});

$("#ids_file").change(event => {
    let file;
    let reader = new FileReader();

    file = event.target.files[0];
    reader.readAsText(file);
    reset_ext();
    reader.onload = e => {
        let str = e.target.result;
        let lines = str.split("\n");
        if (lines.length > 0) {
            rows = [];
            if (!isNaN(+lines[0][0])) {
                let header = [];
                let line = split(lines[0]);
                for (let i = 0; i < line.length; i++) {
                    header[i] = i + 1;
                }
                rows.push({
                    fields: header
                });
            }
            lines.forEach(line => {
                if (line.length === 0) {
                    return;
                }
                let columns = split(line);

                let fields = [];
                columns.forEach(column => fields.push(column));

                rows.push({
                    fields: fields
                });
            });
        }

        init_column_selector();
        repaintTable();
    };
});

$("#user-id-column").change(() => {
    user_id_column = $("#user-id-column").val();
});

$("#course-id-column").change(() => {
    course_id_column = $("#course-id-column").val();
});

$("#enroll").click(() => {
    let members = {};
    for (let i = 1; i < rows.length; i++) {
        let course_id = rows[i].fields[course_id_column];
        let users = members[course_id] || (members[course_id] = []);
        users.push({
            user_id: rows[i].fields[user_id_column],
            row: rows[i]
        });
    }

    for (let course_id in members) {
        addLearners(course_id, members[course_id]);
    }
});

init_column_selector();
repaintTable();

function addLearners(course_id, users) {
    course_id = +course_id;

    if (isNaN(course_id) || users === null) {
        if (users !== null) {
            for (let user of users) {
                user.row.status = "fail";
                user.row.status_description = "Not a correct data";
            }
        }
        repaintTable();
        return;
    }

    stepik.getCourse(course_id)
        .done(data => {
                let learners_group = data['courses'][0]['learners_group'];
                if (!learners_group) {
                    for (let user of users) {
                        user.row.status = "fail";
                        user.row.status_description = "Course: You do not have permission to perform this action.";
                    }
                    repaintTable();
                    return;
                }

                let skip = [];

                stepik.getMembers(learners_group)
                    .done(members => {
                        for (let member of members) {
                            let user_id = member['user'];
                            skip[user_id] = {
                                status: "added",
                                status_description: "Already"
                            }
                        }
                    })
                    .always(() => {
                        for (let user of users) {
                            let user_status = skip[user.user_id];
                            if (!!user_status) {
                                user.row.status = user_status.status;
                                user.row.status_description = user_status.status_description;
                                repaintTable();
                                continue;
                            }

                            skip[user.user_id] = user.row;

                            stepik.addMembers(learners_group, user.user_id)
                                .done((user => {
                                    return () => {
                                        user.row.status = "added";
                                        user.row.status_description = "Done";
                                        repaintTable();
                                    }
                                })(user))
                                .fail((user => {
                                    return data => {
                                        user.row.status = "fail";
                                        let json = data.responseJSON;
                                        user.row.status_description = json.detail || json.__all__ || json.user;
                                        repaintTable();
                                    }
                                })(user));
                        }
                    });
            }
        )
        .fail(data => {
            users.forEach(user => {
                user.row.status = "fail";
                user.row.status_description = "Course: " + data['responseJSON']['detail'];
            });
            repaintTable();
        });
}

function saveState() {
    localStorage.setItem(local_storage_prefix + "_rows_count", rows.length);
    rows.forEach((item, i) => {
        localStorage.setItem(local_storage_prefix + "_rows_fields_" + i, join(item.fields));
        localStorage.setItem(local_storage_prefix + "_rows_status_" + i, item.status);
        localStorage.setItem(local_storage_prefix + "_rows_status_description_" + i, item.status_description);
    });

    localStorage.setItem(local_storage_prefix + "_course_column_index", course_id_column);
    localStorage.setItem(local_storage_prefix + "_user_column_index", user_id_column);
}

function readRows() {
    let count = localStorage.getItem(local_storage_prefix + "_rows_count");

    if (isNaN(+count)) {
        return [];
    }
    let rows = [];
    for (let i = 0; i < count; i++) {
        let item = localStorage.getItem(local_storage_prefix + "_rows_fields_" + i);
        let status = localStorage.getItem(local_storage_prefix + "_rows_status_" + i);
        let status_description = localStorage.getItem(local_storage_prefix + "_rows_status_description_" + i);

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
    localStorage.setItem(local_storage_prefix + "_rows_count", 0);
    localStorage.setItem(local_storage_prefix + "_course_column_index", 0);
    localStorage.setItem(local_storage_prefix + "_user_column_index", 1);
}

function split(line) {
    let fields = [];
    let quoted = false;
    let start = 0;

    for (let i = 0; i < line.length; i++) {
        let char = line[i];

        if (char === '"') {
            quoted = !quoted;
        } else if (!quoted && char === ",") {
            let field = line.substring(start, i);
            if (field[0] === '"' && field[field.length - 1] === '"') {
                field = field.substring(1, field.length - 1);
                field = field.replace(new RegExp('""', 'g'), '"')
            }
            start = i + 1;
            fields[fields.length] = field;
        }
    }
    if (start !== line.length) {
        let field = line.substring(start, line.length);
        if (field[0] === '"' && field[field.length - 1] === '"') {
            field = field.substring(1, field.length - 1);
            field = field.replace(new RegExp('""', 'g'), '"')
        }
        fields.push(field);
    }
    return fields;
}

function join(fields) {
    let prepared = [];

    fields.forEach(item => {
        let field = item.replace(new RegExp('"', 'g'), '""');
        prepared.push('"' + field + '"');
    });

    return prepared;
}

window.onbeforeunload = () => {
    saveState();
};
