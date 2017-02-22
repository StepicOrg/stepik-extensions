/**
 * Created by meanmail on 22.02.17.
 */
'use strict';

$(document).ready(function () {
    $.ajax({
        url: 'apps/apps.json',
        dataType: "json",
        success: function (data, textStatus) {
            window.apps = data;
            initCategories();
            drawApplications();
        }
    });
});

function initCategories() {
    apps.categories.forEach(function (item, i, arr) {
        $("#categories").append("<li><div id='category_" + item.id + "' category_id='" + item.id + "'>" + item.name + "</div></li>");
        $("#category_" + item.id).click(function (event) {
            var id = event.currentTarget.getAttribute("category_id")
            drawApplications(id)
        });
    });
}

function drawApplications(category) {
    var content = $("#content");
    content.empty();
    console.log("drawApplications(" + category + ")")
    category = parseInt(category);
    apps.applications
        .filter(function (item) {
            return isNaN(category) || item.categories.indexOf(category) != -1;
        })
        .forEach(function (item, i, arr) {
            var id = item.id;
            var clazz = "app_" + id;
            var logo_url = "apps/" + id + "/" + item.logo_url;
            var description = item.description;

            content.append(
                '<div class="item-wrapper ' + clazz + '">' +
                '<img src="' + logo_url + '" title="' + description + '"  alt="App logo">' +
                '<span class="item-name" title="' + description + '">' + item.name + '</span>' +
                '</div>');

            $("." + clazz).click(openApplication);

        });
}

function openApplication(event) {
    alert(event);
}