/**
 * Unstable platforms that collapse after being stood on for a certain period
 * of time.
 */
Crafty.c("Unstable", {

    init:
    function() {
        this
        // Base components
            .requires("2D")
            .requires("Collision")
            .requires("Tween")
            .requires("FakeInertia")
        // Attributes
            .attr({
                /**
                 * Number of frames an object must be in contact before unstable
                 * platform collapses
                 */
                collapseTime: 18
            });

        // Sensor for detecting objects resting on top.
        this._sensor = Crafty.e("2D");
        this._sensor.w = this.w;
        this._sensor.h = this.h;
        this._sensor.addComponent("Collision");

        // Time how long objects have been on top, in frames.
        this._contactFrames = 0;
        this.bind("EvaluateHits", function() {
            this._sensor.x = this.x;
            this._sensor.y = this.y - 1;
            if(this._sensor.hit("Player")) {
                this._contactFrames++;
                if(this._contactFrames >= this.collapseTime) {
                    this.collapse();
                }
            } else {
                this._contactFrames = 0;
            }
        });
    },

    collapse:
    function() {
        this
            .unbind("EvaluateHits")
            .attr({
                alpha: 1.0
            })
            .tween({
                alpha: 0.0,
                y: this.y + this.h
            }, 200)
            .timeout(function() {
                this.destroy();
            }, 200);
    }
});
