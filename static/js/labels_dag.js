
import { circleSize } from './circles_dag.js';

export function text_wrap(text, width) {

    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = .04,
            dy = 1,
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", 0)
                        //.attr("y", 0)
                        .attr("dy", (n) => { return circleSize(n) + 10 });
        
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.text().length > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                
                tspan = text.append("tspan")
                            .attr("x", 0)
                            //.attr("y", 0)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}