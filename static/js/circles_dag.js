import { update, initialize } from "./tree_dag.js";


// ============ EXPORT FUNCTIONS ============
// reactive effects of mousing over a circle
export function circleMouseover(d) {

    d3.select('circle#' + d.target.id)
        .transition()
        .ease(d3.easeElastic)
        .duration("500")
        .attr("r", (n) => circleSize(n) + 5);
}

// reactive elements of mousing out of a circle
export function circleMouseout(d) {

    d3.select('circle#' + d.target.id).transition()
        .ease(d3.easeQuad)
        .delay("100")
        .duration("200")
        .attr("r", (n) => circleSize(n) );
}

// define the size of the circles
export function circleSize(d) {
    var threshold = 3;
    
    if (d.data.counts > threshold) {
        return d.data.counts;
    }
    else {
        return threshold; 
    }
}

// if no children, change color
export function mouseDownCheckChildren(e, d) {

    if (d._dataChildren) {    
        if ( d.dataChildren.length == 0 & d._dataChildren.length == 0 ) {
            d3.select(`circle#n${d.data.id}`)
                .attr("fill", "#ff0000");
        }
    } else if (!d._dataChildren) {
        if ( d.dataChildren.length == 0 & !d._dataChildren ) {
            d3.select(`circle#n${d.data.id}`)
                .attr("fill", "#ff0000");
        }
    }
}

// ============ LOCAL FUNCTIONS ============
// check if descendant in the input list of descendants (compDescendants)
function inDescendants(desc1, compDescendants) {
    for (var desc of compDescendants) {
        if (desc.data.id == desc1.data.id) {
            //console.log(desc.data, desc1.data);
            return true;
        }
    }
    return false;
}

// gather list of ids from data object
function gatherIds(data) {
    var output_ids = new Array();
    
    data.forEach( function (item) {
        output_ids.push(item.id);
    })

    return output_ids;
}

function filterExistingCodes(ids, data) {
    var remaining_codes = new Array();

    data.forEach( function (item) {
        if (ids.includes(item.id)) {}
        else {
            remaining_codes.push(item);
        }
    })
    return remaining_codes;
}

// define the on click function
// On click, the descendants of the clicked node will retract.
export async function circleClick(e, d, dag, svgSelection, data) {
    
    
    //Collect the children of the input code
    //var cur_children_data = await d3.json('/children?code=' + d.data.id);

    //const cur_descendants = d.descendants('breadth').reverse()
    const cur_descendants = [d.roots()[0]]
    //console.log(d.roots()[0]);

    //console.log(dag.data);
    //var orig_data = dag.data;

    
    // if node is a descendant of the currently clicked node, retract the children
    for (var desc of dag.idescendants()) {
        if (inDescendants(desc, cur_descendants)) {
            
            console.log(desc);

            if (desc._dataChildren && desc._dataChildren.length > 0) {
                //console.log(desc._dataChildren);
                desc.dataChildren = desc._dataChildren;
                desc._dataChildren = [];
            } else if (desc.dataChildren.length > 0) {
                desc._dataChildren = desc.dataChildren;
                desc.dataChildren = [];
            } else if (!desc._dataChildren && desc.dataChildren.length == 0) {
                console.log('No data children');
                d3.select(`circle#n${d.data.id}`)
                    .transition()
                    .delay(500)
                    .ease(d3.easeCubicIn)
                    .duration(200)
                    .attr("fill", (n) => { n.data.color });
                    //.attr("fill", "#ff0000");
                    //.transition()
                    //    .delay(500)
                        
            } else {
                console.log('we got here');
            }
        }
    }
    //console.log(e);
    //console.log(data);
    
    //var existing_ids = gatherIds(data);
    //var remaining_codes = filterExistingCodes(existing_ids, cur_children_data.children)
    
    //console.log(remaining_codes);

    //var new_data = data.concat(remaining_codes)

    //console.log(new_data);
    //console.log(existing_ids);
    //console.log(cur_children_data.children);

    //const create = d3.dagStratify()
    //    .id(({id}) => id)
    //    .parentIds(({ parents }) => parents);


    //const new_dag = create(new_data);

    //[dag, svgSelection] = initialize(new_dag);

    update(dag, svgSelection, data);
}
