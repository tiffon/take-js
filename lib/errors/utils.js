"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.configErrorProto = configErrorProto;
function configErrorProto(ctor, name) {
    ctor.prototype = Object.create(Error.prototype);
    ctor.prototype.constructor = ctor;
    ctor.prototype.name = name;
}