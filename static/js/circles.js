import { linkWidth } from "./links.js";

// circle configuration functions

// circle size weight configuration calculation
export function sizeWeightCalc(nodes, con) {
    var depthWeights = [10000, 10000, 10000, 10000, 10000, 10000];

    for (var i=0; i<7; i++) {
        var depthScores = [];

        nodes.forEach(function(d) { 
            if (d.depth == i) {
                depthScores.push(d.size);
            }
        });

        var totScore = (depthScores.reduce((a, b) => a + b, 0))*2,
            maxScore = Math.max(...depthScores),
            constant = 5,
            numNodes = depthScores.length,
            sizeWeight = (con.width - (constant * (numNodes + 1)))/totScore,
            maxSizeWeight = ((con.height/6) - con.margin.top)/(2*maxScore);
        
        if (sizeWeight != Infinity) {
            //depthWeights[i] = sizeWeight;
            depthWeights[i] = Math.min(maxSizeWeight, sizeWeight);
        }
    };
    return Math.min(...depthWeights);
}   

// define the size of the circles
export function circleSize(d, con) {
    var threshold = 2.5
    if (d.size*con.sizeWeight > threshold) { 
        return d.size*con.sizeWeight; 
    } 
    else { 
        return threshold; 
    }
}

// calculate the x-axis location of a circle
export function circleXLocation(d, nodes, con) {
    
    //console.log( d3.select("circle#circle" + d.id).attr("width") );

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
    d.x = outX;
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

export function circleChildRetract(d, con) {
    
    d3.event.preventDefault();
    //var child_ids = []
    //getChildren(d, child_ids);

    var children = d.children;
    console.log(d.x);
    children.forEach( function(child) {

        console.log(d3.select("g#node" + child.id).style("x"));
        
        d3.select("g#node" + child.id).transition()
            .duration(1000)
                //.attr("r", 0)
                .attr("x", d.x)
                .attr("y", d.y);
    });

    console.log(d);

    //console.log(child_ids);
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
