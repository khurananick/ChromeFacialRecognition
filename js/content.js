// Global helper variables.
$ = jQuery;
let MODEL_URL = 'https://benerdy.net/models';
let PEOPLE_DATA_URL = 'https://benerdy.net/data';
let ALL_LABELED_FACE_DESCRIPTORS = null;
let PEOPLE = {};

// Helper functions.
function createLabel(obj) {
  return btoa(obj.name + "----" + obj.imdb_url);
}

// Main functions to start the recognition process.
// Step 1: Load pre-trained remote models from server.
function loadRemoteModels() {
  faceapi.loadSsdMobilenetv1Model(MODEL_URL).then(function() {
    faceapi.loadFaceLandmarkModel(MODEL_URL).then(function() {
      faceapi.loadFaceRecognitionModel(MODEL_URL).then(function() {
        loadRemoteImagesData();
      });
    });
  });
}

// Step 2: Load labeled base images data for people from remote.
function loadRemoteImagesData() {
  $.ajax({
    url: PEOPLE_DATA_URL
  }).done(function(resp) {
    //startRecognitionInVideo(Object.values(resp));
    labelFaceDescriptions(Object.values(resp));
  });
}

// Step 3: Convert labeled images into data array
function labelFaceDescriptions(people) {
  var index = 0;
  var labeledFaceDescriptors = [];
  // this function pulls down each png of celebrity faces from server (can move this to local too).
  // each face is converted into an array of descriptors to match agains faces in the photo in the next function.
  function iterateLabels(index) {
    var person = people[index];
    if(!person) {
      ALL_LABELED_FACE_DESCRIPTORS = labeledFaceDescriptors;
      startRecognitionInVideo();
      return;
    }
    if(person.descriptors) {
      var descriptors = JSON.parse(person.descriptors);
      for(var d_index in descriptors) {
        descriptors[d_index] = Object.values(descriptors[d_index]);
        descriptors[d_index] = new Float32Array(descriptors[d_index]);
      }
      labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors(createLabel(person), descriptors));
      iterateLabels((index += 1));
    } else {
      var imgs = [];
      person.images.map(function(data) {
        var img = document.createElement("img");
        img.src = data;
        imgs.push(img);
      });
      faceapi.computeFaceDescriptor(imgs).then(function(descriptors) {
        if(descriptors) {
          $.ajax({
            method: "post",
            url: ("https://benerdy.net/person/"+person.person_id+"/descriptors"),
            data: { descriptors: JSON.stringify(descriptors) }
          }).done(function(resp) {
            labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors(createLabel(person), descriptors));
            iterateLabels((index += 1));
          });
        } else {
          console.log("no faces detected for ", person);
          iterateLabels((index += 1));
        }
      });
    }
  }

  iterateLabels(index);
}

// Step 4: Start listening to time update in video and matching faces.
function startRecognitionInVideo() {
  // get references to required items on screen.
  var $video = $("video");
  $video.css("position", "absolute");
  var video = $video[0];
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
      //faceapi.draw.drawDetections(canvas, fullFaceDescriptions);
      //faceapi.draw.drawFaceLandmarks(canvas, fullFaceDescriptions);
    });

    // once all the celebrity faces are convered to descriptor arrays,
    // this function matches those descriptors to faces in the canvas tht was pulled from the video
    // then renders the name of the celebrity on the canvas to be displayed over the vide0
    var attempts = 0;
    function runFaceMatchStuff(labeledFaceDescriptors) {
      if(!fullFaceDescriptions) {
        attempts += 1;
        if(attempts == 3) return;
        setTimeout(function() { runFaceMatchStuff(labeledFaceDescriptors); }, 1000); return;
      }
      var maxDescriptorDistance = 0.6;
      var faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance);
      var results = fullFaceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor));
      results.forEach((bestMatch, i) => {
        var box = fullFaceDescriptions[i].detection.box;
        var text = bestMatch.toString();
        if(!text.match("unknown")) {
          var labelBase64 = text.split(" ")[0];
          var info = atob(labelBase64).split("----");
          PEOPLE[labelBase64] = { name: info[0], imdb_url: info[1], timestamp: (new Date().getTime()) };
          // uncomment below lines to draw boxes around faces.
          var drawBox = new faceapi.draw.DrawBox(box, { label: info[0]});
          drawBox.draw(canvas)
        }
      });
      // console.log(PEOPLE);
      /* Sample Output
      {
        "SGFzc2FuIE1pbmhhai0tLS1odHRwczovL3d3dy5pbWRiLmNvbS9uYW1lL25tMzY1Mzc3OC8=": {
          "name":"Hassan Minhaj","imdb_url":"https://www.imdb.com/name/nm3653778/","timestamp":1577123624692
        },
        "QW5kcmV3IFlhbmctLS0taHR0cHM6Ly93d3cuaW1kYi5jb20vbmFtZS9ubTgyMzMyNjMv": {
          "name":"Andrew Yang","imdb_url":"https://www.imdb.com/name/nm8233263/","timestamp":1577123626194
        }
      }
      */
    }
    if(ALL_LABELED_FACE_DESCRIPTORS) runFaceMatchStuff(ALL_LABELED_FACE_DESCRIPTORS);
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method == "clickAction") {
    loadRemoteModels();
  }
  sendResponse({message: "done"});
});
