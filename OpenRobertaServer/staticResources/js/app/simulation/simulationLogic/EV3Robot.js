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
define(["require", "exports", "./BaseMobileRobot", "robot.sensors", "./robot.actuators"], function (require, exports, BaseMobileRobot_1, robot_sensors_1, robot_actuators_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var EV3Robot = /** @class */ (function (_super) {
        __extends(EV3Robot, _super);
        function EV3Robot(id, configuration, interpreter, savedName, myListener) {
            var _this = _super.call(this, id, configuration, interpreter, savedName, myListener) || this;
            _this.led = new robot_actuators_1.Led();
            _this.volume = 50;
            _this.tts = new robot_actuators_1.TTS();
            _this.webAudio = new robot_actuators_1.WebAudio();
            _this.timer = new robot_sensors_1.Timer(5);
            _this.chassis = new robot_actuators_1.EV3Chassis(_this.id, configuration, _this.pose);
            _this.configure(configuration['SENSORS']);
            return _this;
            //M.display(M.maze(8, 8));
        }
        EV3Robot.prototype.updateActions = function (robot, dt, interpreterRunning) {
            _super.prototype.updateActions.call(this, robot, dt, interpreterRunning);
            var volume = this.interpreter.getRobotBehaviour().getActionState('volume', true);
            if (volume || volume === 0) {
                this.volume = volume / 100.0;
            }
        };
        EV3Robot.prototype.reset = function () {
            _super.prototype.reset.call(this);
            this.volume = 50;
        };
        // this method might go up to BaseMobileRobots as soon as the configuration has detailed information about the sensors geometry and location on the robot
        EV3Robot.prototype.configure = function (sensors) {
            var _loop_1 = function (c) {
                switch (sensors[c]) {
                    case 'TOUCH':
                        // only one is drawable as bumper
                        this_1[c] = new robot_sensors_1.TouchSensor(c, 25, 0, this_1.chassis.geom.color);
                        break;
                    case 'GYRO':
                        // only one is usable
                        this_1[c] = new robot_sensors_1.GyroSensor(c, 0, 0, 0);
                        break;
                    case 'COLOR':
                        var myColorSensors_1 = [];
                        var ev3_1 = this_1;
                        Object.keys(this_1).forEach(function (x) {
                            if (ev3_1[x] && ev3_1[x] instanceof robot_sensors_1.ColorSensor) {
                                myColorSensors_1.push(ev3_1[x]);
                            }
                        });
                        var ord = myColorSensors_1.length + 1;
                        var id = Object.keys(sensors).filter(function (type) { return sensors[type] == 'COLOR'; }).length;
                        var y = ord * 10 - 5 * (id + 1);
                        this_1[c] = new robot_sensors_1.ColorSensor(c, 15, y, 0, 5, 'Color Sensor');
                        break;
                    case 'ULTRASONIC': {
                        var myUltraSensors_1 = [];
                        var ev3_2 = this_1;
                        Object.keys(this_1).forEach(function (x) {
                            if (ev3_2[x] && ev3_2[x] instanceof robot_sensors_1.DistanceSensor) {
                                myUltraSensors_1.push(ev3_2[x]);
                            }
                        });
                        var ord_1 = myUltraSensors_1.length + 1;
                        var num = Object.keys(sensors).filter(function (type) { return sensors[type] == 'ULTRASONIC'; }).length;
                        var position = new BaseMobileRobot_1.Pose(this_1.chassis.geom.h / 2, 0, 0);
                        if (num == 3) {
                            if (ord_1 == 1) {
                                position = new BaseMobileRobot_1.Pose(this_1.chassis.geom.h / 2, -this_1.chassis.geom.h / 2, -Math.PI / 4);
                            }
                            else if (ord_1 == 2) {
                                position = new BaseMobileRobot_1.Pose(this_1.chassis.geom.h / 2, this_1.chassis.geom.h / 2, Math.PI / 4);
                            }
                        }
                        else if (num % 2 === 0) {
                            switch (ord_1) {
                                case 0:
                                    position = new BaseMobileRobot_1.Pose(this_1.chassis.geom.h / 2, -this_1.chassis.geom.h / 2, -Math.PI / 4);
                                    break;
                                case 1:
                                    position = new BaseMobileRobot_1.Pose(this_1.chassis.geom.h / 2, this_1.chassis.geom.h / 2, Math.PI / 4);
                                    break;
                                case 2:
                                    position = new BaseMobileRobot_1.Pose(this_1.chassis.geom.x, -this_1.chassis.geom.h / 2, (-3 * Math.PI) / 4);
                                    break;
                                case 3:
                                    position = new BaseMobileRobot_1.Pose(this_1.chassis.geom.x, this_1.chassis.geom.h / 2, (3 * Math.PI) / 4);
                                    break;
                            }
                        }
                        this_1[c] = new robot_sensors_1.DistanceSensor(c, position.x, position.y, position.theta, 255, 'Ultra Sensor');
                        break;
                    }
                    case 'INFRARED': {
                        var myInfraSensors_1 = [];
                        var ev3_3 = this_1;
                        Object.keys(this_1).forEach(function (x) {
                            if (ev3_3[x] && ev3_3[x] instanceof robot_sensors_1.DistanceSensor) {
                                myInfraSensors_1.push(ev3_3[x]);
                            }
                        });
                        var ord_2 = myInfraSensors_1.length + 1;
                        var num = Object.keys(sensors).filter(function (type) { return sensors[type] == 'INFRARED'; }).length;
                        var position = new BaseMobileRobot_1.Pose(this_1.chassis.geom.h / 2, 0, 0);
                        if (num == 3) {
                            if (ord_2 == 1) {
                                position = new BaseMobileRobot_1.Pose(this_1.chassis.geom.h / 2, -this_1.chassis.geom.h / 2, -Math.PI / 4);
                            }
                            else if (ord_2 == 2) {
                                position = new BaseMobileRobot_1.Pose(this_1.chassis.geom.h / 2, this_1.chassis.geom.h / 2, Math.PI / 4);
                            }
                        }
                        else if (num % 2 === 0) {
                            switch (ord_2) {
                                case 0:
                                    position = new BaseMobileRobot_1.Pose(this_1.chassis.geom.h / 2, -this_1.chassis.geom.h / 2, -Math.PI / 4);
                                    break;
                                case 1:
                                    position = new BaseMobileRobot_1.Pose(this_1.chassis.geom.h / 2, this_1.chassis.geom.h / 2, Math.PI / 4);
                                    break;
                                case 2:
                                    position = new BaseMobileRobot_1.Pose(this_1.chassis.geom.x, -this_1.chassis.geom.h / 2, (-3 * Math.PI) / 4);
                                    break;
                                case 3:
                                    position = new BaseMobileRobot_1.Pose(this_1.chassis.geom.x, this_1.chassis.geom.h / 2, (3 * Math.PI) / 4);
                                    break;
                            }
                        }
                        this_1[c] = new robot_sensors_1.DistanceSensor(c, position.x, position.y, position.theta, 70, 'IR Sensor');
                        break;
                    }
                }
            };
            var this_1 = this;
            for (var c in sensors) {
                _loop_1(c);
            }
        };
        EV3Robot.colorRange = ['#000000', '#0056a6', '#00642f', '#532115', '#585858', '#b30006', '#f7e307'];
        return EV3Robot;
    }(BaseMobileRobot_1.BaseMobileRobot));
    exports.default = EV3Robot;
});
