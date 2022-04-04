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
define(["require", "exports", "./BaseRobot", "jquery", "util", "simulation.math", "simulation.simulation", "./robot.sensors"], function (require, exports, BaseRobot_1, $, UTIL, SIMATH, simulation_simulation_1, robot_sensors_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseMobileRobot = exports.Pose = void 0;
    var Pose = /** @class */ (function () {
        function Pose(x, y, theta) {
            this.x = x;
            this.xOld = x;
            this.y = y;
            this.yOld = y;
            this.theta = theta || 0;
        }
        Object.defineProperty(Pose.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this.xOld = this._x;
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
                this.yOld = this._y;
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
        Pose.prototype.getThetaInDegree = function () {
            return this._theta * (180 / Math.PI);
        };
        return Pose;
    }());
    exports.Pose = Pose;
    var BaseMobileRobot = /** @class */ (function (_super) {
        __extends(BaseMobileRobot, _super);
        function BaseMobileRobot(id, configuration, interpreter, savedName, mySelectionListener) {
            var _this = _super.call(this, id, configuration, interpreter, savedName, mySelectionListener) || this;
            _this._hasTrail = false;
            _this._thetaDiff = 0;
            _this.isDown = false;
            _this.mouse = {
                x: -5,
                y: 0,
                rx: 0,
                ry: 0,
                r: 30,
            };
            _this.mobile = true;
            _this.pose = new Pose(150, 150, 0);
            _this.initialPose = new Pose(150, 150, 0);
            return _this;
        }
        Object.defineProperty(BaseMobileRobot.prototype, "hasTrail", {
            get: function () {
                return this._hasTrail;
            },
            set: function (value) {
                this._hasTrail = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BaseMobileRobot.prototype, "pose", {
            get: function () {
                return this._pose;
            },
            set: function (value) {
                this._pose = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BaseMobileRobot.prototype, "initialPose", {
            get: function () {
                return this._initialPose;
            },
            set: function (value) {
                this._initialPose = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BaseMobileRobot.prototype, "thetaDiff", {
            get: function () {
                return this._thetaDiff;
            },
            set: function (value) {
                this._thetaDiff = value;
            },
            enumerable: false,
            configurable: true
        });
        BaseMobileRobot.prototype.handleKeyEvent = function (e) {
            if (this.selected) {
                e.stopImmediatePropagation();
                var keyName = e.key;
                switch (keyName) {
                    case 'ArrowUp':
                        this.pose.x += Math.cos(this.pose.theta);
                        this.pose.y += Math.sin(this.pose.theta);
                        e.preventDefault();
                        e.stopPropagation();
                        break;
                    case 'ArrowLeft':
                        var angleLeft_1 = Math.PI / 180;
                        this.pose.theta -= angleLeft_1;
                        Object.keys(this)
                            .filter(function (x) { return x instanceof robot_sensors_1.GyroSensor; })
                            .forEach(function (gyro) { return (gyro.angleValue -= SIMATH.toDegree(angleLeft_1)); });
                        e.preventDefault();
                        e.stopPropagation();
                        break;
                    case 'ArrowDown':
                        this.pose.x -= Math.cos(this.pose.theta);
                        this.pose.y -= Math.sin(this.pose.theta);
                        e.preventDefault();
                        e.stopPropagation();
                        break;
                    case 'ArrowRight':
                        var angleRight_1 = Math.PI / 180;
                        this.pose.theta += angleRight_1;
                        Object.keys(this)
                            .filter(function (x) { return x instanceof robot_sensors_1.GyroSensor; })
                            .forEach(function (gyro) { return (gyro.angleValue += SIMATH.toDegree(angleRight_1)); });
                        e.preventDefault();
                        e.stopPropagation();
                        break;
                    default:
                        break;
                }
                this.initialPose = new Pose(this.pose.x, this.pose.y, this.pose.theta);
            }
        };
        BaseMobileRobot.prototype.handleMouseDown = function (e) {
            //e.preventDefault();
            SIMATH.transform(this.pose, this.mouse);
            if (e && !e.startX) {
                UTIL.extendMouseEvent(e, simulation_simulation_1.Simulation.Instance.scale, $('#robotLayer'));
            }
            var myEvent = e;
            var dx = myEvent.startX - this.mouse.rx;
            var dy = myEvent.startY - this.mouse.ry;
            this.isDown = dx * dx + dy * dy < this.mouse.r * this.mouse.r;
            if (this.isDown) {
                e.stopImmediatePropagation();
                $('#robotLayer').css('cursor', 'pointer');
                if (!this.selected) {
                    //$('#brick' + robotIndex).hide();
                    this.selected = true;
                }
            }
        };
        BaseMobileRobot.prototype.handleMouseMove = function (e) {
            //e.preventDefault();
            SIMATH.transform(this.pose, this.mouse);
            if (e && !e.startX) {
                this.extendMouseEvent(e);
            }
            var myEvent = e;
            //$('#robotLayer').css('cursor', 'default');
            var dx = myEvent.startX - this.mouse.rx;
            var dy = myEvent.startY - this.mouse.ry;
            var onMe = dx * dx + dy * dy < this.mouse.r * this.mouse.r;
            if (onMe) {
                $('#robotLayer').css('cursor', 'pointer');
                $('#robotLayer').data('hovered', true);
                if (this.selected) {
                    e.stopImmediatePropagation();
                }
            }
            if (this.isDown && this.selected) {
                this.pose.xOld = this.pose.x;
                this.pose.yOld = this.pose.y;
                this.pose.x += dx;
                this.pose.y += dy;
                this.mouse.rx += dx;
                this.mouse.ry += dy;
                this.chassis.transformNewPose(this.pose, this.chassis);
                this.initialPose = new Pose(this.pose.x, this.pose.y, this.pose.theta);
            }
        };
        BaseMobileRobot.prototype.handleMouseOutUp = function (e) {
            if (this.isDown) {
                $('#robotLayer').css('cursor', 'auto');
                e.stopImmediatePropagation();
                this.isDown = false;
            }
        };
        BaseMobileRobot.prototype.handleNewSelection = function (who) {
            if (this.selected) {
                if (who !== this) {
                    this.selected = false;
                    this.isDown = false;
                    $('#brick' + this.id).hide();
                    if ($('#robotIndex')[0]) {
                        $('#robotIndex')[0][this.id]._selected = false;
                    }
                }
                else {
                    $('#brick' + this.id).show();
                    if ($('#robotIndex')[0]) {
                        $('#robotIndex')[0][this.id]._selected = true;
                    }
                }
            }
        };
        BaseMobileRobot.prototype.resetPose = function () {
            this.pose = new Pose(this.initialPose.x, this.initialPose.y, this.initialPose.theta);
        };
        BaseMobileRobot.prototype.drawTrail = function (dCtx, udCtx, width, color) {
            if (this.hasTrail) {
                dCtx.beginPath();
                dCtx.lineCap = 'round';
                dCtx.lineWidth = width;
                dCtx.strokeStyle = color;
                dCtx.moveTo(this.pose.xOld, this.pose.yOld);
                dCtx.lineTo(this.pose.x, this.pose.y);
                dCtx.stroke();
                udCtx.beginPath();
                udCtx.lineCap = 'round';
                udCtx.lineWidth = width;
                udCtx.strokeStyle = color;
                udCtx.moveTo(this.pose.xOld, this.pose.yOld);
                udCtx.lineTo(this.pose.x, this.pose.y);
                udCtx.stroke();
                this.pose.xOld = this.pose.x;
                this.pose.yOld = this.pose.y;
            }
        };
        return BaseMobileRobot;
    }(BaseRobot_1.BaseRobot));
    exports.BaseMobileRobot = BaseMobileRobot;
});
