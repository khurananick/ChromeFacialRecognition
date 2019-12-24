// Global helper variables.
$ = jQuery;
let PEOPLE = {};

// load a div for each unique face detected
function startRecognitionInVideo() {
  // get references to required items on screen.
  var $video = $("video");
  $video.css("position", "absolute");
  var video = $video[0];
  // create div element to overlay video
  var overlay = document.createElement("div");
  overlay.id = "overlay";
  overlay.style.position = "absolute";
  overlay.style.opacity = "0.8";
  overlay.style.margin = "0 auto";
  overlay.width = $video.width();
  overlay.height = $video.height();
  $video.parent().append(overlay);
  // create a canvas element to convert current video frame into an still
  var canvas2 = document.createElement("canvas");
  var context2 = canvas2.getContext("2d");
  // reusable vars to track during the video update callbacks.
  var rejected_count = 0;
  var rendering = false;
  video.addEventListener("timeupdate", function(e) {
    if(rendering) {
      rejected_count += 1;
      console.log("rejected render");
      if(rejected_count > 10) rendering = false;
      else return;
    }
    console.log("rendering");
    rejected_count = 0;
    rendering = true;
    canvas2.width = $video.width();
    canvas2.height = $video.height();
    context2.drawImage(video, 0, 0, canvas2.width, canvas2.height);

    chrome.runtime.sendMessage({method:"runRecognitionOnCanvas",base64:canvas2.toDataURL()}, function(response) {
      // do nothing.
    });
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method == "clickAction") {
    startRecognitionInVideo();
  }
  else if (request.method == "person") {
    PEOPLE[request.data.key] = request.data;
    renderFaceDiv(PEOPLE)
  }
  sendResponse({message: "done"});
});
