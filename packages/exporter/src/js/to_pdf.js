import "domReady!";
import $ from "jquery";
import stepik from "stepik-api";
import pdfMake from "pdfmake";

let courses_list = $("#course");

$("#to-pdf").click(() => {
    let course = courses_list.val();

    if (course === null) {
        return;
    }

    stepik.getCourse(course)
        .done(data => {
            let course = (data['courses'] || [])[0];
            if (course === undefined) {
                return;
            }

            let docDefinition = {
                info: {
                    title: course['slug'],
                    creator: 'Stepik Extensions'
                },
                content: [
                    {text: course['title'], style: ['header', 'course_header']}
                ],

                footer: {
                    columns: [
                        {text: 'ext.stepik.org', alignment: 'left', style: 'footer'},
                        {text: course['title'], alignment: 'right', style: 'footer'}
                    ]
                },

                styles: {
                    header: {
                        bold: true,
                        color: 'navy',
                        alignment: 'center',
                        margin: [0, 10]
                    },
                    course_header: {
                        fontSize: 22,
                    },
                    section_header: {
                        alignment: 'center',
                        fontSize: 16,
                    },
                    lesson_header: {
                        alignment: 'center',
                        fontSize: 14,
                    },
                    footer: {
                        margin: [30, 0],
                        color: 'gray'
                    }
                }
            };
            docDefinition.content = docDefinition.content
                .concat(html_to_text(course['description']))
                .concat([{text: '', pageBreak: 'after'}]);

            stepik.getSections(course['sections'])
                .done(sections => {
                    let units_ids = [];

                    for (let section of sections) {
                        units_ids = units_ids.concat(section['units']);
                    }
                    stepik.getUnits(units_ids)
                        .done(units => {
                            let units_map = {};
                            let lessons_map = {};

                            for (let unit of units) {
                                units_map[unit['id']] = unit;
                                let lesson_id = unit['lesson'];
                                lessons_map[lesson_id] = {};
                                lessons_map[lesson_id].unit = unit;
                            }
                            stepik.getLessons({course: course['id']})
                                .done(lessons => {
                                    let steps_ids = [];

                                    for (let lesson of lessons) {
                                        let lesson_id = lesson['id'];
                                        let unit_lesson = lessons_map[lesson_id] || {};
                                        unit_lesson.lesson = lesson;
                                        lessons_map[lesson_id] = unit_lesson;
                                        steps_ids = steps_ids.concat(lesson['steps'])
                                    }

                                    sections.sort((a, b) => a['position'] - b['position']);
                                    stepik.getSteps(steps_ids)
                                        .done(steps => {
                                            let steps_map = {};
                                            for (let step of steps) {
                                                steps_map[step['id']] = step;
                                            }

                                            for (let section of sections) {
                                                docDefinition.content = docDefinition.content
                                                    .concat([{
                                                        text: section['title'],
                                                        style: ['header', 'section_header']
                                                    }]);

                                                let lessons = section['units']
                                                    .map(unit_id => lessons_map[units_map[unit_id]['lesson']].lesson)
                                                    .sort((a, b) => lessons_map[a['id']].unit['position'] - lessons_map[b['id']].unit['position']);

                                                for (let lesson of lessons) {
                                                    docDefinition.content = docDefinition.content
                                                        .concat([{
                                                            text: lesson['title'],
                                                            style: ['header', 'lesson_header']
                                                        }]);

                                                    let steps = lesson['steps']
                                                        .map(step_id => steps_map[step_id])
                                                        .sort((a, b) => a['position'] - b['position']);

                                                    for (let step of steps) {
                                                        let block = step['block'];
                                                        if (!block) {
                                                            continue;
                                                        }
                                                        let text = block['text'];
                                                        if (!text) {
                                                            continue;
                                                        }
                                                        docDefinition.content = docDefinition.content
                                                            .concat([{text: "Step #" + step['position'], color: 'gray'}])
                                                            .concat(html_to_text(text));
                                                    }
                                                }
                                            }

                                            let doc = pdfMake.createPdf(docDefinition);

                                            doc.download(`${course['slug']}.pdf`);
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

export function html_to_text(text) {
    let html = $.parseHTML(clean(text));

    let result = [];
    let part = {};

    $.each(html, (i, el) => {
        let text = el.innerText || el.textContent;
        if (!text.trim()) {
            return;
        }

        let nodeName = el.nodeName;

        if (nodeName === 'OL') {
            part = {ol: $.map(el.children, child => child.innerText), margin: [0, 10]}
        } else if (nodeName === 'UL') {
            part = {ul: $.map(el.children, child => child.innerText), margin: [0, 10]}
        } else if (['P', 'DIV'].indexOf(nodeName) !== -1) {
            part = {text: [text], margin: [0, 10]}
        } else if (['SPAN', '#text', 'B', 'I'].indexOf(nodeName) !== -1) {
            if (part.text) {
                part.text.push(text);
                return;
            } else {
                part = {text: [text]}
            }
        } else {
            part = {text: [text]}
        }
        result.push(part);
    });

    return result;
}
