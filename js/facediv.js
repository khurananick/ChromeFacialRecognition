$ = jQuery;
let timeout, parentOverlay, parentElement;

document.onmousemove = function(){
  clearTimeout(timeout)

  timeout = setTimeout(function(){
    fadeOutOverlay()
  }, 5000)
}

function fadeInOverlay(parentOverlayArg) {
  parentOverlay = parentOverlayArg
  if(parentOverlay) parentOverlay.style.opacity = '0.9'
}

function fadeOutOverlay(parentOverlayArg) {
  parentOverlay = parentOverlayArg
  if(parentOverlay) parentOverlay.style.opacity = '0.0'
}

function showAdditionalInfo(element) {
  var elementId = element.target.id

  // if((elementId == null || elementId == '') && (element.toElement.nodeName == "IMG" || element.toElement.nodeName == "SPAN")) {
  if(elementId == null || elementId == '') {
    elementId = element.fromElement.id
  }

  var hoverDiv = document.getElementById(elementId)
  // hoverDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
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
  // hoverDiv.style.backgroundColor = "rgba(0, 0, 0, 0.2)"
  // hoverDiv.style.border = "1px solid rgba(0, 0, 0, 0.2)"
  hoverDiv.style.cursor = "auto"
  hoverDiv = null
}

function clickOpenNewTab(event, person) {
  if(parentElement) {
    if(parentElement.tagName == "VIDEO") {
      if(parentElement.paused) {
        event.stopPropagation()
      }
    }
  }

  window.open(person.website_url, '_blank')
}

function renderFaceDiv(people, parentOverlayArg, parentElementArg) {
  parentOverlay = parentOverlayArg;
  parentOverlay.html("");
  parentElement = parentElementArg;

  for(var index in people) {
    var person = people[index];
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

    faceDiv.onclick = (element) => {
      clickOpenNewTab(element, person)
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
    parentOverlay.append(faceDiv)
  }
}
