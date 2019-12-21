$ = jQuery;
MODEL_URL = 'https://benerdy.net/models';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method == "clickAction") {
    var $video = $("video");
    $video.css("position", "absolute");

    var video = $video[0];
    var vw;
    var vh;

    var canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.border = "2px solid #000";
    canvas.style.opacity = "0.6";
    canvas.style.margin = "0 auto";
    canvas.width = $video.width();
    canvas.height = $video.height();
    $video.parent().append(canvas);
    var context = canvas.getContext("2d");

    var canvas2 = document.createElement("canvas");
    var context2 = canvas2.getContext("2d");

    video.addEventListener("loadedmetadata", function() {
      vw = this.videoWidth || this.width;
      vh = this.videoHeight || this.height;
    }, false);

    var rejected_count = 0;
    var rendering = false;
    var font = "16px sans-serif"
    video.addEventListener("timeupdate", function(e) {
      if(rendering) {
        rejected_count += 1;
        console.log("rejected render");
        if(rejected_count > 9) rendering = false;
        else return;
      }
      console.log("rendering");
      rejected_count = 0;
      rendering = true;

      faceapi.loadSsdMobilenetv1Model(MODEL_URL).then(function() {
        faceapi.loadFaceLandmarkModel(MODEL_URL).then(function() {
          faceapi.loadFaceRecognitionModel(MODEL_URL).then(function() {
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
      // render person
      /*
      try {
        cocoSsd.load().then(model => {
          model.detect(canvas2).then(predictions => {
            predictions.forEach(prediction => {
              if(prediction.class !== "person") return;
              const x = prediction.bbox[0];
              const y = prediction.bbox[1];
              const width = prediction.bbox[2];
              const height = prediction.bbox[3];
              // Bounding box
              context.strokeStyle = "#00FFFF";
              context.lineWidth = 2;
              context.strokeRect(x, y, width, height);
              // Label background
              context.fillStyle = "#00FFFF";
              const textWidth = context.measureText(prediction.class).width;
              const textHeight = parseInt(font, 10); // base 10
              context.fillRect(x, y, textWidth + 4, textHeight + 4);
            });
            predictions.forEach(prediction => {
              if(prediction.class !== "person") return;
              const x = prediction.bbox[0];
              const y = prediction.bbox[1];
              context.fillStyle = "#000000";
              context.fillText(prediction.class, x, y);
            });
            console.log("done rendering");
          });
        });
      } catch(e) { console.log("failed rendering"); }
      */
    });
  }
  sendResponse({message: "done"});
});
