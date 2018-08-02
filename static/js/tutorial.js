import { tree } from "./tree.js"

let current_slide = 0;
let last_slide = 6;

export function startTutorial() {
    $("button.tutorial").fadeOut(200, function() {
        $("div.logo").fadeOut(400, firstSlide);
    });
}

function firstSlide() {
    $("div.slideshow").fadeIn(1);
    $("#slide-1").fadeIn(400);
    $("div.slide_btn").fadeIn(400);
    document.getElementById("next_slide").addEventListener("click", nextSlide);
    document.getElementById("prev_slide").addEventListener("click", prevSlide);
    current_slide = 1;
}

function nextSlide() {
    current_slide++;
    if  (current_slide == last_slide) {
        $("#slide-" + (current_slide - 1)).fadeOut(200, endTutorial);
    }
    else if (current_slide == 5) {
        $("#slide-" + (current_slide - 1)).fadeOut(200, function() {
            $("#slide-" + current_slide).fadeIn(400, loadTutorialData);
        });
    }
    else {
        $("#slide-" + (current_slide - 1)).fadeOut(200, function() {
            $("#slide-" + current_slide).fadeIn(400);
        });
    }
}

function prevSlide() {
    if (current_slide == 1){
        endTutorial();
    }
    else {
        current_slide--;
        $("#slide-" + (current_slide + 1)).fadeOut(200, function() {
            $("#slide-" + current_slide).fadeIn(400);
        });
    }
}

const loadTutorialData = () => {
    d3.json("/static/data/example_graph.json", function(error, data) {
      if (error) throw error;
      tree(data, "tutorial");
    });
  }


function endTutorial() {
    $("div.slide_btn").fadeOut(200);
    $("div.slideshow").fadeOut(200, function() {
        $("div.logo").fadeIn(400, function() {
            $("button.tutorial").fadeIn(400);
        });
    });
}