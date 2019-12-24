$ = jQuery;
function fadeInOverlay(data) {
  console.log('fadeInOverlay')
  console.log(data)

  var overlay = document.getElementById("overlay")
  console.log(overlay)

  overlay.style.opacity = '0.9'
}

function fadeOutOverlay(data) {
  console.log('fadeOutOverlay')
  console.log(data)

  var overlay = document.getElementById("overlay")
  console.log(overlay)

  overlay.style.opacity = '0.0'
}

function testClick(data) {
  console.log('testClick')
  console.log(data)

  var overlay = document.getElementById("overlay")
  console.log(overlay)

  overlay.style.opacity = '0.9'
}

function renderFaceDiv(PEOPLE) {
  var overlay = $("#overlay");
  console.log(overlay.width)
  console.log(overlay.width()/2)
  overlay.html("");

  for(var index in PEOPLE) {
    var person = PEOPLE[index];
    var faceDiv = document.createElement("div")
    var linkToImdb = document.createElement("a")
    var faceImage = document.createElement("img")
    var faceName = document.createTextNode(person.name)

    faceDiv.style.border = "1px solid blue"
    faceDiv.style.padding = "15pt"
    faceDiv.style.width = (overlay.width()/5).toString() + 'pt';
    faceImage.style.width = "40px";
    faceImage.style.margin = "0 10px 0 0";

    // faceImage
    faceImage.src = person.profile_img;

    linkToImdb.href = person.imdb_url
    linkToImdb.target = '_blank'
    linkToImdb.appendChild(faceImage)
    linkToImdb.appendChild(faceName)

    // add content to faceDiv
    faceDiv.appendChild(linkToImdb)

    // add faceDiv to overlay
    overlay.append(faceDiv)
  }
}
