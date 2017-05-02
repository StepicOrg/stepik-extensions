define(["../../imports/js/stepik-api", "../../imports/jquery/js/jquery", "../../imports/js/domReady!"], function (_stepikApi, _jquery) {
    "use strict";

    var local_storage_prefix = 'enrollment';
    var localStorage = window.localStorage;
    var rows = [];
    var course_id_column = 0;
    var user_id_column = 1;

    function reset_ext() {
        clear_table();
        rows = readRows();
        if (!rows || rows.length === 0) {
            rows = [];
            var header = [];
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
            var header = rows[0].fields;
            var userIdColumn = (0, _jquery.$)("#user-id-column");
            var courseIdColumn = (0, _jquery.$)("#course-id-column");
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
        (0, _jquery.$)(".table").empty();
    }

    function repaintTable() {
        clear_table();

        var table = (0, _jquery.$)(".table");
        var counter = 0;
        var done_counter = 0;
        for (var row_index in rows) {
            var row = rows[row_index];
            if (row.status === "added") {
                done_counter++;
            }
            var columns = row.fields;
            var index = counter !== 0 ? counter : "#";
            var title = counter !== 0 ? row.status_description : "";
            counter++;
            var table_row = "<tr title='" + title + "'><td class='" + row.status + "'>" + index + "</td>";
            for (var column in columns) {
                table_row += "<td>" + columns[column] + "</td>";
            }
            table_row += "</tr>";
            table.append(table_row);
        }

        (0, _jquery.$)(".info").text(done_counter + " of " + (rows.length - 1) + " is completed.");
    }

    reset_ext();

    (0, _jquery.$)("#as-single-id").click(function () {
        var user_id = prompt("User id", "0");
        if (user_id === null) {
            return;
        }
        var course_id = prompt("Course id", "0");
        if (course_id === null) {
            return;
        }
        var row = {
            fields: []
        };
        row.fields[user_id_column] = user_id;
        row.fields[course_id_column] = course_id;
        rows[rows.length] = row;

        repaintTable();
    });

    (0, _jquery.$)("#clear").click(function () {
        clearRows();
        reset_ext();
        repaintTable();
        (0, _jquery.$)("#ids_file").val(null);
    });

    (0, _jquery.$)("#ids_file").change(function (event) {
        var file = void 0;
        var reader = new FileReader();

        file = event.target.files[0];
        reader.readAsText(file);
        reset_ext();
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
                    rows.push({
                        fields: header
                    });
                }
                lines.forEach(function (line) {
                    if (line.length === 0) {
                        return;
                    }
                    var columns = split(line);

                    var fields = [];
                    columns.forEach(function (column) {
                        return fields.push(column);
                    });

                    rows.push({
                        fields: fields
                    });
                });
            }

            init_column_selector();
            repaintTable();
        };
    });

    (0, _jquery.$)("#user-id-column").change(function () {
        user_id_column = (0, _jquery.$)("#user-id-column").val();
    });

    (0, _jquery.$)("#course-id-column").change(function () {
        course_id_column = (0, _jquery.$)("#course-id-column").val();
    });

    (0, _jquery.$)("#enroll").click(function () {
        var members = {};
        for (var i = 1; i < rows.length; i++) {
            var course_id = rows[i].fields[course_id_column];
            var users = members[course_id] || (members[course_id] = []);
            users.push({
                user_id: rows[i].fields[user_id_column],
                row: rows[i]
            });
        }

        for (var _course_id in members) {
            addLearners(_course_id, members[_course_id]);
        }
    });

    init_column_selector();
    repaintTable();

    function addLearners(course_id, users) {
        course_id = +course_id;

        if (isNaN(course_id) || users === null) {
            if (users !== null) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = users[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var user = _step.value;

                        user.row.status = "fail";
                        user.row.status_description = "Not a correct data";
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
            repaintTable();
            return;
        }

        _stepikApi.stepik.getCourse(course_id).done(function (data) {
            var learners_group = data['courses'][0]['learners_group'];
            if (!learners_group) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = users[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _user = _step2.value;

                        _user.row.status = "fail";
                        _user.row.status_description = "Course: You do not have permission to perform this action.";
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                repaintTable();
                return;
            }

            var skip = [];

            _stepikApi.stepik.getMembers(learners_group).done(function (members) {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = members[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var member = _step3.value;

                        var user_id = member['user'];
                        skip[user_id] = {
                            status: "added",
                            status_description: "Already"
                        };
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            }).always(function () {
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = users[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var _user2 = _step4.value;

                        var user_status = skip[_user2.user_id];
                        if (!!user_status) {
                            _user2.row.status = user_status.status;
                            _user2.row.status_description = user_status.status_description;
                            repaintTable();
                            continue;
                        }

                        skip[_user2.user_id] = _user2.row;

                        _stepikApi.stepik.addMembers(learners_group, _user2.user_id).done(function (user) {
                            return function () {
                                user.row.status = "added";
                                user.row.status_description = "Done";
                                repaintTable();
                            };
                        }(_user2)).fail(function (user) {
                            return function (data) {
                                user.row.status = "fail";
                                var json = data.responseJSON;
                                user.row.status_description = json.detail || json.__all__ || json.user;
                                repaintTable();
                            };
                        }(_user2));
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }
            });
        }).fail(function (data) {
            users.forEach(function (user) {
                user.row.status = "fail";
                user.row.status_description = "Course: " + data['responseJSON']['detail'];
            });
            repaintTable();
        });
    }

    function saveState() {
        localStorage.setItem(local_storage_prefix + "_rows_count", rows.length);
        rows.forEach(function (item, i) {
            localStorage.setItem(local_storage_prefix + "_rows_fields_" + i, join(item.fields));
            localStorage.setItem(local_storage_prefix + "_rows_status_" + i, item.status);
            localStorage.setItem(local_storage_prefix + "_rows_status_description_" + i, item.status_description);
        });

        localStorage.setItem(local_storage_prefix + "_course_column_index", course_id_column);
        localStorage.setItem(local_storage_prefix + "_user_column_index", user_id_column);
    }

    function readRows() {
        var count = localStorage.getItem(local_storage_prefix + "_rows_count");

        if (isNaN(+count)) {
            return [];
        }
        var rows = [];
        for (var i = 0; i < count; i++) {
            var item = localStorage.getItem(local_storage_prefix + "_rows_fields_" + i);
            var status = localStorage.getItem(local_storage_prefix + "_rows_status_" + i);
            var status_description = localStorage.getItem(local_storage_prefix + "_rows_status_description_" + i);

            if (!!item) {
                rows[i] = {
                    fields: split(item),
                    status: status,
                    status_description: status_description
                };
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
        var fields = [];
        var quoted = false;
        var start = 0;

        for (var i = 0; i < line.length; i++) {
            var char = line[i];

            if (char === '"') {
                quoted = !quoted;
            } else if (!quoted && char === ",") {
                var field = line.substring(start, i);
                if (field[0] === '"' && field[field.length - 1] === '"') {
                    field = field.substring(1, field.length - 1);
                    field = field.replace(new RegExp('""', 'g'), '"');
                }
                start = i + 1;
                fields[fields.length] = field;
            }
        }
        if (start !== line.length) {
            var _field = line.substring(start, line.length);
            if (_field[0] === '"' && _field[_field.length - 1] === '"') {
                _field = _field.substring(1, _field.length - 1);
                _field = _field.replace(new RegExp('""', 'g'), '"');
            }
            fields.push(_field);
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
});