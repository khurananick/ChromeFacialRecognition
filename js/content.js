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
  overlay.onmouseover = () => fadeInOverlay()
  overlay.onmouseout = () => fadeOutOverlay()
  overlay.style.transition = '0.5s'
  overlay.style.margin = "0 auto";
  overlay.style.width = $video.width().toString() + 'pt';
  overlay.style.height = $video.height().toString() + 'pt';
  // overlay.style.width = video.width
  // overlay.style.height = video.height

  $video.parent().append(overlay);
  // create a canvas element to convert current video frame into an still
  var canvas2 = document.createElement("canvas");
  var context2 = canvas2.getContext("2d");
  // reusable vars to track during the video update callbacks.
  var rejected_count = 0;
  var rendering = false;
  video.addEventListener("timeupdate", function(e) {
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

function getBase64Image(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL();
}

function startRecognitionInImages() {
  $("img").each(function(index, elem) {
    if(elem.width > 250) {
      console.log(elem);
      let $elem = $(elem);
      elem.setAttribute('crossOrigin', 'anonymous');
      elem.dataset.facrec_ref_id = ("facerec." + (new Date().getTime()));
      // create div element to overlay video
      let imgOverlay = document.createElement("div");
      $imgOverlay = $(imgOverlay);
      imgOverlay.id = ("facerec." + (new Date().getTime()));
      imgOverlay.style.position = "absolute";
      imgOverlay.style.opacity = "0.9";
      imgOverlay.onmouseover = () => fadeInOverlay()
      imgOverlay.onmouseout = () => fadeOutOverlay()
      imgOverlay.style.transition = '0.5s'
      imgOverlay.style.margin = "0 auto";
      imgOverlay.style.width = $elem.width().toString() + 'pt';
      imgOverlay.style.height = $elem.height().toString() + 'pt';
      chrome.runtime.sendMessage(
        {
          method:"runRecognitionOnCanvas",
          base64:getBase64Image(elem),
          overlay_id:imgOverlay.id,
          elem_ref: elem.dataset.facrec_ref_id
        },
        function(response) {
          // do nothing.
        });
    }
  });
}

$(function() {
  startRecognitionInVideo();
  startRecognitionInImages();
  cleanInterval = setInterval(function() {
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
    if(!request.overlay_id) {
      people[request.data.key] = request.data;
      renderFaceDiv(people, $overlay, video)
    } else {
      var elem = $("[data-facrec_ref_id='"+request.elem_ref+"']")[0];
      var $overlay = $("div#"+request.elem_id);
      people[request.data.key] = request.data;
      renderFaceDiv(people, $overlay, video)
    }
  }
  sendResponse({message: "done"});
});
