/**
 * Crafty component for being affected by basic tile collision response.
 *
 * This component only evaluates acceleration--other components need to be added
 * for traditional realistic collision response.
 *
 * _phX/Y is the next position of the physical object. This can be set to a
 *        offset from previous position to set velocity or increased from its
 *        current value to accelerate.
 *
 * _phPX/PY is the previous position of the physical object. This can be used
 *          as a basis for setting a new velocity.
 *
 * _phAX/AY can be used to set an acceleration that will be applied upon the
 *          next call to EvaluateAccel. Since this is a platformer, realistic
 *          accelerations probably won't be much use.
 */
Crafty.c("Physical", {

    init:
        function() {
            this._phX = this._x;
            this._phY = this._y;
            this._phPX = this._phX;
            this._phPY = this._phY;
            this._phAX = 0.0;
            this._phAY = 0.0;

            this.bind("EvaluateAccel", function() {
                // Seconds per frame.
                var sPerF = 1.0 / Crafty.timer.FPS();
                // Apply acceleration to velocity. Since velocity is stored as the
                // difference between the prev frame and the next, apply as
                // p += a * t^2
                this._phX += this._phAX * sPerF * sPerF;
                this._phY += this._phAY * sPerF * sPerF;
                this._phAX = 0.0;
                this._phAY = 0.0;
            });
        },

    setPhysPos:
        function(x, y) {
            this._phX = x;
            this._phY = y;
            this._phPX = x;
            this._phPY = y;

            return this;
        },

    getDX:
        function() {
            return this._phX - this._phPX;
        },

    getDY:
        function() {
            return this._phY - this._phPY;
        },

    getDisplacement:
        function() {
            return [this.getDX(), this.getDY()];
        },

    applyImpulse:
        function(px, py) {
            // Only apply impulse to free bodies.
            if(!this.has("Fixed")) {
                this._phX += px;
                this._phY += py;
            }
            // Notify component of impulse.
            this.trigger("Impulse", [px, py]);
        }
});
