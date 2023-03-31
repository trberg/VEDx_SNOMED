import { circleMouseover, circleMouseout, circleSize, circleClick } from "./circles_dag.js";

// set configuration values
const loadConfigs = () => {
    configs = {};
    configs.margin = {top: 20, right: 30, bottom: 0, left: 30};
  
    // initiate svg so widths and heights can be configured
    const svg = d3.select("svg#dag-tree")
        .style("background-color", "#fffff")
        .append("g")
            .attr("transform", "translate(" + configs.margin.left + "," + configs.margin.top + ")");

    return svg;
}

//const svg = d3.select("svg");

// *************** Generate the first version of the dag ****************
export function initialize(dag) {

    var doc_height = $(document).height();
    var doc_width = $(document).width();


    var nodeSizeHeight = doc_height/(dag.height().value + 4)
    var nodeSizeWidth  = doc_width/16

    var configs = {};
    configs.margin = {top: 20, right: 30, bottom: 0, left: 30};
  
    // initiate svg so widths and heights can be configured
    const layout = d3.sugiyama()
        .nodeSize(node => node === undefined ? [0, 0] : [nodeSizeWidth, nodeSizeHeight]);

    
    const { width, height } = layout(dag);

    const svg = d3.select("svg#dag-tree")
        .attr("width", width)
        .attr("height", height)
        .style("background-color", "#fffff")
        .append("g")
            .attr("transform", "translate(" + configs.margin.left + "," + configs.margin.top + ")");
;
    console.log(svg);
    return [dag, svg];
}


// ************** Generate the tree diagram	 *****************
export function update(dag, svgSelection) {
    
    try {
        
        // timing configurations
        var duration = 500,
            exit_duration = 200,
            wait_time = exit_duration,
            easement = d3.easeElastic,
            exit_easement = d3.easeBack
        

        // Function to generate link between nodes
        const gen_link = d3.link(d3.curveBumpY)
            .x(d => d.x)
            .y(d => d.y); 

        
        // Setup initial link attributes
        var link = svgSelection.selectAll("g.links")
            .data(dag.links())
            .enter()
            .append('path')
            .attr("class", "link")
            .attr("d", (d) => gen_link(d))
            .style("stroke-width", 0);
        
        
        // Setup link transition to final destination
        link.transition()
            .delay(wait_time)
            .ease(easement)
            .duration(duration)
            .attr("d", (d) => gen_link(d))
            .style("stroke", ({ target }) => { return `${target.data.color}` })
            .style("stroke-width", ({source, target}) => {
                var minValue = Math.min(... [source.data.counts, target.data.counts])
                if (minValue == 0) {
                    return 1;
                } else {
                    return minValue;
                }
            });

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .ease(exit_easement)
            .duration(exit_duration)
            .attr("d", (d) => transform_links(d))    
            .attr("stroke-width", 0)
            .remove();

        
        // setup intial node attributes
        const nodes = svgSelection
            .selectAll("g.nodes")
            .data(dag.descendants())
            .enter()
            .append("g")
            .attr("transform", (d) => {return "translate(" + d.x + "," + d.y + ")"} );

        // setup the transition for g node
        nodes.transition()
            .delay(wait_time)
            .ease(easement)
            .duration(duration)
            .attr("transform", (n) => transform_nodes(n) );
        

        // Plot node circles
        nodes.append("circle")
            .attr("id", (n) => "circle" + n.data.id )
            .attr("stroke", "black" )
            .attr("fill", (n) => n.data.color )
            .attr("r", 0)
            .on("mouseover", function(d) { circleMouseover(d) })
            .on("mouseout", function(d) { circleMouseout(d) })
            .on("click", (e, d) => circleClick(e, d, dag, svgSelection) )
            .transition()
                .delay(wait_time)
                .ease(easement)
                .duration(duration)
                .attr("r", (n) => circleSize(n) );
        

         // setup the exit transition
         nodes.exit().transition()
            .ease(exit_easement)
            .duration(exit_duration)
            .attr("transform", (n) => transform_nodes(n) )
            .style("opacity", 1e-6)
            .remove()
            .select("circle").attr("r", 0);
            

        // Add text to nodes
        nodes
            .append("text")
            .text((d) => d.data.id)
            .attr("font-weight", "800")
            .attr("font-family", "sans-serif")
            .attr("text-anchor", "middle")
            .attr("font-size", 0)
            .attr("alignment-baseline", "text-before-edge")
            .attr("fill", "black")
            .attr("dy", 5)
            .transition()
                .delay(wait_time)
                .ease(easement)
                .duration(duration)
                .attr("font-size", 10);

    } catch (error) {
        console.log(error);
    }
};

function transform_links (d, diagonal) {

    console.log(d);
    console.log(diagonal(d));
    console.log(diagonal({
        source: [d.source.x, d.source.y],
        target: [d.target.x, d.target.y]
    }));
    console.log("=======================")

    if (event) {
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
    } else {
        var o = {x: d.source.x, y: d.source.y};
        return diagonal({source: o, target: o});
    }
    
}

function transform_nodes (d) {

    if (event) {
        if (event.type == "load") {
            console.log("load event")
            
            return "translate(" + d.x + "," + d.y + ")";
        } else if (d3.event && d3.event.isTrusted && d3.event.type == 'click') {
            var event_node = d3.select(d3.event.target).data()[0],
                x = event_node.x,
                y = event_node.y;
            return "translate(" + x + "," + y + ")";
        } else if (event && event.isTrusted && event.type == 'click') {
            var cur_node = d;
            //console.log(event);
            var event_node = d3.select(event.target).data()[0],
                x = event_node.x,
                y = event_node.y;
            console.log(event_node._dataChildren);
            console.log(event_node.dataChildren);
            //while ( cur_node.filtered || cur_node.unfiltering ) {
            //    cur_node = cur_node.parent;
            //}
            //console.log(d);
            //console.log("click event");
            return "translate(" + cur_node.x + "," + cur_node.y + ")";
        } else {
            return "translate(" + d.parent.x + "," + d.parent.y + ")";
        }
    } else {
        return "translate(" + d.x + "," + d.y + ")";
    }
    
}


// loads the configureation variables and initiates the tree
export async function tree(root) {

    // await loadConfigs();
    // set configurations
    
    // update tree
    update(root);
}

