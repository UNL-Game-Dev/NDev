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
    },

    turnOn:
    function() {
        this._outgoingBeam.turnOn();
    },git comm

    turnOff:
    function() {
        this._outgoingBeam.turnOff();
    }
});
