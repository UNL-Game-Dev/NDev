/**
 * Applies a hazard response, such that the entity will be notified upon
 * collision with hazardous objects.
 */
Crafty.c("HazardResponse", {
    init:
        function() {
            this.bind("EvaluateHits", function() {
                this.x = this._phX;
                this.y = this._phY;
                var hits = this.hit("Hazard");
                for(var i in hits) {
                    var hit = hits[i];
                    this.trigger("Hurt", hit);
                }
            });
        }
});
