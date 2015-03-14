Crafty.c("MapSaveZone", {
    init:
        function() {
            this.requires("2D")
                .requires("SaveZone");
        },

    mapObjectInit:
        function(object) {
            this.x = object.x;
            this.y = object.y;
            this.w = object.width;
            this.h = object.height;
            // Set up the bounding box.
            this.collision();
        }
});
