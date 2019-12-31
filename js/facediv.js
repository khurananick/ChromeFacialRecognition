let mousemoveTimeout, lastMousemovement, mouseEntered, $box, $tar;

function renderFaceDiv(people, $parentOverlay, parentElement) {
  $parentOverlay.html("");

  for(var index in people) {
    var person = people[index];
    var box = "";
    box += "<div class='fc-facecard' style='background-color:#000; opacity:0.8; margin:5px; padding:10px; width:250px; overflow:hidden;'>";
    box +=  "<div>";
    box +=    "<img src='"+person.profile_img+"' width='50' style='margin-right:5px;' />";
    box +=    "<span style='font-size:12pt;'><a target='_blank' href='"+person.website_url+"'>"+person.name+"</a></span>";
    box +=  "</div>";
    box +=  "<div style='margin-top:2px;'>";
    box +=    "<span style='font-size:8pt;'><a target='_blank' href='https://www.google.com/search?q="+encodeURI(person.name)+"'>Search on Google</a></span>";
    box +=  "</div>";
    box += "</div>";
    $box = $(box);
    $parentOverlay.append($box);
    if(((new Date().getTime() - lastMousemovement) > 2500) && !mouseEntered) $box.hide();
  }
}

$(function listenForOverlayInteractions() {
  $("body").on("mouseenter", ".fc-overlay", function(e) {
    lastMousemovement = new Date().getTime();
    mouseEntered = true;
    clearTimeout(mousemoveTimeout);
    $tar = $(e.target);
    $tar.find(".fc-facecard").show();
  });
  $("body").on("mouseleave", ".fc-overlay", function(e) {
    mouseEntered = false;
    clearTimeout(mousemoveTimeout);
    $tar = $(e.target);
    $tar.find(".fc-facecard").hide();
  });
  $("body").on("mousemove", ".fc-overlay", function(e) {
    lastMousemovement = new Date().getTime();
    $tar = $(e.target);
    $tar.find(".fc-facecard").show();
    clearTimeout(mousemoveTimeout);
    mousemoveTimeout = setTimeout(function() {
      $tar.find(".fc-facecard").hide();
    }, 5000);
  });
  $("body").on("click", ".fc-facecard a", function(e) {
    if(video) {
      if(video.paused) e.stopPropagation();
      if(video.paused) event.stopPropagation();
      setTimeout(function() { if(!video.paused) video.pause(); }, 250);
    }
  });
})
