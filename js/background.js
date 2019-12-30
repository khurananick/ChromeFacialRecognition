chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var data = { method: 'clickAction' };
    chrome.tabs.sendMessage(tabs[0].id, data, function(response) {
      if(response.message=='settings')
        chrome.tabs.create({ url: "html/settings.html" });
    });
  });
});

let BASE_URL = 'https://benerdy.net';
let MODEL_URL = 'https://benerdy.net/models';
let PEOPLE_DATA_URL = 'https://benerdy.net/data';
let ALL_LABELED_FACE_DESCRIPTORS;

// Helper functions.
function createLabel(obj) {
  return btoa(obj.name + "----" + obj.website_url + "----" + obj.person_id + "----" + obj.donations_url);
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
  var peopleData = null;
  function downloadStoreAndRunNewData() {
    $.ajax({
      url: PEOPLE_DATA_URL
    }).done(function(resp) {
      var data = Object.values(resp.people);
      chrome.storage.local.set({peopleData: data, peopleDataVersion: resp.version}, function() {
        labelFaceDescriptions(data);
      });
    });
  }
  chrome.storage.local.get(['peopleData','peopleDataVersion'], function(result) {
    if(!result.peopleData)
      return downloadStoreAndRunNewData();
    // check if on latest version.
    $.ajax({
      url: BASE_URL + "/data/version"
    }).done(function(resp) {
      if(resp.version == result.peopleDataVersion)
        return labelFaceDescriptions(result.peopleData);
      else
        return downloadStoreAndRunNewData();
    });
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
    }
  }

  iterateLabels(index);
}


// Step 4: Start listening for incoming canvas data.
var lock = false;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.method == "runRecognitionOnCanvas") {
    if(lock) return;
    lock = true;
    var img = document.createElement("img");
    img.src = request.base64;
    faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors().then(function(fullFaceDescriptions) {
      var attempts = 0;
      function runFaceMatchStuff(labeledFaceDescriptors) {
        if(!fullFaceDescriptions) {
          attempts += 1;
          if(attempts == 3) {
            lock = false;
            return;
          }
          setTimeout(function() { runFaceMatchStuff(labeledFaceDescriptors); }, 1000);
          return;
        }
        var maxDescriptorDistance = 0.53;
        var faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance);
        var results = fullFaceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor));
        results.forEach((bestMatch, i) => {
          var box = fullFaceDescriptions[i].detection.box;
          var text = bestMatch.toString();
          if(!text.match("unknown")) {
            text = text.split(" ");
            var distance = parseFloat(text[1].replace('(','').replace(')',''));
            var labelBase64 = text[0];
            var info = atob(labelBase64).split("----");
            var data = {
              method: "person",
              data: {
                key: labelBase64,
                name: info[0],
                imdb_url: info[1],
                website_url: info[1],
                person_id: info[2],
                donations_url: info[3],
                timestamp: (new Date().getTime()),
                profile_img: (BASE_URL + "/person/"+info[2]+"/img")
              }
            }
            chrome.tabs.sendMessage(sender.tab.id, data, function() {});
          }
        });
        lock = false;
      }
      if(ALL_LABELED_FACE_DESCRIPTORS) runFaceMatchStuff(ALL_LABELED_FACE_DESCRIPTORS);
    });
  }
});

loadRemoteModels();

chrome.alarms.create("reloadModels", {periodInMinutes: (5)})
chrome.alarms.onAlarm.addListener(function(alarm) {
  if(alarm.name == "reloadModels") {
    ALL_LABELED_FACE_DESCRIPTORS = null;
    loadRemoteModels();
  }
});
