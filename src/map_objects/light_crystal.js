/**
 * A light crystal that can bend light.
 */
Crafty.c("LightCrystal", {
    init: function () {
        this.requires("2D, DOM, lightCrystal, Collision")
            .collision(new Crafty.polygon([
                [this.w * 0.375, this.h * 0.000],
                [this.w * 0.625, this.h * 0.000],
                [this.w * 0.625, this.h * 1.000],
                [this.w * 0.375, this.h * 1.000]
            ]));
        this.attr({
                _outgoingBeam: Crafty.e("LightBeam").attr({
                    x: object.x,
                    y: object.y - this.h,
                    rotation: this.rotation + 180
                })
            })
            .attach(this._outgoingBeam);
    },

    turnOn:
    function() {
        this._outgoingBeam.turnOn();
    },

    turnOff:
    function() {
        this._outgoingBeam.turnOff();
    }
});
