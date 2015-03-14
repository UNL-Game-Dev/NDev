Crafty.c("Pickup", {
    init:
        function() {
            var clock = Crafty("Clock");
            this.requires("2D, Canvas, Collision");

            this.onHit("Player", function() {
                if(this._pickup) {
                    Crafty("PickupState").addPickup(this._pickup);
                    this.destroy();
                }
            });

            this.bind("EnterFrame", function() {
                this.y = Math.round(this._origY + Math.sin(clock.time * 4) * 4);
            });
        },

    mapObjectInit:
        function(object) {
            this.x = object.x;
            this.y = this._origY = object.y;
            if(object.gid) {
                this.addComponent("Tile" + object.gid);
                this._origY = this.y -= this.h;
            }
            this._pickup = object.properties.pickup;
        }
});
