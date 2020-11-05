
import { export_init } from "./export.js";
import { tree, update } from "./tree.js";
import { startTutorial, loadExample } from "./tutorial.js";
import { loadSlider } from "./sliders.js";
import { circleFilter } from "./circles.js";

// set the global variable values
let configs = {},
    treeData;


// file upload functions
const uploadbutton = () => {

  // add event listener to example file button
  document.getElementById("example_file").addEventListener('click', loadExample, {passive: true});

  // add event listener to visible upload file button
  document.getElementById('buttonid').addEventListener('click', openDialog, {passive: true});

  // add event listener to visible submit button
  document.getElementById('submitButton').addEventListener('click', submitFile, {passive: true});

  document.getElementById("node-info").style.display="hidden";

  // add event listener for loading image
  var $loading = $('#load_spinner').hide();

  $(document)
      .ajaxStart(function(){
        $($loading).show();
      })
      .ajaxStop(function(){
        $($loading).hide();
      });

  // add event listener to filter slider
  document.getElementById('min_slider').addEventListener('mouseup', circleFilter, {passive: true});
  document.getElementById('max_slider').addEventListener('mouseup', circleFilter, {passive: true});

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
  // display the svg tree when called
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
      url : '/process_data',
      data: file,
      datatype: 'json',
      timeout: 1000,
      success: function(data) {
        $("div.slideshow").fadeOut(300);
        $("div.slide_btn").fadeOut(300, function() {
          $("button.tutorial").fadeOut(300, function() {
            $("div.logo").fadeOut(400, function() {
              displaySVG( function() {
                tree(data, "main");
              });
            });
          });
        });
      },
      error: function (xhr, status, errorThrown){
        document.getElementById("error_message").innerHTML = xhr.responseText;
        $( "#errorModal" ).modal("show");
      },
      processData: false,  // tell jQuery not to process the data
      contentType: false   // tell jQuery not to set contentType
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
  document.getElementById('tutorial_btn').addEventListener('click', startTutorial, {passive: true});
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