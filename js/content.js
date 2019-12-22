$ = jQuery;
MODEL_URL = 'https://benerdy.net/models';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method == "clickAction") {
    function start(labels) {
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

        // rendering boxes around all faces.
        // this action below just renders the squares around all faces in the image.
        var fullFaceDescriptions = null;
        faceapi.detectAllFaces(canvas2).withFaceLandmarks().withFaceDescriptors().then(function(result) {
          fullFaceDescriptions = result;
          faceapi.draw.drawDetections(canvas, fullFaceDescriptions);
          //faceapi.draw.drawFaceLandmarks(canvas, fullFaceDescriptions);
        });

        var index = 0;
        var labeledFaceDescriptors = [];
        // this function pulls down each png of celebrity faces from server (can move this to local too).
        // each face is converted into an array of descriptors to match agains faces in the photo in the next function.
        function iterateLabels(index) {
          var label = labels[index];
          if(!label) {
            console.log(labeledFaceDescriptors);
            runFaceMatchStuff(labeledFaceDescriptors);
            return;
          }
          var imgs = [];
          label.images.map(function(data) {
            var img = document.createElement("img");
            img.src = data;
            imgs.push(img);
          });
          faceapi.computeFaceDescriptor(imgs).then(function(descriptors) {
            if(descriptors) {
              labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors(label.name, descriptors));
              iterateLabels((index += 1));
            } else {
              console.log("no faces detected for ", label);
              iterateLabels((index += 1));
            }
          });
        }

        // once all the celebrity faces are convered to descriptor arrays,
        // this function matches those descriptors to faces in the canvas tht was pulled from the video
        // then renders the name of the celebrity on the canvas to be displayed over the vide0
        function runFaceMatchStuff(labeledFaceDescriptors) {
          if(!fullFaceDescriptions) return;
          var maxDescriptorDistance = 0.6;
          var faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance);
          var results = fullFaceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor));
          results.forEach((bestMatch, i) => {
            var box = fullFaceDescriptions[i].detection.box
            var text = bestMatch.toString()
            var drawBox = new faceapi.draw.DrawBox(box, { label: text })
            drawBox.draw(canvas)
          });
        }

        iterateLabels(index);
      });
    }

    function loadRemoteImagesData() {
      $.ajax({
        url: "https://benerdy.net/data"
      }).done(function(resp) {
        start(Object.values(resp));
      });
    }

    faceapi.loadSsdMobilenetv1Model(MODEL_URL).then(function() {
      faceapi.loadFaceLandmarkModel(MODEL_URL).then(function() {
        faceapi.loadFaceRecognitionModel(MODEL_URL).then(function() {
          loadRemoteImagesData();
        });
      });
    });
  }
  sendResponse({message: "done"});
});
