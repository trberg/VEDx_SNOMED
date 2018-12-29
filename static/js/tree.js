import { 
    circleSize, sizeWeightCalc, 
    circleXLocation, circleYLocation, circleMouseover, 
    circleMouseout, circleXUpdate, children_toggle, noChildren } from "./circles.js";
import {linkWidth} from "./links.js";
import { updateSlider } from "./sliders.js"
import { labelNode } from "./labels.js"

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
    configs.circle_offset = 3;
  
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
export function update(root, location) {

    // category10
    var color = d3.scale.category20c();
      
    var i = 0;
    
    var duration = 1500,
        exit_duration = 250,
        wait_time = exit_duration,
        easement = "elastic",
        exit_easement = "back"
    

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

    tree_configs.deepest = deepest_node(root);

    // Calculated the y-axis values
    nodes.forEach(function(d) { d.y = circleYLocation(d, tree_configs); });
    

    // Calculate the x-axis values
    nodes.forEach(function(d) { d.x = circleXLocation(d, nodes, tree_configs); });


    // Declare the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });
  

    // Enter the nodes.
    var nodeEnter = node.enter().append("g")
        .attr("id", function(d){ return "node" + d.id; })
        .attr("class", "node")
        .attr("labeled", false)
        .attr("transform", function(d) { return transform_nodes(d); });
    

    node.transition()
        .delay(wait_time)
        .ease(easement)
        .duration(duration)
        .attr("transform", function(d) { 
            d.x = circleXLocation(d, nodes, tree_configs);
            d.y = circleYLocation(d, tree_configs);
            return "translate(" + d.x + "," + d.y + ")"; })


    // add circles to the nodes and calculate size and color
    // add interaction features to circles
    nodeEnter.append("circle")
        .attr("r", 0)
        .attr("id", function(d) { return "circle" + d.id; })
        .style("stroke", function(d) { return color(d.name.replace(/ .*/, "")); })
        .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
        //.on("dblclick", circledblClick(tree_configs) )
        .on("click", function(d) {
            if (document.getElementById("toggleLabels").checked) {
                    labelNode(d, configs);
            } else if (document.getElementById("toggleChildren").checked) {
                    children_toggle(d, root, location);
            } else {
                    children_toggle(d, root, location);
            }
            })
        //.on("mouseover", function(d) { labelNode() })
        .on("mouseover", function(d) { circleMouseover(d, tree_configs) })
        .on("mouseout", function(d) { circleMouseout(d, tree_configs) });
    
    node.select("circle")
        .transition()
            .delay(wait_time)
            .ease(easement)
            .duration(duration)
            .attr("r", function(d) { return circleSize(d, tree_configs); });
    
    //console.log(nodeEnter);
    node.exit().transition()
        .ease(exit_easement)
        .duration(exit_duration)
        .attr("transform", function(d) { return transform_nodes(d); })
        .style("opacity", 1e-6)
        .remove()
        .select("circle").attr("r", 0);

    // Declare the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });
    
    
    var test_color = "";

    // Enter the links.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .style("stroke-width", 0)
        .style("stroke", function(d) {
            if (d.source.color) {
                return d.source.color;
            } else {
                return color(d.source.name.replace(/ .*/, ""));
            } })
        .attr("d", function(d) { return transform_links(d, diagonal); });
    
    link.transition()
        .delay(wait_time)
        .ease(easement)
        .duration(duration)
        .attr("d", diagonal)
        .style("stroke-width", function(d){ return linkWidth(d, tree_configs); });
    
      // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .ease(exit_easement)
        .duration(exit_duration)
        .attr("d", function(d) { return transform_links(d, diagonal); })    
        .attr("stroke-width", 0)
        .remove();
}


function getChildDepths(d, depths) {
    if (!d.children) {
        return 0;
    }
    d.children.forEach(function (child) {
        depths.push(child.depth);
        getChildDepths(child, depths);
    })
}


function deepest_node(root) {

    var depths = [];
    getChildDepths(root, depths);
    var max_depth = Math.max(...depths);

    return max_depth;
}

function transform_nodes (d) {
    
    if (event.type == "load") {
        var cur_node = d;
        while (cur_node.depth != 0) {
            cur_node = cur_node.parent;
        }
        return "translate(" + cur_node.x + "," + cur_node.y + ")";
    } else if (d3.event && d3.event.isTrusted && !isFilterEvent()) {
        var event_node = d3.select(d3.event.target).data()[0],
            x = event_node.x,
            y = event_node.y;
        return "translate(" + x + "," + y + ")";
    } else if (event && event.isTrusted && isFilterEvent()) {
        var cur_node = d;
        while ( cur_node.filtered || cur_node.unfiltering ) {
            cur_node = cur_node.parent;
        }
        return "translate(" + cur_node.x + "," + cur_node.y + ")";
    } else {
        return "translate(" + d.parent.x + "," + d.parent.y + ")";
    }
}

function transform_links (d, diagonal) {
    if (event.type == "load") {
        var cur_node = d.source;
        while (cur_node.depth != 0) {
            cur_node = cur_node.parent;
        }
        var o = {x: cur_node.x, y: cur_node.y};
        return diagonal({source: o, target: o});

    } else if (d3.event && d3.event.isTrusted && !isFilterEvent()) {

        var event_node = d3.select(d3.event.target).data()[0],
            o = {x: event_node.x, y: event_node.y};
        return diagonal({source: o, target: o});

    } else if (event && event.isTrusted && isFilterEvent()) {

        var cur_node = d.source;
        while ( cur_node.filtered || cur_node.unfiltering ) {
            cur_node = cur_node.parent;
        }
        var o = {x: cur_node.x, y: cur_node.y};
        return diagonal({source: o, target: o});

    } else {
        var o = {x: d.source.x, y: d.source.y};
        return diagonal({source: o, target: o});
    }
    
}

function isFilterEvent() {
    if (event.target.id == "min_slider") {
        return true;
    } else if (event.target.id == "max_slider") {
        return true;
    } else {
        return false;
    }
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

    update(root, location);
    updateSlider(root);
}

