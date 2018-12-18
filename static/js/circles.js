import { linkWidth } from "./links.js";
import { getConfigs } from "./tree.js";

// circle configuration functions

// circle size weight configuration calculation
export function sizeWeightCalc(nodes, con) {
    var depthWeights = [10000, 10000, 10000, 10000, 10000, 10000];

    for (var i=0; i<7; i++) {
        var depthScores = [];

        nodes.forEach(function(d) { 
            //var score = Math.sqrt(d.size);
            var score = d.size;
            if (d.depth == i) {
                depthScores.push(score);
            }
        });

        var totScore = (depthScores.reduce((a, b) => a + b, 0))*2,
            maxScore = Math.max(...depthScores),
            constant = 0.5,
            numNodes = depthScores.length,
            sizeWeight = (con.width - (constant * (numNodes + 1)))/totScore,
            maxSizeWeight = ((con.height/6) - con.margin.top)/(2*maxScore);
        
        if (sizeWeight != Infinity) {
            depthWeights[i] = Math.min(maxSizeWeight, sizeWeight);
        }
    };
    //console.log(Math.min(...depthWeights));
    return Math.min(...depthWeights);
}   

// define the size of the circles
export function circleSize(d, con) {
    if (d.depth > 1) {
        var threshold = 1;
    }
    else {
        var threshold = 3;
    }
    var cur_size = d.size;
        //console.log(cur_size);
    if (cur_size*con.sizeWeight > threshold) { 
        return cur_size*con.sizeWeight; 
    }
    else { 
        return threshold; 
    }
}

// calculate the x-axis location of a circle
export function circleXLocation(d, nodes, con) {

    var allDepthNodes = [],
        allSize = [];
    
    nodes.forEach(function(n) {
        (n.depth == d.depth) ? allDepthNodes.push(n.id) : "none";
        (n.depth == d.depth) ? allSize.push(circleSize(n, con)*2) : "none";

    });
    
    var index = allDepthNodes.reverse().indexOf(d.id),
        nodeNum = index + 1,

        leftNodeSizes = allSize.reverse().slice(0, index),
        leftNodeSpace = (leftNodeSizes.reduce((a, b) => a + b, 0)),

        sumSizes = (allSize.reduce((a, b) => a + b, 0)),
        add_width = (con.width-(con.margin.left+con.margin.right + sumSizes))/(allDepthNodes.length + 1),

        outX = (leftNodeSpace + nodeNum*add_width + circleSize(d, con) + con.margin.left);
    
        //d.x = outX;
    return outX;
}

function circleXUpdate(d, con) {
    var nodes = d3.selectAll("g.node")[0];

    var allDepthNodes = [],
        allSize = [];
    nodes.forEach(function(n) {
        var data = d3.select(n).data()[0],
            filtered = d3.select(n).attr("filtered");

        (data.depth == d.depth && filtered == "false") ? allDepthNodes.push(data.id) : "none";
        (data.depth == d.depth && filtered == "false") ? allSize.push(circleSize(data, con)*2) : "none";

    });
    
    var index = allDepthNodes.reverse().indexOf(d.id),
        nodeNum = index + 1,

        leftNodeSizes = allSize.reverse().slice(0, index),
        leftNodeSpace = (leftNodeSizes.reduce((a, b) => a + b, 0)),

        sumSizes = (allSize.reduce((a, b) => a + b, 0)),
        add_width = (con.width-(con.margin.left+con.margin.right + sumSizes))/(allDepthNodes.length + 1),

        outX = (leftNodeSpace + nodeNum*add_width + circleSize(d, con) + con.margin.left);
    return outX;
}

// calculate the Y-axis location of a circle based on depth.
export function circleYLocation(d, con) {
    var levels = con.height/6;
    return (d.depth*levels) + circleSize(d, con) + con.margin.top;
}

// reactive effects of mousing over a circle
export function circleMouseover(d, con) {
    let all_ids = [];
    d3.select("circle#circle" + d.id).transition()
        .ease("elastic")
        .duration("500")
        .attr("r", function(p) { return circleSize(p, con) + 10; });


    d3.selectAll("path#parent" + d.id).transition()
        .ease("elastic")
        .duration("500")
        .style("stroke-width", function(d){ return linkWidth(d, con) + 5; });
    
    
    d3.selectAll("g#node" + d.id)
        .call(function(d) { 
            getChildren(d.data()[0], all_ids);
        });
    
    all_ids.forEach( function(d) {
        d3.select("circle#circle" + d).transition()
            .ease("elastic")
            .duration("500")
            .attr("r", function(p) { return circleSize(p, con) + Math.log((circleSize(p, con))*2); });
        
        d3.selectAll("path#parent" + d).transition()
            .ease("elastic")
            .duration("500")
            .style("stroke-width", function(d){ return linkWidth(d, con) + Math.log(linkWidth(d, con)*10); });
    } )
}

// reactive elements of mousing out of a circle
export function circleMouseout(d, con) {
    let all_ids = [];
    d3.select("circle#circle" + d.id).transition()
        .ease("quad")
        .delay("100")
        .duration("200")
        .attr("r", circleSize(d, con) ); 

    d3.selectAll("path#parent" + d.id).transition()
        .ease("quad")
        .delay("100")
        .duration("200")
        .style("stroke-width", function(p) { return linkWidth(p, con); });
    
    d3.selectAll("g#node" + d.id)
        .call(function(d) { 
            getChildren(d.data()[0], all_ids);
        });
    
    all_ids.forEach( function(d) {
        d3.select("circle#circle" + d).transition()
            .ease("quad")
            .delay("100")
            .duration("200")
            .attr("r", function(p) { return circleSize(p, con); });
        
        d3.selectAll("path#parent" + d).transition()
            .ease("quad")
            .delay("100")
            .duration("200")
            .style("stroke-width", function(d){ return linkWidth(d, con); });
    } )
    
}

function noLargeChildren(d) {
    var sizes = [];
    getChildSizes(d, sizes);
    var maxSize = Math.max(...sizes);
    if (maxSize > d.size) {
        return false;
    }
    else {
        return true;
    }
}

export function circleFilter() {
    var configs = getConfigs(),
        min = d3.select("#min_slider").attr("value"),
        max = d3.select("#max_slider").attr("value");
    
    // retract all filtered nodes
    d3.selectAll("g.node")
        .filter(function(d) {
            console.log(d.name);
            console.log(noLargeChildren(d)); 
            return ((d.size < min || d.size > max) && noLargeChildren(d)); 
        })
        //.filter(function(d) { return noLargeChildren(d) })
        .attr("filtered", true)
        .transition().ease("sin").delay(300).duration(400)
        //    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"})
            .attr("transform", function(d) { return "translate(" + circleXUpdate(d, configs) + "," + d.y + ")"; });

    d3.selectAll("g.node")
        .filter(function(d) { return (d.size < min || d.size > max); })
        //.filter(function(d) { return noLargeChildren(d) })
        .select("circle")
            .transition().ease("sin").duration(300)
                .attr("r", 0);
    
                
    // expand all non-filtered nodes
    d3.selectAll("g.node")
        .filter(function(d) { return (d.size >= min && d.size <= max); })
        .attr("filtered", false)
        .transition().ease("sin").duration(400)
        //    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"})
            .attr("transform", function(d) { return "translate(" + circleXUpdate(d, configs) + "," + d.y + ")"; })   
        .select("circle")
            .transition().ease("sin").duration(200)
                .attr("r", function(d) { return circleSize(d, configs); });

    
    //d3.selectAll("g.node")
    //    .transition().ease("sin").duration(100)
    //        .attr("transform", function(d) { return "translate(" + circleXUpdate(d, configs) + "," + d.y + ")"; });
    
    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.x, d.y]; });


    //d3.selectAll("path.link")
    //    .attr("class", "link")
    //    .attr("targetid", function(d) { console.log(d); return d.target.id; })
    //    .style("stroke-width", function(d){ return linkWidth(d, tree_configs); })
    //    .style("stroke", function(d) {
    //        return color(d.source.name.replace(/ .*/, "")); })
    //    .attr("id", function(d) { return "parent" + d.source.id; })
    //    .attr("d", diagonal);
    
}

export function circleChildRetract(d, con) {
    
    d3.event.preventDefault();
    //var child_ids = []
    //getChildren(d, child_ids);

    var children = d.children;
    children.forEach( function(child) {

        //console.log(d3.select("g#node" + child.id).style("x"));
        
        d3.select("g#node" + child.id).transition()
            .duration(1000)
                //.attr("r", 0)
                .attr("x", d.x)
                .attr("y", d.y);
    });

    //console.log(child_ids);
}

export function getChildSizes(d, maxsize) {
    var children = d.children;
    if (children == undefined){
        return;
    }
    else {
        children.forEach( function(child) {
            maxsize.push(child.size);
            getChildSizes(child, maxsize);
        });
    }
}

function getChildren(d, all_ids) {
    var children = d.children;
    if (children == undefined){
        return;
    }
    else {
        children.forEach( function(child) {
            all_ids.push(child.id);
            getChildren(child, all_ids);
        });
    }
}
