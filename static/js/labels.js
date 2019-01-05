import { circleSize } from "./circles.js"
import { tree } from "./tree.js";

let tree_configs;


function init_configs(con) {
    tree_configs = con;
}

// add the description of the code to the label
function addText() {
    

    var cur_node = d3.select(this.parentNode).data()[0],
        cur_text = "";
    if (document.getElementById("NameLabels").checked) {
        cur_text = cur_node.name;
    } else if (document.getElementById("DescriptionLabels").checked) {
        cur_text = cur_node.description;
    } else {
        cur_text = cur_node.description;
    }

    var data = [
        {
            text: cur_text
        }
    ]
    //console.log(d3.select(this.parentNode).data()[0].description);
    new d3plus.TextBox()
        .data(data)
        .fontResize(true)
        .width(tree_configs.rectWidth)
        .height(tree_configs.rectHeight)
        .verticalAlign("middle")
        .textAnchor("middle")
        .fontFamily("Open Sans")
        .x( function() { return labelX(); })
        .y( function() { return labelY(cur_node, tree_configs.sizeWeight); })
        .padding(5)
        .select(this.parentNode)
        .render();
  }

// adds and removes the node labels onclick
export function labelNode(d, con) {

    init_configs(con);
    //console.log(d3.select("g#node" + d.id));

    let node = d3.select("g#node" + d.id);

    if (node.attr("labeled") == "false") {
        
        let labelEnter = node.append("g");

        labelEnter.attr("transform", function(d) { return "translate(" + 0 + "," + 0 + ")"; })
            .attr("id", function(d) { return "label" + d.id; })
            .attr("class", "label")
            .call(d3.behavior.drag()
                .on("drag", dragged) );

        // add rect as label
        labelEnter.append("rect")
            .attr("id", function(d) { return  "node" + d.id; })
            .transition().duration(200)
            .attr('x', function(d) { return labelX(); })
            .attr('y', function(d) { return labelY(d); })
            .style("width", function(d) {return tree_configs.rectWidth; })
            .style("height", function(d) {return tree_configs.rectHeight; })
            .style("fill", "white")
            .style("stroke-width", 1.3)
            .style("stroke", "black")
            .each("end", addText);
        
        // add line from circle to label
        node.append("line")
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
        
        node.attr("labeled", true);
    
    }
    else {
        
        let labelEnter = node.select("g");

        labelEnter.select("rect")
            .transition()
            .duration(100)
            .style("width", 0)
            .style("height", 0)
            .remove();

        labelEnter.selectAll("g.d3plus-textBox").remove();

        node.select("line")
            .transition(100)
            .attr("x2", 0)
            .attr("y2", 0)
            .remove();

        labelEnter.transition()
            .delay(100)
            .duration(10)
            .remove();

        node.attr("labeled", false);
    }
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
    var zero = tree_configs.height/(tree_configs.deepest+1) - circleSize(d, tree_configs),
        buffer = circleSize(d, tree_configs),
        output_value = buffer;
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

    //console.log(d3.select(this));
    
    var label = this;

    this.x = this.x || 0;
    this.y = this.y || 0;

    this.x += d3.event.dx;
    this.y += d3.event.dy;

    var x = this.x,
        y = this.y;

    // drag the node that contains the rect object and the text object.
    d3.select(this)
        .attr("transform",  "translate(" + this.x + "," + this.y + ")");
    

    // drag the end of the line and recalculate
    d3.select("line#node" + d.id)
        .attr("x2", function() {
            if (labelCenter(label)) {
                return 0;
            }
            else if (labelBelow(label)){
                return x;
            }
            else if (labelAbove(label)){
                return x;
            }
            else if (labelLeft(label)) {
                return x + (tree_configs.rectWidth/2);
            }
            else if (labelRight(label)) {
                return x - (tree_configs.rectWidth/2);
            }
            else {
                return x;
            }
        })
        .attr("y2", function() { 
            if (labelCenter(label)) {
                return 0;
            }
            else if (labelBelow(label)){
                return y + labelY(d);
            }
            else if (labelAbove(label)){
                return y + tree_configs.rectHeight + labelY(d);
            }
            else if (labelLeft(label)) {
                return y + tree_configs.rectHeight/2 + labelY(d);
            }
            else if (labelRight(label)) {
                return y + tree_configs.rectHeight/2 + labelY(d);
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
function labelCenter(label) {

    var x = label.x,
        y = label.y;

    var comp = -(tree_configs.rectHeight/tree_configs.circle_offset);

    var calc = ( 
        (
            y <= comp
            &&
            y + tree_configs.rectHeight >= comp
        )
        && 
        (
            x - (tree_configs.rectWidth/2) <= 0
            &&
            x + (tree_configs.rectWidth/2) >= 0
        )
    );
    return calc;
}

function labelLeft(label){
    var x = label.x;

    var calc = (x - (tree_configs.rectWidth/2) < 0);
    return calc;
}

function labelRight(label){
    var x = label.x;

    var calc = (x + (tree_configs.rectWidth/2) > 0);
    return calc;
}

function labelAbove(label){
    var y = label.y;

    var comp = -(tree_configs.rectHeight/tree_configs.circle_offset + tree_configs.rectHeight);

    var calc = ( y < comp );
    return calc;
}

function labelBelow(label){
    var y = label.y;
    var comp = -(tree_configs.rectHeight/tree_configs.circle_offset);

    var calc = (y > comp);
    return calc;
}