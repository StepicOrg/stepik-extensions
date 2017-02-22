/**
 * Created by meanmail on 22.02.17.
 */

document.getElementById("from-cvs").onclick = function () {
    alert("From CVS");
};

document.getElementById("from-txt").onclick = function () {
    alert("From TXT");
};


document.getElementById("as-single-id").onclick = function () {
    var id = prompt("Input id", 0);
    alert("Added id = " + id);
};

addEventListener("click", function () {
    console.log("Щёлк!");
});