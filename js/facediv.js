$ = jQuery;
function fadeInOverlay(data) {
  var overlay = document.getElementById("overlay")
  overlay.style.opacity = '0.9'
}

function fadeOutOverlay(data) {
  var overlay = document.getElementById("overlay")
  overlay.style.opacity = '0.0'
}

function showAdditionalInfo(element) {
  var elementId = element.target.id

  // if((elementId == null || elementId == '') && (element.toElement.nodeName == "IMG" || element.toElement.nodeName == "SPAN")) {
  if(elementId == null || elementId == '') {
    elementId = element.fromElement.id
  }

  var hoverDiv = document.getElementById(elementId)
  hoverDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
  //hoverDiv.style.border = "1px solid blue"
  hoverDiv.style.cursor = "pointer"
  hoverDiv = null
}

function hideAdditionalInfo(element) {
  var elementId = element.target.id

  if(elementId == null || elementId == '') {
    elementId = element.fromElement.id
  }

  var hoverDiv = document.getElementById(elementId)
  hoverDiv.style.backgroundColor = "rgba(0, 0, 0, 0.2)"
  hoverDiv.style.border = "1px solid rgba(0, 0, 0, 0.2)"
  hoverDiv.style.cursor = "auto"
  hoverDiv = null
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
    //faceDiv.style.border = "1px solid rgba(0, 0, 0, 0.2)"
    //faceDiv.style.borderRadius = "1pt"
    faceDiv.style.padding = "5pt 5pt 1pt"
    faceDiv.style.margin = "5pt"
    faceDiv.style.fontSize = "13pt"
    faceDiv.style.backgroundColor = "rgba(0, 0, 0, 0.2)"

    faceDiv.style.width = '150pt';
    // faceDiv.style.width = (overlay.width()/5).toString() + 'pt';
    // faceDiv.style.width = (overlay.style.width/2).toString() + 'pt';

    faceDiv.onmouseover = (element) => {
      showAdditionalInfo(element)
    }

    faceDiv.onmouseout = (element) => {
      hideAdditionalInfo(element)
    }

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
    // faceDiv.appendChild(linkToImdb)

    // add faceDiv to overlay
    overlay.append(faceDiv)
  }
}
