define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Pose = void 0;
    var Pose = /** @class */ (function () {
        function Pose(x, y, theta) {
            this.x = x;
            this.y = y;
            this.theta = theta || 0;
        }
        Object.defineProperty(Pose.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this._x = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Pose.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                this._y = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Pose.prototype, "theta", {
            get: function () {
                return this._theta;
            },
            set: function (value) {
                this._theta = (value + 2 * Math.PI) % (2 * Math.PI);
            },
            enumerable: false,
            configurable: true
        });
        Pose.prototype.translate = function (point) {
            var sin = Math.sin(this.theta);
            var cos = Math.cos(this.theta);
            point.rx = this.x - point.y * cos + point.x * sin;
            point.ry = this.y - point.y * sin - point.x * cos;
            return point;
        };
        return Pose;
    }());
    exports.Pose = Pose;
});
