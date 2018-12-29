/*
    Original source code here: http://bl.ocks.org/Rokotyan/0556f8facbaf344507cdc45dc3622177
*/

const setExportButton = () => {

    // Listener for exporting PNG files
    d3.select('#saveButton').on('click', 
        function() {
            var input_name = document.getElementById("exportFileName").value;
            if ( input_name == ""){
                var filename = "ICD 9 Tree";
            }
            else {
                var filename = input_name;
            }
            var tutorial_active = document.getElementById("tutorial-container").style.display;
            if (tutorial_active != "none" && tutorial_active != "") {
                saveSvgAsPng(document.getElementById("icd9tutorial"), "ICD9-Tree_tutorial.png", {scale: 4.0, backgroundColor: 'white'});
            }
            else {
                saveSvgAsPng(document.getElementById("icd9tree"), filename + ".png", {scale: 4.0, backgroundColor: 'white'});
            }
        });
    }


export function export_init() {
    setExportButton();
}