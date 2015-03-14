/**
 * Constrains an entity to be within a certain distance of another entity.
 */
Crafty.c("DistanceConstraint", {
    init:
        function() {
            this.requires("2D, Physical");
            this._target = null;
            this._maxDistance = 0;
            this._myOffset = [0, 0];
            this._targetOffset = [0, 0];
            this._myOffsetEntity = this;

            this._myPos = [0, 0];
            this._targetPos = [0, 0];
            this._actualDistance = 0;

            this.bind("ResolveConstraint", this._resolveDistanceConstraint);
        },

    distanceConstraint:
        function(target, distance, myOffset, targetOffset, myOffsetEntity) {
            this._target = target || this._target;
            this._maxDistance = distance !== undefined
                ? distance
                : this._maxDistance;
            this._myOffset = myOffset || this._myOffset || [ 0, 0 ];
            this._targetOffset = targetOffset || this._targetOffset || [ 0, 0 ];
            this._myOffsetEntity = myOffsetEntity || this._myOffsetEntity || this;
        },

    getRelativePosition:
        function() {
            return sub(this._targetPos, this._myPos);
        },

    cancelDistanceConstraint:
        function() {
            this._target = null;
        },

    _resolveDistanceConstraint:
        function() {
            if(this._target) {
                this._myPos = evalVector(this._myOffset, this._myOffsetEntity || this);
                this._targetPos = evalVector(this._targetOffset, this._target);

                var offset = sub(this._targetPos, this._myPos);
                var distance = dist(offset);

                if(distance > this._maxDistance) {
                    var norm = normalized(offset);
                    var maxCorrection = 1;
                    var correctionAmount = Math.min(distance - this._maxDistance, maxCorrection);
                    var posOffset = scale(norm, correctionAmount);
                    this.applyImpulse(posOffset[0], posOffset[1]);
                    this._myPos = add(this._myPos, posOffset);
                    this._actualDistance = distance - correctionAmount;
                }
            }
        }
});

function debug(x, y) {
    var w = 2;
    if(_(x).isArray()) {
        y = x[1];
        x = x[0];
    }
    Crafty.e("2D, Canvas, Color").color("#ff00ff").attr({ x: x + w, y: y + w, w: 2 * w, h: 2 * w, z: 100 });
    Crafty.e("2D, Canvas, Color").color("#ff00ff").attr({ x: x - 3 * w, y: y + w, w: 2 * w, h: 2 * w, z: 100 });
    Crafty.e("2D, Canvas, Color").color("#ff00ff").attr({ x: x - 3 * w, y: y - 3 * w, w: 2 * w, h: 2 * w, z: 100 });
    Crafty.e("2D, Canvas, Color").color("#ff00ff").attr({ x: x + w, y: y - 3 * w, w: 2 * w, h: 2 * w, z: 100 });
}

/**
 * Intertia application, as per verlet integration. Kept separate in case
 * "special" objects need to be simulated. (Like player physics.)
 */
Crafty.c("Inertia", {
    init:
        function() {
            this.bind("EvaluateInertia", function() {
                var px = this._phPX;
                var py = this._phPY;
                this._phPX = this._phX;
                this._phPY = this._phY;
                this._phX += this._phX - px;
                this._phY += this._phY - py;
            });
        }
});

/**
 * "Fake" inertia that responds to movement of object but does not continue
 * movement, such as a moving platform.
 */
Crafty.c("FakeInertia", {
    init:
        function() {
            this.requires("Fixed")
                .bind("EvaluateInertia", function() {
                    this._phPX = this._phX;
                    this._phPY = this._phY;
                });
        }
});

/**
 * Ground friction.
 */
Crafty.c("GroundFriction", {
    init:
        function() {
            this.requires("Physical, TileConstraint, DefaultPhysicsDraw");

            this.bind("PrePhysicsTick", function() {
                if(this.hitNormal([0,-1], "Tile")) {
                    var vx = this._phX - this._phPX;
                    vx = floorToZero(vx / 2);
                    this._phX = this._phPX + vx;
                }
            });
        }
});
