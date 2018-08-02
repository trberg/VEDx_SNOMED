import { circleSize, sizeWeightCalc, circleXLocation, circleYLocation, circleMouseover, circleMouseout, circleChildRetract } from "./circles.js";
import {linkWidth} from "./links.js";

let tree_configs,
    sizeWeight,
    configs,
    cur_season,
    rectWidth,
    rectHeight,
    width,
    height,
    margin;

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
        configs.height = HEIGHT,
        configs.sizeWeight = 0.05;
    
        // add rectangles for label containers
        configs.rectWidth = 120; //screen.width*0.09;
        configs.rectHeight = 50; //screen.width*0.045;
    
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

// ************** Generate the tree diagram	 *****************
function update(root, location) {

    // category10
    var color = d3.scale.category20c();
      
    var i = 0;
  
    var tree = d3.layout.tree()
      .size([height, width]);
  
    var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, d.y]; });

    if (location=="main") {
        var svg = d3.select("svg.icd9class")
            .style("background-color", "#fff");
    }
    else if (location=="tutorial") {
        var svg = d3.select("svg#icd9tutorial")
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
    nodes.forEach(function(d) { return circleXLocation(d, nodes, tree_configs); });
  

    // Enter the nodes.
    var nodeEnter = node.enter().append("g")
      .attr("id", function(d){ return "node" + d.id; })
      .attr("class", "node")
      .attr("labeled", false)
        .attr("transform", function(d) { 
        return "translate(" + d.x + "," + d.y + ")"; });
  
    nodeEnter.append("circle")
      .attr("r", function(d) { return circleSize(d, tree_configs); })
      .attr("id", function(d) { return "circle" + d.id; })
      .style("stroke", function(d) { return color(d.name.replace(/ .*/, "")); })
      .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
      //.on("dblclick", circledblClick(tree_configs) )
      .on("click", labelNode)
      .on("mouseover", function(d) { circleMouseover(d, tree_configs) })
      .on("mouseout", function(d) { circleMouseout(d, tree_configs) })
      .on("contextmenu", function(d) { circleChildRetract(d, tree_configs) });

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
}

// add the description of the code to the label
function addText() {
    let labelEnter = d3.select(this.parentNode);

    var configs = {
        "width": rectWidth,
        "height": rectHeight,
        "shape":"square",
        "valign" :"middle",
        "align": "middle",
        "padding": 3,
        "resize": true
    }
    //.text(function(d) { return d.description + "   " + d.name; })
    labelEnter.append("text")
        .attr("id", function(d) { return "text" + "node" + d.id; })
        .attr("x", function(d) { return labelX()+3; })
        .attr("y", function(d) { return labelY(d, sizeWeight)+3; })
        .each(function(d) {
            /*d3.select("text#textnode" + d.id).append("tspan")
                .text("Code: " + d.name)
                .attr("x", labelX()+3)
                .attr("dy", "10px");*/

            d3plus.textwrap()
                .config(configs)
                .size([5,20])
                .container(d3.select(this))
                .text({ value: d.description })
                .draw();
            });
  }

// adds and removes the node labels onclick
function labelNode() {
    let labelEnter = d3.select(this.parentNode);
    
    if (labelEnter.attr("labeled") == "false") {
    
        // add rect as label
        labelEnter.append("rect")
        .attr("id", function(d) { return  "node" + d.id; })
        .call(d3.behavior.drag()
            .on("drag", dragged))
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
        labelEnter.append("line")
        .attr("id", function(d) { return "line" + "node" + d.id; })
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
    
    }
    else {
      labelEnter.select("rect")
      .transition()
        .duration(100)
        .style("width", 0)
        .style("height", 0)
        .remove();

      labelEnter.select("text").remove();

      labelEnter.select("line")
      .transition(100)
      .attr("x2", 0)
      .attr("y2", 0)
      .remove();

      labelEnter.attr("labeled", false);
    }
}

const labelFilter = d => {
    if (cur_season == "winter") {
        return (d.size > 90 || d.depth < 2);
    }
    if (cur_season == "summer") {
        return (d.size > 170 || d.depth < 2) || (d.size > 50 && d.depth == 5);
    }
    if (cur_season == "spring") {
        return (d.size > 30 || d.depth < 2);
    }
    if (cur_season == "fall") {
        return (d.size > 10 || d.depth < 2);
    }
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
        //console.log(output_value);
        //console.log(tree_configs.rectHeight);
        //console.log(output_value + tree_configs.rectHeight);
        //console.log((tree_configs.height/6) - (tree_configs.rectHeight + 5))
        //return (tree_configs.height/6) - (tree_configs.rectHeight + 5);
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

    // drag the rect
    d3.select(this)
        .attr("x", d.x = d3.event.x)
        .attr("y", d.y = d3.event.y);

    // drag the end of the line and recalculate
    d3.select("line#line" + this.id)
        .attr("x2", function() {
            if (labelCenter()) {
                return 0;
            }
            else if (labelBelow()){
                return d3.event.x + (rectWidth/2);
            }
            else if (labelAbove()){
                return d3.event.x + (rectWidth/2);
            }
            else if (labelLeft()) {
                return d3.event.x + rectWidth;
            }
            else if (labelRight()) {
                return d3.event.x;
            }
            else {
                return d3.event.x + (rectWidth/2);
            }
        })
        .attr("y2", function() { 
            if (labelCenter()) {
                return 0;
            }
            else if (labelBelow()){
                return d3.event.y;
            }
            else if (labelAbove()){
                return d3.event.y + rectHeight;
            }
            else if (labelLeft()) {
                return d3.event.y + rectHeight/2;
            }
            else if (labelRight()) {
                return d3.event.y + rectHeight/2;
            }
            else {
                return d3.event.y;
            }
        });

    // drag the text in the rect
    d3.select("text#text" + this.id)
        .attr("y", d3.event.y)
        .selectAll("tspan")
        .attr("x", d3.event.x + (rectWidth)/2);

}

function labelCenter() {
    var calc = ((d3.event.x < 0 && d3.event.y < 0) && 
    (d3.event.y + tree_configs.rectHeight > 0 && d3.event.x + tree_configs.rectWidth > 0));
    return calc;
}

function labelLeft(){
    var calc = (d3.event.x < 0 && d3.event.x + tree_configs.rectWidth < 0);
    return calc;
}

function labelRight(){
    var calc = (d3.event.x > 0 && d3.event.x + tree_configs.rectWidth > 0);
    return calc;
}

function labelAbove(){
    var calc = (d3.event.y < 0 && d3.event.y + tree_configs.rectHeight < 0);
    return calc;
}

function labelBelow(){
    var calc = (d3.event.y > 0 && d3.event.y + tree_configs.rectHeight > 0);
    return calc;
}

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

    update(root, location);
}

