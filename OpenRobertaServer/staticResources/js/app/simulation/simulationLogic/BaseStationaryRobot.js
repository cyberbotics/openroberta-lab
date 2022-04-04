var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./BaseRobot"], function (require, exports, BaseRobot_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseStationaryRobot = void 0;
    var BaseStationaryRobot = /** @class */ (function (_super) {
        __extends(BaseStationaryRobot, _super);
        function BaseStationaryRobot(id, configuration, interpreter, name, mySelectionListener) {
            var _this = _super.call(this, id, configuration, interpreter, name, mySelectionListener) || this;
            _this.mobile = false;
            return _this;
        }
        return BaseStationaryRobot;
    }(BaseRobot_1.BaseRobot));
    exports.BaseStationaryRobot = BaseStationaryRobot;
});
