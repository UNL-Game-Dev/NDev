/**
 * A player spawn point. If a player doesn't already exist in the map, spawns
 * one here. (The only reason this doesn't turn itself into the player itself
 * is that the player might have come from another map!)
 * Base usage: x,y
 * Properties: none
 */
Crafty.c("PlayerSpawn", {
    init:
        function() {
            this.requires("2D");
        },

    mapObjectInit:
        function(object) {
            this.x = object.x;
            this.y = object.y;

            this.bind("SpawnPlayer", function() {
                var player = Crafty.e("Player");
                player.setPhysPos(this.x, this.y);
            });
        }
});
