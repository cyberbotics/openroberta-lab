define(["require", "exports", "./BaseMobileRobot", "interpreter.constants", "simulation.math", "util", "./robot.actuators", "./simulation.objects", "blockly"], function (require, exports, BaseMobileRobot_1, C, SIMATH, UTIL, robot_actuators_1, simulation_objects_1, Blockly) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GyroSensor = exports.ColorSensor = exports.TouchSensor = exports.DistanceSensor = exports.Timer = void 0;
    var Timer = /** @class */ (function () {
        function Timer(num) {
            this.color = '';
            this.theta = 0;
            this.x = 0;
            this.y = 0;
            this.labelPriority = 11;
            this.time = [];
            this.t = 0;
            for (var i = 0; i < num; i++) {
                this.time[i] = 0;
            }
        }
        Timer.prototype.getLabel = function () {
            var myLabels = '';
            for (var i = 0; i < this.time.length; i++) {
                myLabels +=
                    '<div><label>' + (i + 1) + ' ' + Blockly.Msg['SENSOR_TIMER'] + '</label><span>' + UTIL.round(this.time[i] * 1000, 0) + 'ms</span></div>';
            }
            return myLabels;
        };
        Timer.prototype.updateSensor = function (running, dt, myRobot, values, uCtx, udCtx, personalObstacleList) {
            values['timer'] = values['timer'] || [];
            for (var i = 0; i < this.time.length; i++) {
                values['timer'][i + 1] = this.time[i] * 1000;
            }
        };
        Timer.prototype.reset = function () {
            for (var num in this.time) {
                this.time[num] = 0;
            }
        };
        Timer.prototype.updateAction = function (myRobot, dt, interpreterRunning) {
            if (interpreterRunning) {
                for (var num in this.time) {
                    this.time[num] += dt;
                }
                var myBehaviour = myRobot.interpreter.getRobotBehaviour();
                var timer = myBehaviour.getActionState('timer', true);
                if (timer) {
                    for (var i = 1; i <= this.time.length; i++) {
                        if (timer[i] && timer[i] == 'reset') {
                            this.time[i - 1] = 0;
                        }
                    }
                }
            }
        };
        return Timer;
    }());
    exports.Timer = Timer;
    var DistanceSensor = /** @class */ (function () {
        function DistanceSensor(port, x, y, theta, maxDistance, color) {
            this.drawPriority = 5;
            this.color = '#FF69B4';
            this.rx = 0;
            this.ry = 0;
            this.distance = 0;
            this.u = [];
            this.cx = 0;
            this.cy = 0;
            this.wave = 0;
            this.port = port;
            this.labelPriority = Number(this.port.replace('ORT_', ''));
            this.x = x;
            this.y = y;
            this.theta = theta;
            this.maxDistance = maxDistance;
            this.maxLength = 3 * maxDistance;
            this.color = color || this.color;
        }
        DistanceSensor.prototype.draw = function (rCtx, myRobot) {
            rCtx.restore();
            rCtx.save();
            rCtx.lineDashOffset = C.WAVE_LENGTH - this.wave;
            rCtx.setLineDash([20, 40]);
            for (var i = 0; i < this.u.length; i++) {
                rCtx.beginPath();
                rCtx.lineWidth = 0.5;
                rCtx.strokeStyle = '#555555';
                rCtx.moveTo(this.rx, this.ry);
                rCtx.lineTo(this.u[i].x, this.u[i].y);
                rCtx.stroke();
            }
            if (this.cx && this.cy) {
                rCtx.beginPath();
                rCtx.lineWidth = 1;
                rCtx.strokeStyle = 'black';
                rCtx.moveTo(this.rx, this.ry);
                rCtx.lineTo(this.cx, this.cy);
                rCtx.stroke();
            }
            rCtx.rotate(myRobot.pose.theta);
            rCtx.beginPath();
            rCtx.fillStyle = '#555555';
            rCtx.fillText(String(this.port), this.x !== myRobot.chassis.geom.x ? 10 : -10, 4);
            rCtx.restore();
            rCtx.save();
            rCtx.translate(myRobot.pose.x, myRobot.pose.y);
            rCtx.rotate(myRobot.pose.theta);
        };
        DistanceSensor.prototype.updateSensor = function (running, dt, myRobot, values, uCtx, udCtx, personalObstacleList) {
            if (myRobot instanceof BaseMobileRobot_1.BaseMobileRobot) {
                var robot = myRobot;
                SIMATH.transform(robot.pose, this);
                values['ultrasonic'] = values['ultrasonic'] || {};
                values['infrared'] = values['infrared'] || {};
                values['ultrasonic'][this.port] = {};
                values['infrared'][this.port] = {};
                this.cx = null;
                this.cy = null;
                this.wave += C.WAVE_LENGTH * dt;
                this.wave %= C.WAVE_LENGTH;
                var u3 = {
                    x1: this.rx,
                    y1: this.ry,
                    x2: this.rx + this.maxLength * Math.cos(robot.pose.theta + this.theta),
                    y2: this.ry + this.maxLength * Math.sin(robot.pose.theta + this.theta),
                };
                var u1 = {
                    x1: this.rx,
                    y1: this.ry,
                    x2: this.rx + this.maxLength * Math.cos(robot.pose.theta - Math.PI / 8 + this.theta),
                    y2: this.ry + this.maxLength * Math.sin(robot.pose.theta - Math.PI / 8 + this.theta),
                };
                var u2 = {
                    x1: this.rx,
                    y1: this.ry,
                    x2: this.rx + this.maxLength * Math.cos(robot.pose.theta - Math.PI / 16 + this.theta),
                    y2: this.ry + this.maxLength * Math.sin(robot.pose.theta - Math.PI / 16 + this.theta),
                };
                var u5 = {
                    x1: this.rx,
                    y1: this.ry,
                    x2: this.rx + this.maxLength * Math.cos(robot.pose.theta + Math.PI / 8 + this.theta),
                    y2: this.ry + this.maxLength * Math.sin(robot.pose.theta + Math.PI / 8 + this.theta),
                };
                var u4 = {
                    x1: this.rx,
                    y1: this.ry,
                    x2: this.rx + this.maxLength * Math.cos(robot.pose.theta + Math.PI / 16 + this.theta),
                    y2: this.ry + this.maxLength * Math.sin(robot.pose.theta + Math.PI / 16 + this.theta),
                };
                var uA = [u1, u2, u3, u4, u5];
                this.distance = this.maxLength;
                var uDis = [this.maxLength, this.maxLength, this.maxLength, this.maxLength, this.maxLength];
                for (var i = 0; i < personalObstacleList.length; i++) {
                    var myObstacle = personalObstacleList[i];
                    if (myObstacle instanceof robot_actuators_1.ChassisDiffDrive && myObstacle.id == robot.id) {
                        continue;
                    }
                    if (!(myObstacle instanceof simulation_objects_1.CircleSimulationObject)) {
                        var obstacleLines = myObstacle.getLines();
                        for (var k = 0; k < obstacleLines.length; k++) {
                            for (var j = 0; j < uA.length; j++) {
                                var interPoint = SIMATH.getIntersectionPoint(uA[j], obstacleLines[k]);
                                this.checkShortestDistance(interPoint, uDis, j, uA[j]);
                            }
                        }
                    }
                    else {
                        for (var j = 0; j < uA.length; j++) {
                            var interPoint = SIMATH.getClosestIntersectionPointCircle(uA[j], personalObstacleList[i]);
                            this.checkShortestDistance(interPoint, uDis, j, uA[j]);
                        }
                    }
                }
                for (var i = 0; i < uA.length; i++) {
                    this.u[i] = { x: uA[i].x2, y: uA[i].y2 };
                }
                var distance = this.distance / 3.0;
                // adopt sim sensor to real sensor
                if (distance < this.maxDistance) {
                    values['ultrasonic'][this.port].distance = distance;
                }
                else {
                    values['ultrasonic'][this.port].distance = this.maxDistance;
                }
                values['ultrasonic'][this.port].presence = false;
                // treat the ultrasonic sensor as infrared sensor
                if (distance < 70) {
                    values['infrared'][this.port].distance = (100.0 / 70.0) * distance;
                }
                else {
                    values['infrared'][this.port].distance = 100.0;
                }
                values['infrared'][this.port].presence = false;
            }
        };
        DistanceSensor.prototype.checkShortestDistance = function (interPoint, uDis, j, uA) {
            if (interPoint) {
                var dis = Math.sqrt((interPoint.x - this.rx) * (interPoint.x - this.rx) + (interPoint.y - this.ry) * (interPoint.y - this.ry));
                if (dis < this.distance) {
                    this.distance = dis;
                    this.cx = interPoint.x;
                    this.cy = interPoint.y;
                }
                if (dis < uDis[j]) {
                    uDis[j] = dis;
                    uA.x2 = interPoint.x;
                    uA.y2 = interPoint.y;
                }
            }
        };
        DistanceSensor.prototype.getLabel = function () {
            return ('<div><label>' +
                this.port.replace('ORT_', '') +
                ' ' +
                Blockly.Msg['SENSOR_ULTRASONIC'] +
                '</label><span>' +
                UTIL.roundUltraSound(this.distance / 3.0, 0) +
                'cm</span></div>');
        };
        return DistanceSensor;
    }());
    exports.DistanceSensor = DistanceSensor;
    var TouchSensor = /** @class */ (function () {
        function TouchSensor(port, x, y, color) {
            this.drawPriority = 4;
            this.color = '#FF69B4';
            this.rx = 0;
            this.ry = 0;
            this.value = 0;
            this.port = port;
            this.labelPriority = Number(this.port.replace('ORT_', ''));
            this.x = x;
            this.y = y;
            this.color = color || this.color;
        }
        TouchSensor.prototype.draw = function (rCtx, myRobot) {
            rCtx.save();
            rCtx.shadowBlur = 5;
            rCtx.shadowColor = 'black';
            rCtx.fillStyle = myRobot.chassis.geom.color;
            if (this.value === 1) {
                rCtx.fillStyle = 'red';
            }
            else {
                rCtx.fillStyle = myRobot.chassis.geom.color;
            }
            rCtx.fillRect(myRobot.chassis.frontLeft.x - 3.5, myRobot.chassis.frontLeft.y, 3.5, -myRobot.chassis.frontLeft.y + myRobot.chassis.frontRight.y);
            rCtx.restore();
        };
        TouchSensor.prototype.updateSensor = function (running, dt, myRobot, values, uCtx, udCtx, personalObstacleList) {
            values['touch'] = values['touch'] || {};
            values['touch'][this.port] = this.value =
                myRobot.chassis.frontLeft.bumped ||
                    myRobot.chassis.frontRight.bumped ||
                    myRobot.chassis.frontMiddle.bumped
                    ? 1
                    : 0;
        };
        TouchSensor.prototype.getLabel = function () {
            return ('<div><label>' + this.port.replace('ORT_', '') + ' ' + Blockly.Msg['SENSOR_TOUCH'] + '</label><span>' + UTIL.round(this.value, 0) + '</span></div>');
        };
        return TouchSensor;
    }());
    exports.TouchSensor = TouchSensor;
    var ColorSensor = /** @class */ (function () {
        function ColorSensor(port, x, y, theta, r, color) {
            this.drawPriority = 6;
            this.rx = 0;
            this.ry = 0;
            this.color = 'grey';
            this.colorValue = C.COLOR_ENUM.NONE;
            this.lightValue = 0;
            this.rgb = [0, 0, 0];
            this.port = port;
            this.labelPriority = Number(this.port.replace('ORT_', ''));
            this.x = x;
            this.y = y;
            this.theta = theta;
            this.r = r;
            this.color = color || this.color;
        }
        ColorSensor.prototype.draw = function (rCtx, myRobot) {
            rCtx.save();
            rCtx.beginPath();
            rCtx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            rCtx.fillStyle = this.color;
            rCtx.fill();
            rCtx.strokeStyle = 'black';
            rCtx.stroke();
            rCtx.translate(this.x, this.y);
            rCtx.beginPath();
            rCtx.fillStyle = '#555555';
            rCtx.fillText(this.port, -12, 4);
            rCtx.restore();
        };
        ColorSensor.prototype.updateSensor = function (running, dt, myRobot, values, uCtx, udCtx) {
            values['color'] = values['color'] || {};
            values['light'] = values['light'] || {};
            values['color'][this.port] = {};
            values['light'][this.port] = {};
            SIMATH.transform(myRobot.pose, this);
            var red = 0;
            var green = 0;
            var blue = 0;
            var x = Math.round(this.rx - 3);
            var y = Math.round(this.ry - 3);
            try {
                var colors = uCtx.getImageData(x, y, 6, 6);
                var colorsD = udCtx.getImageData(x, y, 6, 6);
                for (var i = 0; i <= colors.data.length; i += 4) {
                    if (colorsD.data[i + 3] === 255) {
                        for (var j = i; j < i + 3; j++) {
                            colors.data[j] = colorsD.data[j];
                        }
                    }
                }
                var out = [0, 4, 16, 20, 24, 44, 92, 116, 120, 124, 136, 140]; // outside the circle
                for (var j = 0; j < colors.data.length; j += 24) {
                    for (var i = j; i < j + 24; i += 4) {
                        if (out.indexOf(i) < 0) {
                            red += colors.data[i];
                            green += colors.data[i + 1];
                            blue += colors.data[i + 2];
                        }
                    }
                }
                var num = colors.data.length / 4 - 12; // 12 are outside
                red /= num;
                green /= num;
                blue /= num;
                this.colorValue = SIMATH.getColor(SIMATH.rgbToHsv(red, green, blue));
                this.rgb = [UTIL.round(red, 0), UTIL.round(green, 0), UTIL.round(blue, 0)];
                if (this.colorValue === C.COLOR_ENUM.NONE) {
                    this.color = 'grey';
                }
                else {
                    this.color = this.colorValue.toString().toLowerCase();
                }
                this.lightValue = (red + green + blue) / 3 / 2.55;
            }
            catch (e) {
                // this might happen during change of background image and is ok, we return the last valid sensor values
            }
            values['color'][this.port].colorValue = this.colorValue;
            values['color'][this.port].colour = this.colorValue;
            values['color'][this.port].light = this.lightValue;
            values['color'][this.port].rgb = this.rgb;
            values['color'][this.port].ambientlight = 0;
        };
        ColorSensor.prototype.getLabel = function () {
            return ('<div><label>' +
                this.port.replace('ORT_', '') +
                ' ' +
                Blockly.Msg['SENSOR_COLOUR'] +
                '</label></div><div><label>&nbsp;-&nbsp;' +
                Blockly.Msg['MODE_COLOUR'] +
                '</label><span style="margin-left:6px; width: 20px; border-style:solid; border-width:thin; background-color:' +
                this.color +
                '">&nbsp;</span></div><div><label>&nbsp;-&nbsp;' +
                Blockly.Msg['MODE_LIGHT'] +
                '</label><span>' +
                UTIL.round(this.lightValue, 0) +
                '%</span></div>');
        };
        return ColorSensor;
    }());
    exports.ColorSensor = ColorSensor;
    var GyroSensor = /** @class */ (function () {
        function GyroSensor(port, x, y, theta) {
            this.color = '#000000';
            this.angleValue = 0;
            this.rateValue = 0;
            this.port = port;
            this.x = x;
            this.y = y;
            this.theta = theta;
        }
        GyroSensor.prototype.updateAction = function (myRobot, dt, interpreterRunning) {
            var gyroReset = myRobot.interpreter.getRobotBehaviour().getActionState('gyroReset', false);
            if (gyroReset && gyroReset[this.port]) {
                myRobot.interpreter.getRobotBehaviour().getActionState('gyroReset', true);
                this.reset();
            }
        };
        GyroSensor.prototype.reset = function () {
            this.angleValue = 0;
            this.rateValue = 0;
        };
        GyroSensor.prototype.updateSensor = function (running, dt, myRobot, values, uCtx, udCtx, personalObstacleList) {
            values['gyro'] = values['gyro'] || {};
            values['gyro'][this.port] = {};
            this.angleValue += SIMATH.toDegree(myRobot.thetaDiff);
            values['gyro'][this.port].angle = this.angleValue;
            this.rateValue = dt * SIMATH.toDegree(myRobot.thetaDiff);
            values['gyro'][this.port].rate = this.rateValue;
        };
        GyroSensor.prototype.getLabel = function () {
            return ('<div><label>' +
                this.port.replace('ORT_', '') +
                ' ' +
                Blockly.Msg['SENSOR_GYRO'] +
                '</label><span>' +
                UTIL.round(this.angleValue, 0) +
                '°</span></div>');
        };
        return GyroSensor;
    }());
    exports.GyroSensor = GyroSensor;
});
