import { linkWidth } from "./links.js";
import { getConfigs, update } from "./tree.js";
import { updateSlider } from "./sliders.js";


// circle size weight configuration calculation
export function sizeWeightCalc(nodes, con) {
    var depthWeights = [10000, 10000, 10000, 10000, 10000, 10000];

    for (var i=0; i< 5; i++) {
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
            maxSizeWeight = ((con.height/5) - con.margin.top)/(2*maxScore);
        
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

// updates the x location of the nodes
// divides available space between the nodes, taking into account size of all the nodes
export function circleXUpdate(d, con) {
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
    var levels = con.height/(con.deepest + 1);
    return (d.depth*levels) + circleSize(d, con)/con.circle_offset + con.margin.top;
}


// reactive effects of mousing over a circle
export function circleMouseover(d, con) {

    let all_ids = [];
    d3.select("circle#circle" + d.id).transition()
        .ease("elastic")
        .duration("500")
        .attr("r", function(p) { return circleSize(p, con) + 10; });

    /*
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
    
    } )*/
}


// reactive elements of mousing out of a circle
export function circleMouseout(d, con) {
    let all_ids = [];
    d3.select("circle#circle" + d.id).transition()
        .ease("quad")
        .delay("100")
        .duration("200")
        .attr("r", circleSize(d, con) ); 

    /*d3.selectAll("path#parent" + d.id).transition()
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
    } )*/
    
}

// returns an array of all the sizes of the descendants of the input node d.
// appends the sizes to the input array "sizes"
function getDescendantsSizes(d, sizes) {
    if (!d.children) {
        return 0;
    }
    d.children.forEach(function (child) {
        sizes.push(child.size);
        getDescendantsSizes(child, sizes);
    })
}

// checks to see if all the children of the input node are either not present or
// outside the the min max range.
// if both conditions are true, returns true.
export function noChildren(d, min, max) {
    var sizes =[];
    getDescendantsSizes(d, sizes);
    
    if (sizes.length == 0) {
        return true;
    } 
    else {
        var output = true;
        sizes.forEach(function(size) {
            
            if (size >= min && size <= max) {
                output = false;
            }
            
        })
        return output;
    }
}

// removes the child nodes of the input node that are outside the given min/max range and have no children.
// puts these children into the _children_filter array of the data object.
function removeChildren(cur_node, min, max) {
    
    if (cur_node.children) {
        var children_filter = [];
        var children_keep = [];
        cur_node.children.forEach(
            function(d) {
                if ((d.size < min || d.size > max) && noChildren(d, min, max)) {
                    children_filter.push(d);
                    d["filtered"] = true;
                    d["unfiltering"] = false;
                    
                } else {
                    children_keep.push(d);
                    d["filtered"] = false;
                    d["unfiltering"] = false;
                }
                removeChildren(d, min, max);
            }
        );
        if (cur_node._children_filter) {
            cur_node._children_filter = cur_node._children_filter.concat(children_filter);
        } else {
            cur_node._children_filter = children_filter;
        }
        cur_node.children = children_keep;
    }
}

// allows for the sorting of child objects. Sorts on id.
function compare_children(a,b) {
    if (a.id < b.id) {
        return 1;
    }
    if (a.id > b.id) {
        return -1;
    }
    return 0;
}

// adds children that are in the _children_filter array that are inside the min/max size range.
function addChildren(cur_node, min, max) {
    var children_add = [];
    var children_filtered = [];
    if (cur_node._children_filter) {
        cur_node._children_filter.forEach(
            function(d) {
                if (d.size >= min && d.size <= max) {
                    children_add.push(d);
                    d["filtered"] = false;
                    d["unfiltering"] = true;
                } else {
                    children_filtered.push(d);
                    d["filtered"] = true;
                    d["unfiltering"] = false;
                }
                addChildren(d, min, max);
            }
        );
    }
    if (cur_node.children) {
        cur_node.children = cur_node.children.concat(children_add);
        cur_node.children.forEach(
            function(d) {addChildren(d, min, max); }
        )
    } else {
        cur_node.children = children_add;
    }
    cur_node.children.sort(compare_children);
    cur_node._children_filter = children_filtered;
}


// this function is called on mouseup on the filter by node size slider.
// calls the two values min and max to define the min/max size range.
// calls the top node in the tree and iterates down the tree removing all nodes and their 
// children that are outside the min/max range.
// also checks to add those children that have been removed but are now inside the min/max range.
export function circleFilter() {

    var min = d3.select("#min_slider").attr("value"),
        max = d3.select("#max_slider").attr("value");
    
    var cur_node = d3.selectAll("g.node").filter(function(d) {return (d.depth == 0);}).data();
    
    cur_node.forEach(function(d) { removeChildren(d, min, max); })
        
    cur_node.forEach(function(d) { addChildren(d, min, max); });

    update(cur_node[0]);
    
}

// gets all the of the sizes of the children of the input node
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


// toggles the presence of children
export function children_toggle(d, root, location) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }

    update(root, location);
}
