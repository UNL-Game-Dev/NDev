/**
 * A platform that moves along a specified path.
 * Base usage: gid, name
 * Properties: path
 */
Crafty.c("MovingPlatform", {
    init:
        function() {
            this.requires("2D, Canvas, Tween, Physical, Collision, Tile,"
            + "FakeInertia, DefaultPhysicsDraw, Platform");
        },

    mapObjectInit:
        function(object) {
            // Give it the right tile sprite.
            if(object.gid) {
                this.gid = object.gid;
                this.addComponent("Tile" + object.gid);
            }
            this.setPhysPos(object.x, object.y);
            this._name = object.name;
            this._pathName = object.properties.path;
            this._destVertIndex = 0;

            // See if path exists yet, or attach it when it exists.
            var paths = Crafty("MapPath");
            for(var i in paths) {
                var path = Crafty(paths[i]);
                if(path.name === this._pathName) {
                    this.path = path;
                    this._advance();
                    break;
                }
            }
            if(!this.path) {
                this.bind("PathCreated", function(path) {
                    if(path.name === this._pathName) {
                        this.unbind("PathCreated");
                        this.path = path;
                        this._advance();
                    }
                });
            }
        },

    /*
     * Move the platform along the next segment.
     */
    _advance:
        function() {
            var path = this.path;
            var pathVertices = path.vertices;
            var durations = path.segmentDurations;

            // Get the duration of this segment, in milliseconds.
            var time = durations[this._destVertIndex] * 1000;

            // Get the path's start and end vertices.
            var pos1 = pathVertices[this._destVertIndex];
            this._destVertIndex = (this._destVertIndex + 1) % pathVertices.length;
            var pos2 = pathVertices[this._destVertIndex];

            // Start at the beginning vertex.
            this.attr({ _phX: pos1.x + path.x, _phY: pos1.y + path.y })
                // Move to the destination.
                .tween({ _phX: pos2.x + path.x, _phY: pos2.y + path.y }, time)
                // Advance again when done.
                .timeout(this._advance, time);
        }
});