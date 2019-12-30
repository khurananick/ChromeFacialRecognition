// Global helper variables.
$ = jQuery;
let people = {};
let cleanInterval;
let $overlay, overlay, $video, video;

// load a div for each unique face detected
function startRecognitionInVideo() {
  // get references to required items on screen.
  $video = $("video");
  $video.css("position", "absolute");
  video = $video[0];
  if(!video) {
    return setTimeout(function() { startRecognitionInVideo(); }, 5000);
  }

  // create div element to overlay video
  overlay = document.createElement("div");
  $overlay = $(overlay);
  overlay.id = "overlay";
  overlay.style.position = "absolute";
  overlay.style.opacity = "0.9";
  overlay.onmouseover = () => fadeInOverlay(overlay)
  overlay.onmouseout = () => fadeOutOverlay(overlay)
  overlay.style.transition = '0.5s'
  overlay.style.margin = "0 auto";
  overlay.style.width = $video.width().toString() + 'pt';
  overlay.style.height = $video.height().toString() + 'pt';

  $video.parent().append(overlay);
  // create a canvas element to convert current video frame into an still
  var canvas2 = document.createElement("canvas");
  var context2 = canvas2.getContext("2d");
  // reusable vars to track during the video update callbacks.
  var rejected_count = 0;
  var rendering = false;
  $video.on("timeupdate", function(e) {
    video = e.target;
    overlay.style.width = $video.width().toString() + 'pt';
    overlay.style.height = $video.height().toString() + 'pt';
    if(rendering) {
      rejected_count += 1;
      console.log("rejected render");
      if(rejected_count > 4) rendering = false;
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

$(function() {
  startRecognitionInVideo();
  cleanInterval = setInterval(function() {
    if(!video || video.paused) return;
    var ct = new Date().getTime();
    for(var key in people) {
      if((ct - people[key].timestamp) > 8000) {
        delete(people[key]);
        renderFaceDiv(people, $overlay, video);
      }
    }
  }, 2000);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method == "clickAction") {
    // do nothing.
  }
  else if (request.method == "person") {
    people[request.data.key] = request.data;
    renderFaceDiv(people, $overlay, video)
  }
  sendResponse({message: "done"});
});
