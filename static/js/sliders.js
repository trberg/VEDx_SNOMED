
/**
 * Source of slider code 
 * https://stackoverflow.com/questions/4753946/html5-slider-with-two-inputs-possible
 */

function getVals(){
    // Get slider values
    var parent = this.parentNode;
    var slides = parent.getElementsByTagName("input");
      var slide1 = parseFloat( slides[0].value );
      var slide2 = parseFloat( slides[1].value );
    // Neither slider will clip the other, so make sure we determine which is larger
    if( slide1 > slide2 ){ var tmp = slide2; slide2 = slide1; slide1 = tmp; }
    d3.select("#min_slider").attr("value", slide1);
    d3.select("#max_slider").attr("value", slide2);
    
    var displayElement = parent.getElementsByClassName("rangeValues")[0];
        displayElement.innerHTML = slide1 + " - " + slide2;
}

export function updateSlider(sizes) {

    var max = Math.max(...sizes),
        min = Math.min(...sizes);

    d3.select("#min_slider")
        .attr("min", min)
        .attr("max", max)
        .attr("value", min);
    
    d3.select("#max_slider")
        .attr("min", min)
        .attr("max", max)
        .attr("value", max);
    
    var displayElement = document.getElementsByClassName("rangeValues")[0];
    displayElement.innerHTML = min + " - " + max;

    $(".slider_header").fadeIn(200);
    $(".range-slider").fadeIn(200);
}

export function loadSlider() {
// Initialize Sliders
    var sliderSections = document.getElementsByClassName("range-slider");
    for( var x = 0; x < sliderSections.length; x++ ){
        var sliders = sliderSections[x].getElementsByTagName("input");
        for( var y = 0; y < sliders.length; y++ ){
            if( sliders[y].type ==="range" ){
                sliders[y].oninput = getVals;
                // Manually trigger event first time to display values
                sliders[y].oninput();
            }
        }
    }
}