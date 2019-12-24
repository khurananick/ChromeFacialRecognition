$ = jQuery;
window.renderFaceDiv = function() {
  var arr = Object.values(PEOPLE);
  arr = arr.sort((a, b) => (a.timestamp > b.timestamp) ? -1 : 1);

  var overlay = $("#overlay");
  overlay.html("");

  for(var index in PEOPLE) {
    var person = PEOPLE[index];
    var faceDiv = document.createElement("div")
    var linkToImdb = document.createElement("a")
    var nameOfFace = document.createTextNode(person.name)

    faceDiv.style.border = "1px solid blue"
    faceDiv.style.padding = "15pt"
    linkToImdb.href = person.imdb_url
    linkToImdb.target = '_blank'

    // add content to faceDiv
    faceDiv.appendChild(linkToImdb)
    linkToImdb.appendChild(nameOfFace)

    // add faceDiv to overlay
    overlay.append(faceDiv)
  }
}
