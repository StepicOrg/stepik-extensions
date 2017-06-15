define(["jquery", "stepik-api", "pdfmake", "domReady!", "bootstrap-select", "bootstrap", "vfs_fonts"], function (_jquery, _stepikApi, _pdfmake) {
    "use strict";

    var _jquery2 = _interopRequireDefault(_jquery);

    var _stepikApi2 = _interopRequireDefault(_stepikApi);

    var _pdfmake2 = _interopRequireDefault(_pdfmake);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var courses_list = (0, _jquery2.default)("#course");
    courses_list.empty();
    (0, _jquery2.default)('.selectpicker').selectpicker('refresh');

    _stepikApi2.default.getCourses({ "enrolled": true }).done(function (courses) {
        courses.forEach(function (course) {
            var id = course['id'];
            courses_list.append("<option value='" + id + "'>" + course['title'] + "</option>");
        });

        courses_list.selectpicker('refresh');
    });

    (0, _jquery2.default)("#to-pdf").click(function () {
        var course = courses_list.val();

        if (course === null) {
            return;
        }

        _stepikApi2.default.getCourse(course).done(function (data) {
            var course = (data['courses'] || [])[0];
            if (course === undefined) {
                return;
            }

            var docDefinition = {
                info: {
                    title: course['slug'],
                    creator: 'Stepik Extensions'
                },
                content: [{ text: course['title'], style: ['header', 'course_header'] }],

                footer: {
                    columns: [{ text: 'ext.stepik.org', alignment: 'left', style: 'footer' }, { text: course['title'], alignment: 'right', style: 'footer' }]
                },

                styles: {
                    header: {
                        bold: true,
                        color: 'navy',
                        alignment: 'center',
                        margin: [0, 10]
                    },
                    course_header: {
                        fontSize: 22
                    },
                    section_header: {
                        alignment: 'center',
                        fontSize: 16
                    },
                    lesson_header: {
                        alignment: 'center',
                        fontSize: 14
                    },
                    footer: {
                        margin: [30, 0],
                        color: 'gray'
                    }
                }
            };
            docDefinition.content = docDefinition.content.concat(html_to_text(course['description'])).concat([{ text: '', pageBreak: 'after' }]);

            _stepikApi2.default.getSections(course['sections']).done(function (sections) {
                var units_ids = [];

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = sections[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var section = _step.value;

                        units_ids = units_ids.concat(section['units']);
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

                _stepikApi2.default.getUnits(units_ids).done(function (units) {
                    var units_map = {};
                    var lessons_map = {};

                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = units[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var unit = _step2.value;

                            units_map[unit['id']] = unit;
                            var lesson_id = unit['lesson'];
                            lessons_map[lesson_id] = {};
                            lessons_map[lesson_id].unit = unit;
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

                    _stepikApi2.default.getLessons({ course: course['id'] }).done(function (lessons) {
                        var steps_ids = [];

                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = lessons[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var lesson = _step3.value;

                                var lesson_id = lesson['id'];
                                var unit_lesson = lessons_map[lesson_id] || {};
                                unit_lesson.lesson = lesson;
                                lessons_map[lesson_id] = unit_lesson;
                                steps_ids = steps_ids.concat(lesson['steps']);
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

                        sections.sort(function (a, b) {
                            return a['position'] - b['position'];
                        });
                        _stepikApi2.default.getSteps(steps_ids).done(function (steps) {
                            var steps_map = {};
                            var _iteratorNormalCompletion4 = true;
                            var _didIteratorError4 = false;
                            var _iteratorError4 = undefined;

                            try {
                                for (var _iterator4 = steps[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                    var step = _step4.value;

                                    steps_map[step['id']] = step;
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

                            var _iteratorNormalCompletion5 = true;
                            var _didIteratorError5 = false;
                            var _iteratorError5 = undefined;

                            try {
                                for (var _iterator5 = sections[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    var section = _step5.value;

                                    docDefinition.content = docDefinition.content.concat([{
                                        text: section['title'],
                                        style: ['header', 'section_header']
                                    }]);

                                    var _lessons = section['units'].map(function (unit_id) {
                                        return lessons_map[units_map[unit_id]['lesson']].lesson;
                                    }).sort(function (a, b) {
                                        return lessons_map[a['id']].unit['position'] - lessons_map[b['id']].unit['position'];
                                    });

                                    var _iteratorNormalCompletion6 = true;
                                    var _didIteratorError6 = false;
                                    var _iteratorError6 = undefined;

                                    try {
                                        for (var _iterator6 = _lessons[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                            var lesson = _step6.value;

                                            docDefinition.content = docDefinition.content.concat([{
                                                text: lesson['title'],
                                                style: ['header', 'lesson_header']
                                            }]);

                                            var _steps = lesson['steps'].map(function (step_id) {
                                                return steps_map[step_id];
                                            }).sort(function (a, b) {
                                                return a['position'] - b['position'];
                                            });

                                            var _iteratorNormalCompletion7 = true;
                                            var _didIteratorError7 = false;
                                            var _iteratorError7 = undefined;

                                            try {
                                                for (var _iterator7 = _steps[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                                    var _step8 = _step7.value;

                                                    var block = _step8['block'];
                                                    if (!block) {
                                                        continue;
                                                    }
                                                    var text = block['text'];
                                                    if (!text) {
                                                        continue;
                                                    }
                                                    docDefinition.content = docDefinition.content.concat([{ text: "Step #" + _step8['position'], color: 'gray' }]).concat(html_to_text(text));
                                                }
                                            } catch (err) {
                                                _didIteratorError7 = true;
                                                _iteratorError7 = err;
                                            } finally {
                                                try {
                                                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                                        _iterator7.return();
                                                    }
                                                } finally {
                                                    if (_didIteratorError7) {
                                                        throw _iteratorError7;
                                                    }
                                                }
                                            }
                                        }
                                    } catch (err) {
                                        _didIteratorError6 = true;
                                        _iteratorError6 = err;
                                    } finally {
                                        try {
                                            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                                _iterator6.return();
                                            }
                                        } finally {
                                            if (_didIteratorError6) {
                                                throw _iteratorError6;
                                            }
                                        }
                                    }
                                }
                            } catch (err) {
                                _didIteratorError5 = true;
                                _iteratorError5 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                        _iterator5.return();
                                    }
                                } finally {
                                    if (_didIteratorError5) {
                                        throw _iteratorError5;
                                    }
                                }
                            }

                            var doc = _pdfmake2.default.createPdf(docDefinition);

                            doc.download(course['slug'] + ".pdf");
                        });
                    });
                });
            });
        });
    });

    function clean(text) {
        text = text.replace(/<(p|div|b|i|span|ol|ul)>\s+/gi, '<$1> ');
        text = text.replace(/\s+<\/(p|div|b|i|span|ol|ul)>/gi, ' </$1>');
        text = text.replace(/\n+/gi, ' ');

        return text;
    }

    function html_to_text(text) {
        var html = _jquery2.default.parseHTML(clean(text));

        var result = [];
        var part = {};

        _jquery2.default.each(html, function (i, el) {
            var text = el.innerText || el.textContent;
            if (!text.trim()) {
                return;
            }

            var nodeName = el.nodeName;

            if (nodeName === 'OL') {
                part = { ol: _jquery2.default.map(el.children, function (child) {
                        return child.innerText;
                    }), margin: [0, 10] };
            } else if (nodeName === 'UL') {
                part = { ul: _jquery2.default.map(el.children, function (child) {
                        return child.innerText;
                    }), margin: [0, 10] };
            } else if (['P', 'DIV'].indexOf(nodeName) !== -1) {
                part = { text: [text], margin: [0, 10] };
            } else if (['SPAN', '#text', 'B', 'I'].indexOf(nodeName) !== -1) {
                if (part.text) {
                    part.text.push(text);
                    return;
                } else {
                    part = { text: [text] };
                }
            } else {
                part = { text: [text] };
            }
            result.push(part);
        });

        return result;
    }

    (0, _jquery2.default)("#to-html").click(function () {
        var course = courses_list.val();

        if (course === null) {
            return;
        }

        _stepikApi2.default.getCourse(course).done(function (data) {
            var course = (data['courses'] || [])[0];
            if (course === undefined) {
                return;
            }

            var content = "<h1>" + course['title'] + "</h1>" + course['description'];

            _stepikApi2.default.getSections(course['sections']).done(function (sections) {
                var units_ids = [];

                var _iteratorNormalCompletion8 = true;
                var _didIteratorError8 = false;
                var _iteratorError8 = undefined;

                try {
                    for (var _iterator8 = sections[Symbol.iterator](), _step9; !(_iteratorNormalCompletion8 = (_step9 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                        var section = _step9.value;

                        units_ids = units_ids.concat(section['units']);
                    }
                } catch (err) {
                    _didIteratorError8 = true;
                    _iteratorError8 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                            _iterator8.return();
                        }
                    } finally {
                        if (_didIteratorError8) {
                            throw _iteratorError8;
                        }
                    }
                }

                _stepikApi2.default.getUnits(units_ids).done(function (units) {
                    var units_map = {};
                    var lessons_map = {};

                    var _iteratorNormalCompletion9 = true;
                    var _didIteratorError9 = false;
                    var _iteratorError9 = undefined;

                    try {
                        for (var _iterator9 = units[Symbol.iterator](), _step10; !(_iteratorNormalCompletion9 = (_step10 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                            var unit = _step10.value;

                            units_map[unit['id']] = unit;
                            var lesson_id = unit['lesson'];
                            lessons_map[lesson_id] = {};
                            lessons_map[lesson_id].unit = unit;
                        }
                    } catch (err) {
                        _didIteratorError9 = true;
                        _iteratorError9 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                _iterator9.return();
                            }
                        } finally {
                            if (_didIteratorError9) {
                                throw _iteratorError9;
                            }
                        }
                    }

                    _stepikApi2.default.getLessons({ course: course['id'] }).done(function (lessons) {
                        var steps_ids = [];

                        var _iteratorNormalCompletion10 = true;
                        var _didIteratorError10 = false;
                        var _iteratorError10 = undefined;

                        try {
                            for (var _iterator10 = lessons[Symbol.iterator](), _step11; !(_iteratorNormalCompletion10 = (_step11 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                                var lesson = _step11.value;

                                var lesson_id = lesson['id'];
                                var unit_lesson = lessons_map[lesson_id] || {};
                                unit_lesson.lesson = lesson;
                                lessons_map[lesson_id] = unit_lesson;
                                steps_ids = steps_ids.concat(lesson['steps']);
                            }
                        } catch (err) {
                            _didIteratorError10 = true;
                            _iteratorError10 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion10 && _iterator10.return) {
                                    _iterator10.return();
                                }
                            } finally {
                                if (_didIteratorError10) {
                                    throw _iteratorError10;
                                }
                            }
                        }

                        sections.sort(function (a, b) {
                            return a['position'] - b['position'];
                        });
                        _stepikApi2.default.getSteps(steps_ids).done(function (steps) {
                            var steps_map = {};
                            var _iteratorNormalCompletion11 = true;
                            var _didIteratorError11 = false;
                            var _iteratorError11 = undefined;

                            try {
                                for (var _iterator11 = steps[Symbol.iterator](), _step12; !(_iteratorNormalCompletion11 = (_step12 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                                    var step = _step12.value;

                                    steps_map[step['id']] = step;
                                }
                            } catch (err) {
                                _didIteratorError11 = true;
                                _iteratorError11 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion11 && _iterator11.return) {
                                        _iterator11.return();
                                    }
                                } finally {
                                    if (_didIteratorError11) {
                                        throw _iteratorError11;
                                    }
                                }
                            }

                            var _iteratorNormalCompletion12 = true;
                            var _didIteratorError12 = false;
                            var _iteratorError12 = undefined;

                            try {
                                for (var _iterator12 = sections[Symbol.iterator](), _step13; !(_iteratorNormalCompletion12 = (_step13 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                                    var section = _step13.value;

                                    content = content + "<h2>" + section['title'] + "</h2>";

                                    var _lessons2 = section['units'].map(function (unit_id) {
                                        return lessons_map[units_map[unit_id]['lesson']].lesson;
                                    }).sort(function (a, b) {
                                        return lessons_map[a['id']].unit['position'] - lessons_map[b['id']].unit['position'];
                                    });

                                    var _iteratorNormalCompletion13 = true;
                                    var _didIteratorError13 = false;
                                    var _iteratorError13 = undefined;

                                    try {
                                        for (var _iterator13 = _lessons2[Symbol.iterator](), _step14; !(_iteratorNormalCompletion13 = (_step14 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                                            var lesson = _step14.value;

                                            content = content + "<h3>" + lesson['title'] + "</h3>";

                                            var _steps2 = lesson['steps'].map(function (step_id) {
                                                return steps_map[step_id];
                                            }).sort(function (a, b) {
                                                return a['position'] - b['position'];
                                            });

                                            var _iteratorNormalCompletion14 = true;
                                            var _didIteratorError14 = false;
                                            var _iteratorError14 = undefined;

                                            try {
                                                for (var _iterator14 = _steps2[Symbol.iterator](), _step15; !(_iteratorNormalCompletion14 = (_step15 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                                                    var _step16 = _step15.value;

                                                    var block = _step16['block'];
                                                    if (!block) {
                                                        continue;
                                                    }
                                                    var text = block['text'];
                                                    if (!text) {
                                                        continue;
                                                    }
                                                    content = content + "<h4>Step #" + _step16['position'] + "</h4><div>" + text + "</div>";
                                                }
                                            } catch (err) {
                                                _didIteratorError14 = true;
                                                _iteratorError14 = err;
                                            } finally {
                                                try {
                                                    if (!_iteratorNormalCompletion14 && _iterator14.return) {
                                                        _iterator14.return();
                                                    }
                                                } finally {
                                                    if (_didIteratorError14) {
                                                        throw _iteratorError14;
                                                    }
                                                }
                                            }
                                        }
                                    } catch (err) {
                                        _didIteratorError13 = true;
                                        _iteratorError13 = err;
                                    } finally {
                                        try {
                                            if (!_iteratorNormalCompletion13 && _iterator13.return) {
                                                _iterator13.return();
                                            }
                                        } finally {
                                            if (_didIteratorError13) {
                                                throw _iteratorError13;
                                            }
                                        }
                                    }
                                }
                            } catch (err) {
                                _didIteratorError12 = true;
                                _iteratorError12 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion12 && _iterator12.return) {
                                        _iterator12.return();
                                    }
                                } finally {
                                    if (_didIteratorError12) {
                                        throw _iteratorError12;
                                    }
                                }
                            }

                            var docDefinition = "<!DOCTYPE html><html><head><title>" + course['title'] + "</title><body>" + content + "</body></html>";

                            var link = document.createElement('a');
                            link.download = course['slug'] + ".html";
                            var blob = new Blob([docDefinition], { type: 'text/html' });
                            link.href = window.URL.createObjectURL(blob);
                            link.click();
                        });
                    });
                });
            });
        });
    });
});