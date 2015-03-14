/**
 * A simple physics graphic updater. Updates the entity's x and y coordinates to
 * match the physics coordinates after each physics tick.
 */
Crafty.c("DefaultPhysicsDraw", {
    init:
        function() {
            this.bind("UpdateCollisions", function() {
                this.x = this._phPX;
                this.y = this._phPY;
            });
            this.bind("UpdateDraw", function() {
                if(this._override) {
                    this._override = false;
                    this.x = Math.round(this._overrideX);
                    this.y = Math.round(this._overrideY);
                } else {
                    this.x = Math.round(this._phPX);
                    this.y = Math.round(this._phPY);
                }
            });
        }
});
