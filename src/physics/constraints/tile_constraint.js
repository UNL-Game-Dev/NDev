/**
 * Applies a simple tile constraint on the attached physical entity, forcing it
 * to remain outside of tiles.
 */
Crafty.c("TileConstraint", {
    init:
        function() {
            this.requires("Physical, Collision");

            this._minCrushAngle = 157.5;
            this._minCrushOverlap = 2.5;

            this.currentHits = [];

            // Tracks phaseable component that this is in the process of dropping through
            this._phaseableInProgress;

            // Boolean set to true when object wants to phase through a phaseable beneath it
            this.attemptPhase = false;

            this.bind("ResolveConstraint", function() {
                this.currentHits = [];
                /*
                 * Try 20 times, since there could only possibly be 20 tiles next
                 * to you at once, right?
                 * This may remain, since Crafty doesn't provide a way to test
                 * against a single entity. (And this collision lookup IS optimized
                 * with a spatial map.)
                 * Collisions can't simply be looped through, since when the player
                 * overlaps two tiles, both emit a collision! This results in double
                 * the force required being applied, making things bounce. No good.
                 */
                var prevX = this._phX, prevY = this._phY;
                for(var i = 20; i >= 0; --i) {
                    this.x = this._phX;
                    this.y = this._phY;
                    // Find the first hit, process that.
                    var hit = this.hitTile();

                    if(!hit)
                        break;

                    // Just resolve it lazily, yay verlet integration.
                    var norm = [hit.normal.x, hit.normal.y];
                    var overlap = scale(norm, -hit.overlap);

                    this._phX += overlap[0];
                    this._phY += overlap[1];

                    // Maintain a "current hits" list in case other components
                    // (such as platforming physics) are interested.
                    this.currentHits.push(hit);
                }

                // If object is in the process of phasing through an object,
                // check if they're all the way through
                if (this._phaseableInProgress) {
                    var hits = this.hit("Tile");

                    var stillPhasing = false;
                    for(var j in hits) {
                        var hit = hits[j];
                        var ob = hit.obj;
                        // If object hits the phaseable we are probably still phasing
                        // (unless we are in contact with a phaseable and non-phaseable
                        // as checked below)
                        if (this._phaseableInProgress === ob) {
                            stillPhasing = true;
                            break;
                        }
                    }
                    if (!stillPhasing) {
                        // no longer phasing cancel effect
                        this._phaseableInProgress = null;
                    } else {
                        // This catches the case that we are halfway between a phaseable and
                        // non-phaseable tile, in which case the phase needs to be cancelled
                        // or else the object could drop through the phaseable platform after
                        // moving onto it long after the double-press
                        if (this.hitNormal([0,-1])) {
                            // Another non-phaseable tile is keeping us from phasing
                            // Cancel the phase.
                            this._phaseableInProgress = null;
                        }
                    }
                }

                // Check if object is being crushed, and fire event to notify.
                var currentNormals = [];
                _(this.currentHits).each(function(hit) {
                    if(hit.overlap < -this._minCrushOverlap) {
                        currentNormals.push(hit.normal);
                    }
                }, this);
                if(this._vectorsWithAngle(currentNormals, this._minCrushAngle)) {
                    this.trigger("Crush");
                }
            });
        },

    /**
     * Check for valid collision with tile.
     * Parameters:
     *     component: string (optional) - component to check for, in addition to
     *         Tile component
     *     sensor: object (optional) - alternate object to use as a sensor
     * Returns hit info if there was a collision, false otherwise.
     * Examples:
     *  // check for hits against Tiles with the Wood component
     *  hitTile("Wood")
     *  // check for hits against Tiles with the object sensor1
     *  hitTile(sensor1)
     *  // checks for hits against Tiles with the Wood component with the object
     *  // sensor1
     *  hitTile("Wood", sensor1)
     */
    hitTile:
        function() {
            var sensor = this;
            var component = null;
            if(arguments.length === 1) {
                if(typeof arguments[0] === "string") {
                    component = arguments[0];
                } else {
                    sensor = arguments[0];
                }
            } else if(arguments.length === 2) {
                component = arguments[0];
                sensor = arguments[1];
            }
            var hits = sensor.hit("Tile");
            for(var j in hits) {
                var hit = hits[j];
                var ob = hit.obj;

                // Don't register collision with itself.
                if(ob === this) {
                    continue;
                }

                // If we're phasing through the tile, don't register hit
                if (this._phaseableInProgress === ob) {
                    continue;
                }

                // If we're filtering by component and this tile doesn't have it, don't register hit
                if (component && !ob.has(component)) {
                    continue;
                }

                // If phaseable tile and object is attempting phase, don't register hit
                if (ob.has("Phaseable") && this.attemptPhase) {
                    if (ob.has("Platform")) {
                        this._phX += ob.getDX()*2;
                        this._phY += ob.getDY()*2;
                    }
                    this._phaseableInProgress = ob;
                    continue;
                }

                // If object is going up through one-way, don't register hit
                if(ob.has("OneWay")) {
                    var norm = hit.normal;
                    var overlap = scale([norm.x, norm.y], -hit.overlap);
                    var prevDisplacement = this.getDisplacement();
                    if(!this._oneWayCollides(overlap, prevDisplacement)) {
                        continue;
                    }
                }

                return hit;
            }
            this.attemptPhase = false;
            return false;
        },

    /**
     * Check for collision with a given normal. Returns the first object hit
     * that has the given component, with a dot product with the given normal
     * above a threshold.
     */
    hitNormal:
        function(targetNorm, component, threshold) {
            // Threshold defaults to 0.
            threshold = threshold || 0;

            // Search through all hits for the desired normal.
            for(var i = this.currentHits.length - 1; i >= 0; --i) {
                var hit = this.currentHits[i];
                var norm = [hit.normal.x, hit.normal.y];
                if(dot(norm, targetNorm) > threshold) {
                    var ob = hit.obj;
                    if(!component) {
                        return ob;
                    }

                    if(ob.has(component)) {
                        return ob;
                    }
                }
            }

            return false;
        },

    hitEntity:
        function(ent) {
            var id = ent[0];
            return _(this.currentHits).any(function(hit) {
                return hit.obj[0] === id;
            });
        },

    _oneWayCollides:
        function(overlap, prevDisplacement) {
            return -overlap[1] >= Math.abs(overlap[0])
                && dot(overlap, add(overlap, prevDisplacement)) <= 1.0;
        },

    /**
     * Check to see if there exists a pair of vectors in a set of vectors
     * whose angle is greater than the given threshold.
     */
    _vectorsWithAngle:
        function(vectors, threshold) {
            // TODO: Please fix if there is a more efficient (better than
            // n^2) way of doing this.
            var dotThreshold = Math.cos(threshold * Math.PI / 180);
            for(var i = 0; i < vectors.length - 1; i++) {
                for(var j = i + 1; j < vectors.length; j++) {
                    var v1 = vecToList(vectors[i]);
                    var v2 = vecToList(vectors[j]);
                    if(dot(v1, v2) < dotThreshold) {
                        return true;
                    }
                }
            }
            return false;
        }
});
