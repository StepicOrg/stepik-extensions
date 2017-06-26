import "domReady!";
import $ from "jquery";
import stepik from "stepik-api";
import pdfMake from "pdfmake";

let courses_list = $("#course");

$("#to-epub").click(() => {
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

            let content = `<h1>${course['title']}</h1>${course['description']}`;

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
                                                content = `${content}<h2>${section['title']}</h2>`;

                                                let lessons = section['units']
                                                    .map(unit_id => lessons_map[units_map[unit_id]['lesson']].lesson)
                                                    .sort((a, b) => lessons_map[a['id']].unit['position'] - lessons_map[b['id']].unit['position']);

                                                for (let lesson of lessons) {
                                                    content = `${content}<h3>${lesson['title']}</h3>`;

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
                                                        content = `${content}<h4>Step #${step['position']}</h4><div>${text}</div>`;
                                                    }
                                                }
                                            }

                                            let link = document.createElement('a');
                                            link.download = `${course['slug']}.html`;
                                            let blob = new Blob([content], {type: 'text/markdown'});
                                            link.href = window.URL.createObjectURL(blob);
                                            link.click();
                                        });
                                });
                        });
                });
        });
});
