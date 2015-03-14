/**
 * A path with a list of vertices.
 * Base usage: x,y, name, polyline OR polygon
 *     If the path object is a polyline, the platform will animate back and
 *         forth across the path.
 *     If the path object is a polygon, the platform will animate cyclically
 *         around the path.
 * Properties:
 *     time (optional)
 *         Either a single number specifying the entire path's period in seconds
 *             (uniform speed), or a list of numbers giving the duration of
 *             movement along each path segment.
 *         If not given, the platform will move with a uniform default speed
 *             around the path.
 *         If the path is a polyline, you can specify segment durations in one
 *             direction, in which case the duration will be the same forwards
 *             and backwards. Alternatively, you can specify different durations
 *             going in each direction, going from beginning to end back to
 *             beginning.
 */
Crafty.c("MapPath", {
    _defaultSpeed: 50.0,

    init:
        function() {
            this.requires("2D");
        },

    mapObjectInit:
        function(object) {
            this.x = object.x;
            this.y = object.y;
            this.name = object.name;
            // Get the cyclic polygon path if it exists, otherwise use the polyline
            // path back-and-forth.
            var vertices = object.polygon;
            if(!vertices) {
                var backVertices = object.polyline.slice(1, -1).reverse();
                vertices = object.polyline.concat(backVertices);
            }
            this.vertices = vertices;
            this.pathType = object.polygon ? "polygon" : "polyline";

            // Set the duration of each segment.
            var time, durations = [];
            if(object.properties && object.properties.time != undefined) {
                time = $.parseJSON(object.properties.time);
            }
            // Check whether a list of durations or a single duration was given.
            if(typeof time == typeof []) {
                // Set path segment durations to the list given.
                durations = time;

                if(this.pathType === "polyline") {
                    // If durations are only given going in one direction,
                    // assign those durations in the opposite direction as well.
                    var numSegments = object.polyline.length - 1;
                    for(var i = 0; i < numSegments; i++) {
                        var j = numSegments * 2 - 1 - i;
                        if(durations[j] == undefined) {
                            durations[j] =  durations[i];
                        }
                    }
                }
            } else {
                // Calculate the duration of each segment.
                // Use the segment lengths.
                var totalLength = 0;
                var segmentLengths = [];
                for(var i in vertices) {
                    var j = (Number(i) + 1) % vertices.length;
                    var vi = vertices[i], vj = vertices[j];
                    var length = dist(sub([vi.x, vi.y], [vj.x, vj.y]));
                    totalLength += length;
                    segmentLengths[i] = length;
                }
                if(typeof time == typeof 0) {
                    // Set duration of each segment based on the total time and
                    // segment lengths.
                    for(var i in segmentLengths) {
                        durations[i] = time * segmentLengths[i] / totalLength;
                    }
                } else {
                    // Set duration of each segment based on the default speed.
                    for(var i in segmentLengths) {
                        durations[i] = segmentLengths[i] / this._defaultSpeed;
                    }
                }
            }
            this.segmentDurations = durations;
            Crafty.trigger("PathCreated", this);
        }
});
