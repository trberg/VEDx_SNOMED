import { 
    circleSize, sizeWeightCalc, 
    circleXLocation, circleYLocation, circleMouseover, 
    circleMouseout, circleChildRetract } from "./circles.js";
import {linkWidth} from "./links.js";
import { updateSlider } from "./sliders.js"

let tree_configs,
    sizeWeight,
    configs,
    cur_season,
    rectWidth,
    rectHeight,
    width,
    height,
    margin,
    sizes = [];

// set configuration values
const loadConfigs = (location) => {
    configs = {};
    configs.margin = {top: 20, right: 30, bottom: 0, left: 30};
  
    // initiate svg so widths and heights can be configured
    if (location == "main") {
        d3.select("svg#icd9graph")
            .style("background-color", "#fffff")
            .append("g")
                .attr("transform", "translate(" + configs.margin.left + "," + configs.margin.top + ")");
    }
    else if (location == "tutorial") {
        d3.select("svg#icd9tutorial")
            .style("background-color", "#fffff")
            .append("g")
                .attr("transform", "translate(" + configs.margin.left + "," + configs.margin.top + ")");
    }
    else {
        d3.select("svg#icd9graph")
            .style("background-color", "#fffff")
            .append("g")
                .attr("transform", "translate(" + configs.margin.left + "," + configs.margin.top + ")");
    }
    
    if (location == "tutorial") {
        var svg_width = d3.select("svg#icd9tutorial").style("width"),
            svg_height = d3.select("svg#icd9tutorial").style("height");
  
        var WIDTH = svg_width.substring(0, svg_width.length - 2),
            HEIGHT = svg_height.substring(0, svg_height.length - 2);
    
        configs.width = WIDTH,
        configs.height = HEIGHT - HEIGHT*0.2,
        configs.sizeWeight = 0.05;
    
        // add rectangles for label containers
        configs.rectWidth = configs.width*.15 //120; //screen.width*0.09;
        configs.rectHeight = configs.width*0.06 //50; //screen.width*0.045;
    
        // set default season value
        configs.labelSize = 450;
    }
    else {
        var menuHeight = d3.select(".top-bar").style("height"),
            svg_width = d3.select("svg.icd9class").style("width"),
            svg_height = d3.select("svg.icd9class").style("height");
    
        var WIDTH = svg_width.substring(0, svg_width.length - 2),
            HEIGHT = svg_height.substring(0, svg_height.length - 2),
            menuH = menuHeight.substring(0, menuHeight.length - 2);
    
        configs.width = WIDTH,
        configs.height = HEIGHT - menuH,
        configs.sizeWeight = 0.05;
    
        // add rectangles for label containers
        configs.rectWidth = 120; //screen.width*0.09;
        configs.rectHeight = 50; //screen.width*0.045;
    
        // set default season value
        configs.labelSize = 450;
    }
}

export function getConfigs() {
    return tree_configs;
}

// ************** Generate the tree diagram	 *****************
function update(root, location) {

    // category10
    var color = d3.scale.category20c();
      
    var i = 0;
  
    var tree = d3.layout.tree()
      .size([height, width]);
  
    var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, d.y]; });

    if (location=="tutorial") {
        var svg = d3.select("svg#icd9tutorial")
            .style("background-color", "#fff");
    }
    else {
        var svg = d3.select("svg.icd9class")
            .style("background-color", "#fff");
    }


    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    
    
    tree_configs.sizeWeight = sizeWeightCalc(nodes, tree_configs);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = circleYLocation(d, tree_configs); });
    

    // Declare the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });
  
  
    // Calculate the x-axis values
    nodes.forEach(function(d) { d.x = circleXLocation(d, nodes, tree_configs); });
  

    // Enter the nodes.
    var nodeEnter = node.enter().append("g")
      .attr("id", function(d){ return "node" + d.id; })
      .attr("class", "node")
      .attr("labeled", false)
        .attr("transform", function(d) { 
        return "translate(" + d.x + "," + d.y + ")"; });


    // add circles to the nodes and calculate size and color
    // add interaction features to circles
    nodeEnter.append("circle")
      .attr("r", function(d) { sizes.push(d.size); return circleSize(d, tree_configs); })
      .attr("id", function(d) { return "circle" + d.id; })
      .style("stroke", function(d) { return color(d.name.replace(/ .*/, "")); })
      .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
      //.on("dblclick", circledblClick(tree_configs) )
      .on("click", labelNode)
      .on("mouseover", function(d) { circleMouseover(d, tree_configs) })
      .on("mouseout", function(d) { circleMouseout(d, tree_configs) });
      //.on("contextmenu", function(d) { circleChildRetract(d, tree_configs) });

    // Declare the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });
    
    
    // Enter the links.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("targetid", function(d) { return d.target.id; })
        .style("stroke-width", function(d){ return linkWidth(d, tree_configs); })
        .style("stroke", function(d) {
            return color(d.source.name.replace(/ .*/, "")); })
        .attr("id", function(d) { return "parent" + d.source.id; })
        .attr("d", diagonal);

    // Append label node
    nodeEnter.append("g")
        .attr("transform", function(d) {
            return "translate(" + 0 + "," + 0 + ")"; })
        .attr("id", function(d) { return "label" + d.id; })
        .attr("labeled", false)
        .call(d3.behavior.drag()
            //.on("start", dragstart)
            .on("drag", dragged) );
            //.on("end", dragend));
}

// add the description of the code to the label
function addText() {
    

    var cur_node = d3.select(this.parentNode).data()[0]
    
    var data = [
        {
            text: cur_node.description
        }
    ]
    //console.log(d3.select(this.parentNode).data()[0].description);
    new d3plus.TextBox()
                .data(data)
                .fontResize(true)
                .width(rectWidth)
                .height(rectHeight)
                .verticalAlign("middle")
                .textAnchor("middle")
                .fontFamily("Open Sans")
                .x( function() { return labelX(); })
                .y( function() { return labelY(cur_node, sizeWeight); })
                .padding(5)
                .select(this.parentNode)
                .render();
  }

// adds and removes the node labels onclick
function labelNode() {
    
    let labelEnter = d3.select(this.parentNode).select("g");
    let lineEnter = d3.select(this.parentNode);
    
    if (labelEnter.attr("labeled") == "false") {
        
        // add rect as label
        labelEnter.append("rect")
            .attr("id", function(d) { return  "node" + d.id; })
            .transition().duration(200)
            .attr('x', function(d) { return labelX(); })
            .attr('y', function(d) { return labelY(d); })
            .style("width", function(d) {return rectWidth; })
            .style("height", function(d) {return rectHeight; })
            .style("fill", "white")
            .style("stroke-width", 1.3)
            .style("stroke", "black")
            .each("end", addText);
        
        // add line from circle to label
        lineEnter.append("line")
        .attr("id", function(d) { return "node" + d.id; })
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", 0)
        .transition().duration(200)
            .attr("x2", function(d) { return lineX(); })
            .attr("y2", function(d) { return labelY(d); })
            .style("stroke", "black")
            .style("stroke-width", .5);
        
        labelEnter.attr("labeled", true);
        lineEnter.attr("labeled", true);
    
    }
    else {
      labelEnter.select("rect")
      .transition()
        .duration(100)
        .style("width", 0)
        .style("height", 0)
        .remove();

      labelEnter.selectAll("g.d3plus-textBox").remove();

      lineEnter.select("line")
      .transition(100)
      .attr("x2", 0)
      .attr("y2", 0)
      .remove();

      labelEnter.attr("labeled", false);
      lineEnter.attr("labeled", false);
    }
}

const labelFilter = d => {

}

// filters which nodes should have labels based on the label size configuration
const rectFilter = d => {
    return (d.size < labelSize);
}

// calculates the x value for a label based on the x-values of it's neighbors to limit overlap.
const labelX = () => {
    var buffer = -(tree_configs.rectWidth/2);
       
    return buffer;
}

// calculates the distance from the center of the circle so the label is not overlapping the circle
// and adds a buffer.
const labelY = (d) => {
    //var buffer = d.size/sizeWeight;
    var zero = tree_configs.height/6 - circleSize(d, tree_configs),
        buffer = circleSize(d, tree_configs),
        output_value = buffer + 15;

    if ((output_value + tree_configs.rectHeight) < (zero)) {
        return output_value;
    }
    else {
        return zero - tree_configs.rectHeight;
    }
}

// calculates the endpoint of the line from circle to label so 
// that the end of the line is in the center of the rect
const lineX = () => {
    var x = labelX();
    return x + (tree_configs.rectWidth/2);
}

// enables the drag capabilities of the node labels
function dragged(d) {

    var x = d3.event.x - (tree_configs.rectWidth/2),
        y = d3.event.y - (tree_configs.rectHeight);
    

    // drag the node that contains the rect object and the text object.
    d3.select("g#label" + d.id)
        .attr("transform", function(d) {  return "translate("+d3.event.x+","+y+")";  });
    

    // drag the end of the line and recalculate
    d3.select("line#node" + d.id)
        .attr("x2", function() {
            if (labelCenter(this)) {
                return 0;
            }
            else if (labelBelow()){
                return x + (rectWidth/2);
            }
            else if (labelAbove()){
                return x + (rectWidth/2);
            }
            else if (labelLeft()) {
                return x + rectWidth;
            }
            else if (labelRight()) {
                return x;
            }
            else {
                return d3.event.x + (rectWidth/2);
            }
        })
        .attr("y2", function() { 
            if (labelCenter()) {
                console.log("center");
                return 0;
            }
            else if (labelBelow()){
                console.log("below");
                return y + labelY(d);
            }
            else if (labelAbove()){
                console.log("above");
                return y + rectHeight + labelY(d);
            }
            else if (labelLeft()) {
                console.log("left");
                return y + rectHeight/2 + labelY(d);
            }
            else if (labelRight()) {
                console.log("right");
                return y + rectHeight/2 + labelY(d);
            }
            else {
                return d3.event.y;
            }
        });

}


/*
    These functions detect the location of the label in relation to the center the circle they are labeling
    These are called when an active label is being dragged to calculate the location of the end of the connecting
    line between the center of the circle and the label.
*/
function labelCenter() {

    var x = d3.event.x,
        y = d3.event.y;

    var calc = ( 
        (y - tree_configs.rectHeight/2 < 0
        &&
        y + tree_configs.rectHeight/2 > 0 )
        && 
        (
            x - (tree_configs.rectWidth/2) < 0
            &&
            x + (tree_configs.rectWidth/2) > 0
        )
    );
    return calc;
}

function labelLeft(){
    var x = d3.event.x;

    var calc = (x - (tree_configs.rectWidth/2) < 0);
    return calc;
}

function labelRight(){
    var x = d3.event.x;

    var calc = (x + (tree_configs.rectWidth/2) > 0);
    return calc;
}

function labelAbove(){
    var y = d3.event.y;

    var calc = (y + tree_configs.rectHeight/2 < 0);
    return calc;
}

function labelBelow(){
    var y = d3.event.y;

    var calc = (y - tree_configs.rectHeight/2 > 0);
    return calc;
}


// loads the configureation variables and initiates the tree
export async function tree(root, location) {
    await loadConfigs(location);
    // set configurations
    tree_configs = configs,
    margin = configs.margin,
    width = configs.width,
    height = configs.height,
    sizeWeight = configs.sizeWeight,
    cur_season = configs.cur_season
    rectWidth = configs.rectWidth,
    rectHeight = configs.rectHeight;

    await update(root, location);
    updateSlider(sizes);
}

