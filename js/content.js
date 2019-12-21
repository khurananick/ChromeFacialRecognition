$ = jQuery;
MODEL_URL = 'https://benerdy.net/models';
IMAGE_URL = 'https://benerdy.net/images';

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

            // rendering boxes around all faces.
            var fullFaceDescriptions = null;
            faceapi.detectAllFaces(canvas2).withFaceLandmarks().withFaceDescriptors().then(function(result) {
              fullFaceDescriptions = result;
              //faceapi.draw.drawDetections(canvas, fullFaceDescriptions);
              //faceapi.draw.drawFaceLandmarks(canvas, fullFaceDescriptions);
            });

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

            var index = 0;
            var labels = ['sheldon1','leonard1'];
            var labeledFaceDescriptors = [];
            function iterateLabels(index) {
              var label = labels[index];
              if(!label) {
                runFaceMatchStuff(labeledFaceDescriptors);
                return;
              }
              var imgUrl = `${IMAGE_URL}/${label}.png`
              faceapi.fetchImage(imgUrl).then(function(img) {
                faceapi.computeFaceDescriptor(img).then(function(descriptors) {
                  if(descriptors) {
                    labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors(label, [descriptors]));
                    iterateLabels((index += 1));
                  } else {
                    console.log("no faces detected for ", label);
                    iterateLabels((index += 1));
                  }
                });
              });
            }
            iterateLabels(index);
          });
        });
      });
    });
  }
  sendResponse({message: "done"});
});
