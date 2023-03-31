
//import { export_init } from "./export.js";
import { update, initialize } from "./tree_dag.js";
import { get_data } from './data.js'
//import { startTutorial, loadExample } from "./tutorial.js";
//import { loadSlider } from "./sliders.js";
//import { circleFilter } from "./circles.js";

var data = get_data();

//console.log(data);

//var data = d3.json("VEDx_SNOMED/static/data/dag.json")


// initiation
const init = async () => {

    const create = d3.dagStratify()
        .id(({id}) => id)
        .parentIds(({ parents }) => parents);


    //const create = d3.dagHierarchy()
    //        .childrenData(({children}) => children);
            //.id(({id}) => id)
            //.children(({ children }) => children);

    const dag = create(data);
    //console.log(dag);

    var init_dag, svg;
    
    [init_dag, svg] = initialize(dag);
    
    //function
    //var y = [],
    //    x = [];
    
    //for (var node of dag) {
    //    y.push(node.y);
    //    x.push(node.x);
    //}
    

    // create and render tree
    update(init_dag, svg, data);

}
  
$(init);

//displaySVG( function() {
//    tree(data, "main");
//});