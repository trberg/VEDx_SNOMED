
import { export_init } from "./export.js";
import { tree } from "./tree.js";
import { startTutorial, loadExample } from "./tutorial.js";
import { loadSlider } from "./sliders.js";
import { circleFilter } from "./circles.js";

// set the global variable values
let configs = {},
    treeData;


// file upload functions
const uploadbutton = () => {

  // add event listener to example file button
  document.getElementById("example_file").addEventListener('click', loadExample);

  // add event listener to visible upload file button
  document.getElementById('buttonid').addEventListener('click', openDialog);

  // add event listener to visible submit button
  document.getElementById('submitButton').addEventListener('click', submitFile);

  // add event listener to filter slider
  document.getElementById('min_slider').addEventListener('mouseup', circleFilter);
  document.getElementById('max_slider').addEventListener('mouseup', circleFilter);

  // listener for when file is uploaded before submission
  var fileupload = $("#fileid");

  fileupload.on("change", function() {
    var reader = new FileReader(),
        file = document.getElementById("fileid").files[0];
        document.getElementById("filename").innerHTML = file.name;
  });

  // on click of visible upload file button, click hidden upload input element
  function openDialog() {
    document.getElementById('fileid').click();

  }

  function displaySVG(callback) {
    d3.select("svg#icd9tree")
      .style("display", true)
      .style("height", "100%")
      .style("width", "100%");
    callback();
  }

  // on click of visible submit button, click hidden submit input element
  function submitFile() {
    var file = document.getElementById("fileid").files[0];

    $.ajax({
      type : 'POST',
      url : '/csv_data',
      data: file,
      datatype: 'json',
      processData: false,  // tell jQuery not to process the data
      contentType: false,   // tell jQuery not to set contentType
      complete: function(data) {
        $("div.slideshow").fadeOut(300);
        $("div.slide_btn").fadeOut(300, function() {
          $("button.tutorial").fadeOut(300, function() {
            $("div.logo").fadeOut(400, function() {
              displaySVG( function() {
                tree(data.responseJSON, "main");
              });
            });
          });
        });
      }
    });
  }
}

// animation for logo appearance on load
function logo() {
  $(document).ready(function() {
    $("div.logo").fadeIn(400, function() {
      $("button.tutorial").fadeIn(400);
    });
  });
}

function loadTutorial() {
  document.getElementById('tutorial_btn').addEventListener('click', startTutorial);
}


const init = async () => {

  // initiate export file function
  export_init()

  // initiate upload file features
  uploadbutton();

  // initiate sliders
  loadSlider();

  // tutorial activation
  loadTutorial();

  // format front page
  logo();
}

$(init);