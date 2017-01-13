// @flow


export function configErrorProto(ctor: Object, name: string) {
    ctor.prototype = Object.create(Error.prototype);
    ctor.prototype.constructor = ctor;
    ctor.prototype.name = name;
}
