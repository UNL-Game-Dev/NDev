/**
 * Applies a platform constraint on the entity, such that the entity lying on
 * the platform will move with it.
 */
Crafty.c("PlatformConstraint", {
    init:
        function() {
            this.requires("TileConstraint");
            this.bind("ResolveConstraint", function() {
                this.x = this._phX;
                this.y = this._phY;
                this.y++;
                var hit = this.hitTile("MovingPlatform");
                this.y--;
                if(hit) {
                    var platform = hit.obj;
                    this._phX += platform.getDX();
                    this._phY += platform.getDY();

                    this._override = true;
                    this._overrideX = platform._phX
                    + Math.round(this._phX - platform._phX);
                    this._overrideY = platform._phY
                    + Math.round(this._phY - platform._phY);
                }
            });
        }
});
