import { circleSize } from "./circles.js"

export function linkWidth(d, con) {
    var sourceSize = circleSize(d.source, con),
    targetSize = circleSize(d.target, con),
    width = Math.min.apply(null, [sourceSize, targetSize]);
    if (width < 1) {
        width = 1;
    }
    return width;
}