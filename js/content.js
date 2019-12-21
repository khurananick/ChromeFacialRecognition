$ = jQuery;
MODEL_URL = 'https://benerdy.net/models';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method == "clickAction") {
    // load all the libs needed
    faceapi.loadSsdMobilenetv1Model(MODEL_URL).then(function() {
      faceapi.loadFaceLandmarkModel(MODEL_URL).then(function() {
        faceapi.loadFaceRecognitionModel(MODEL_URL).then(function() {
          // get references to required items on screen.
          var $video = $("video");
          $video.css("position", "absolute");
          var video = $video[0];
          var vh;
          // create a canvas element to overlay on video
          var canvas = document.createElement("canvas");
          canvas.style.position = "absolute";
          canvas.style.border = "2px solid #000";
          canvas.style.opacity = "0.6";
          canvas.style.margin = "0 auto";
          canvas.width = $video.width();
          canvas.height = $video.height();
          $video.parent().append(canvas);
          var context = canvas.getContext("2d");
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
              if(rejected_count > 5) rendering = false;
              else return;
            }
            console.log("rendering");
            rejected_count = 0;
            rendering = true;
            canvas.width = $video.width();
            canvas.height = $video.height();
            canvas2.width = $video.width();
            canvas2.height = $video.height();
            context2.drawImage(video, 0, 0, canvas2.width, canvas2.height);
            faceapi.detectAllFaces(canvas2).withFaceLandmarks().withFaceDescriptors().then(function(fullFaceDescriptions) {
              faceapi.draw.drawDetections(canvas, fullFaceDescriptions);
            });
          });
        });
      });
    });
  }
  sendResponse({message: "done"});
});
