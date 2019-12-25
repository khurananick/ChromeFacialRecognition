$ = jQuery;
function fadeInOverlay(data) {
  var overlay = document.getElementById("overlay")
  overlay.style.opacity = '0.9'
}

function fadeOutOverlay(data) {
  var overlay = document.getElementById("overlay")
  overlay.style.opacity = '0.0'
}

showAdditionalInfo = (element) => {
  var rightPaneTitle = document.getElementById("rightPaneTitle")

  element.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
  element.style.border = "1px solid blue"
}

hideAdditionalInfo = (element) => {
  var rightPaneTitle = document.getElementById("rightPaneTitle")

  element.style.backgroundColor = "rgba(0, 0, 0, 0.2)"
  element.style.border = "1px solid rgba(0, 0, 0, 0.2)"
}

function renderFaceDiv(PEOPLE) {
  var overlay = $("#overlay");
  overlay.html("");

  for(var index in PEOPLE) {
    var person = PEOPLE[index];
    var faceDiv = document.createElement("div")
    var faceImage = document.createElement("img")
    var faceName = document.createElement("span")
    faceName.textContent = person.name

    faceDiv.id = index
    faceDiv.style.border = "1px solid rgba(0, 0, 0, 0.2)"
    faceDiv.style.padding = "5pt 5pt 1pt"
    faceDiv.style.borderRadius = "1pt"
    faceDiv.style.margin = "5pt"
    faceDiv.style.fontSize = "13pt"
    faceDiv.style.backgroundColor = "rgba(0, 0, 0, 0.2)"

    faceDiv.style.width = '150pt';
    // faceDiv.style.width = (overlay.width()/5).toString() + 'pt';
    // faceDiv.style.width = (overlay.style.width/2).toString() + 'pt';

    faceDiv.onmouseover = () => showAdditionalInfo(faceDiv)
    faceDiv.onmouseout = () => hideAdditionalInfo(faceDiv)

    // faceImage
    faceImage.src = person.profile_img;
    faceImage.style.width = "55px";
    faceImage.style.margin = "0 10px 0 0";

    // add image and name to div
    faceDiv.appendChild(faceImage)
    faceDiv.appendChild(faceName)

    // create imdb link
    var linkToImdb = document.createElement("a")
    var imdbUrlText = document.createTextNode(person.imdb_url)
    // linkToImdb.href = person.imdb_url
    // linkToImdb.target = '_blank'
    // linkToImdb.textContent = person.imdb_url
    // linkToImdb.appentChild(imdbUrlText)

    // add content to faceDiv
    faceDiv.appendChild(linkToImdb)

    // add faceDiv to overlay
    var overlayElement = document.getElementById("overlay");
    overlayElement.appendChild(faceDiv)
  }
}
