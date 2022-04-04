import { BaseMobileRobot } from './BaseMobileRobot';
import * as C from 'interpreter.constants';
import * as SIMATH from 'simulation.math';
import * as UTIL from 'util';
import { ChassisDiffDrive } from './robot.actuators';
import { BaseRobot, IDrawable, ILabel, IReset, IUpdateAction, IUpdateSensor } from './BaseRobot';
import { CircleSimulationObject } from './simulation.objects';
// @ts-ignore
import * as Blockly from 'blockly';

export interface ISensor extends IUpdateSensor {
    readonly x: number;
    readonly y: number;
    readonly theta: number;
    readonly color: string;

    getLabel(): string;
}

export interface IExternalSensor extends ISensor {
    readonly port: string;
}

export class Timer implements ISensor, IReset, IUpdateAction, ILabel {
    readonly color: string = '';
    readonly theta: number = 0;
    readonly x: number = 0;
    readonly y: number = 0;
    readonly labelPriority: number = 11;
    time: number[] = [];
    t: number = 0;

    constructor(num: number) {
        for (let i = 0; i < num; i++) {
            this.time[i] = 0;
        }
    }

    getLabel(): string {
        let myLabels = '';
        for (let i = 0; i < this.time.length; i++) {
            myLabels +=
                '<div><label>' + (i + 1) + ' ' + Blockly.Msg['SENSOR_TIMER'] + '</label><span>' + UTIL.round(this.time[i] * 1000, 0) + 'ms</span></div>';
        }
        return myLabels;
    }

    updateSensor(
        running: boolean,
        dt: number,
        myRobot: BaseRobot,
        values: object,
        uCtx: CanvasRenderingContext2D,
        udCtx: CanvasRenderingContext2D,
        personalObstacleList: any[]
    ): void {
        values['timer'] = values['timer'] || [];
        for (let i = 0; i < this.time.length; i++) {
            values['timer'][i + 1] = this.time[i] * 1000;
        }
    }

    reset(): void {
        for (let num in this.time) {
            this.time[num] = 0;
        }
    }

    updateAction(myRobot: BaseRobot, dt: number, interpreterRunning: boolean): void {
        if (interpreterRunning) {
            for (let num in this.time) {
                this.time[num] += dt;
            }
            let myBehaviour = myRobot.interpreter.getRobotBehaviour();
            let timer = myBehaviour.getActionState('timer', true);
            if (timer) {
                for (let i = 1; i <= this.time.length; i++) {
                    if (timer[i] && timer[i] == 'reset') {
                        this.time[i - 1] = 0;
                    }
                }
            }
        }
    }
}

export class DistanceSensor implements IExternalSensor, IDrawable {
    public readonly drawPriority: number = 5;
    public readonly labelPriority: number;
    readonly port: string;
    readonly x: number;
    readonly y: number;
    readonly theta: number;
    readonly maxDistance: number;
    readonly maxLength: number;
    readonly color: string = '#FF69B4';

    rx: number = 0;
    ry: number = 0;
    distance: number = 0;
    u: Point[] = [];
    cx: number = 0;
    cy: number = 0;
    wave: number = 0;

    constructor(port: string, x: number, y: number, theta: number, maxDistance: number, color?: string) {
        this.port = port;
        this.labelPriority = Number(this.port.replace('ORT_', ''));
        this.x = x;
        this.y = y;
        this.theta = theta;
        this.maxDistance = maxDistance;
        this.maxLength = 3 * maxDistance;
        this.color = color || this.color;
    }

    draw(rCtx: CanvasRenderingContext2D, myRobot: BaseMobileRobot): void {
        rCtx.restore();
        rCtx.save();
        rCtx.lineDashOffset = C.WAVE_LENGTH - this.wave;
        rCtx.setLineDash([20, 40]);
        for (let i = 0; i < this.u.length; i++) {
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
    }

    updateSensor(
        running: boolean,
        dt: number,
        myRobot: BaseRobot,
        values: object,
        uCtx: CanvasRenderingContext2D,
        udCtx: CanvasRenderingContext2D,
        personalObstacleList: any[]
    ): void {
        if (myRobot instanceof BaseMobileRobot) {
            let robot: BaseMobileRobot = myRobot as BaseMobileRobot;
            SIMATH.transform(robot.pose, this as PointRobotWorld);
            values['ultrasonic'] = values['ultrasonic'] || {};
            values['infrared'] = values['infrared'] || {};
            values['ultrasonic'][this.port] = {};
            values['infrared'][this.port] = {};
            this.cx = null;
            this.cy = null;
            this.wave += C.WAVE_LENGTH * dt;
            this.wave %= C.WAVE_LENGTH;
            let u3 = {
                x1: this.rx,
                y1: this.ry,
                x2: this.rx + this.maxLength * Math.cos(robot.pose.theta + this.theta),
                y2: this.ry + this.maxLength * Math.sin(robot.pose.theta + this.theta),
            };
            let u1 = {
                x1: this.rx,
                y1: this.ry,
                x2: this.rx + this.maxLength * Math.cos(robot.pose.theta - Math.PI / 8 + this.theta),
                y2: this.ry + this.maxLength * Math.sin(robot.pose.theta - Math.PI / 8 + this.theta),
            };
            let u2 = {
                x1: this.rx,
                y1: this.ry,
                x2: this.rx + this.maxLength * Math.cos(robot.pose.theta - Math.PI / 16 + this.theta),
                y2: this.ry + this.maxLength * Math.sin(robot.pose.theta - Math.PI / 16 + this.theta),
            };
            let u5 = {
                x1: this.rx,
                y1: this.ry,
                x2: this.rx + this.maxLength * Math.cos(robot.pose.theta + Math.PI / 8 + this.theta),
                y2: this.ry + this.maxLength * Math.sin(robot.pose.theta + Math.PI / 8 + this.theta),
            };
            let u4 = {
                x1: this.rx,
                y1: this.ry,
                x2: this.rx + this.maxLength * Math.cos(robot.pose.theta + Math.PI / 16 + this.theta),
                y2: this.ry + this.maxLength * Math.sin(robot.pose.theta + Math.PI / 16 + this.theta),
            };

            let uA = [u1, u2, u3, u4, u5];
            this.distance = this.maxLength;
            const uDis = [this.maxLength, this.maxLength, this.maxLength, this.maxLength, this.maxLength];
            for (let i = 0; i < personalObstacleList.length; i++) {
                let myObstacle: any = personalObstacleList[i];
                if (myObstacle instanceof ChassisDiffDrive && myObstacle.id == robot.id) {
                    continue;
                }
                if (!(myObstacle instanceof CircleSimulationObject)) {
                    const obstacleLines = myObstacle.getLines();
                    for (let k = 0; k < obstacleLines.length; k++) {
                        for (let j = 0; j < uA.length; j++) {
                            let interPoint = SIMATH.getIntersectionPoint(uA[j], obstacleLines[k]);
                            this.checkShortestDistance(interPoint, uDis, j, uA[j]);
                        }
                    }
                } else {
                    for (let j = 0; j < uA.length; j++) {
                        const interPoint = SIMATH.getClosestIntersectionPointCircle(uA[j], personalObstacleList[i]);
                        this.checkShortestDistance(interPoint, uDis, j, uA[j]);
                    }
                }
            }
            for (let i = 0; i < uA.length; i++) {
                this.u[i] = { x: uA[i].x2, y: uA[i].y2 };
            }

            const distance = this.distance / 3.0;
            // adopt sim sensor to real sensor
            if (distance < this.maxDistance) {
                values['ultrasonic'][this.port].distance = distance;
            } else {
                values['ultrasonic'][this.port].distance = this.maxDistance;
            }
            values['ultrasonic'][this.port].presence = false;
            // treat the ultrasonic sensor as infrared sensor
            if (distance < 70) {
                values['infrared'][this.port].distance = (100.0 / 70.0) * distance;
            } else {
                values['infrared'][this.port].distance = 100.0;
            }
            values['infrared'][this.port].presence = false;
        }
    }

    private checkShortestDistance(interPoint: { x: number; y: number }, uDis: number[], j: number, uA: { x1: number; y1: number; x2: number; y2: number }) {
        if (interPoint) {
            const dis = Math.sqrt((interPoint.x - this.rx) * (interPoint.x - this.rx) + (interPoint.y - this.ry) * (interPoint.y - this.ry));
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
    }

    getLabel(): string {
        return (
            '<div><label>' +
            this.port.replace('ORT_', '') +
            ' ' +
            Blockly.Msg['SENSOR_ULTRASONIC'] +
            '</label><span>' +
            UTIL.roundUltraSound(this.distance / 3.0, 0) +
            'cm</span></div>'
        );
    }
}

export class TouchSensor implements IExternalSensor, IDrawable, ILabel {
    public readonly drawPriority: number = 4;
    public readonly labelPriority: number;
    readonly port: string;
    readonly x: number;
    readonly y: number;
    readonly color: string = '#FF69B4';
    rx: number = 0;
    ry: number = 0;
    value: number = 0;
    theta: number;

    constructor(port: string, x: number, y: number, color?: string) {
        this.port = port;
        this.labelPriority = Number(this.port.replace('ORT_', ''));
        this.x = x;
        this.y = y;
        this.color = color || this.color;
    }

    draw(rCtx: CanvasRenderingContext2D, myRobot: BaseMobileRobot): void {
        rCtx.save();
        rCtx.shadowBlur = 5;
        rCtx.shadowColor = 'black';
        rCtx.fillStyle = myRobot.chassis.geom.color;
        if (this.value === 1) {
            rCtx.fillStyle = 'red';
        } else {
            rCtx.fillStyle = myRobot.chassis.geom.color;
        }
        rCtx.fillRect(myRobot.chassis.frontLeft.x - 3.5, myRobot.chassis.frontLeft.y, 3.5, -myRobot.chassis.frontLeft.y + myRobot.chassis.frontRight.y);
        rCtx.restore();
    }

    updateSensor(
        running: boolean,
        dt: number,
        myRobot: BaseRobot,
        values: object,
        uCtx: CanvasRenderingContext2D,
        udCtx: CanvasRenderingContext2D,
        personalObstacleList: any[]
    ): void {
        values['touch'] = values['touch'] || {};
        values['touch'][this.port] = this.value =
            (myRobot as BaseMobileRobot).chassis.frontLeft.bumped ||
            (myRobot as BaseMobileRobot).chassis.frontRight.bumped ||
            (myRobot as BaseMobileRobot).chassis.frontMiddle.bumped
                ? 1
                : 0;
    }

    getLabel(): string {
        return (
            '<div><label>' + this.port.replace('ORT_', '') + ' ' + Blockly.Msg['SENSOR_TOUCH'] + '</label><span>' + UTIL.round(this.value, 0) + '</span></div>'
        );
    }
}

export class ColorSensor implements IExternalSensor, IDrawable, ILabel {
    public readonly drawPriority: number = 6;
    public readonly labelPriority: number;
    readonly port: string;
    readonly x: number;
    readonly y: number;
    readonly theta: number;
    readonly r: number;
    rx: number = 0;
    ry: number = 0;
    color: string = 'grey';
    colorValue: any = C.COLOR_ENUM.NONE;
    lightValue: number = 0;
    rgb: number[] = [0, 0, 0];

    constructor(port: string, x: number, y: number, theta: number, r: number, color?: string) {
        this.port = port;
        this.labelPriority = Number(this.port.replace('ORT_', ''));
        this.x = x;
        this.y = y;
        this.theta = theta;
        this.r = r;
        this.color = color || this.color;
    }

    draw(rCtx: CanvasRenderingContext2D, myRobot: BaseMobileRobot): void {
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
    }

    updateSensor(running: boolean, dt: number, myRobot: BaseMobileRobot, values: object, uCtx: CanvasRenderingContext2D, udCtx: CanvasRenderingContext2D) {
        values['color'] = values['color'] || {};
        values['light'] = values['light'] || {};
        values['color'][this.port] = {};
        values['light'][this.port] = {};
        SIMATH.transform(myRobot.pose, this as PointRobotWorld);
        let red: number = 0;
        let green: number = 0;
        let blue: number = 0;
        let x = Math.round(this.rx - 3);
        let y = Math.round(this.ry - 3);
        try {
            let colors = uCtx.getImageData(x, y, 6, 6);
            let colorsD = udCtx.getImageData(x, y, 6, 6);
            for (let i = 0; i <= colors.data.length; i += 4) {
                if (colorsD.data[i + 3] === 255) {
                    for (let j = i; j < i + 3; j++) {
                        colors.data[j] = colorsD.data[j];
                    }
                }
            }
            let out = [0, 4, 16, 20, 24, 44, 92, 116, 120, 124, 136, 140]; // outside the circle
            for (let j = 0; j < colors.data.length; j += 24) {
                for (let i = j; i < j + 24; i += 4) {
                    if (out.indexOf(i) < 0) {
                        red += colors.data[i];
                        green += colors.data[i + 1];
                        blue += colors.data[i + 2];
                    }
                }
            }
            const num = colors.data.length / 4 - 12; // 12 are outside
            red /= num;
            green /= num;
            blue /= num;
            this.colorValue = SIMATH.getColor(SIMATH.rgbToHsv(red, green, blue));
            this.rgb = [UTIL.round(red, 0), UTIL.round(green, 0), UTIL.round(blue, 0)];
            if (this.colorValue === C.COLOR_ENUM.NONE) {
                this.color = 'grey';
            } else {
                this.color = this.colorValue.toString().toLowerCase();
            }
            this.lightValue = (red + green + blue) / 3 / 2.55;
        } catch (e) {
            // this might happen during change of background image and is ok, we return the last valid sensor values
        }
        values['color'][this.port].colorValue = this.colorValue;
        values['color'][this.port].colour = this.colorValue;
        values['color'][this.port].light = this.lightValue;
        values['color'][this.port].rgb = this.rgb;
        values['color'][this.port].ambientlight = 0;
    }

    getLabel(): string {
        return (
            '<div><label>' +
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
            '%</span></div>'
        );
    }
}

export class GyroSensor implements IExternalSensor, IReset, IUpdateAction {
    readonly port: string;
    readonly x: number;
    readonly y: number;
    readonly theta: number;
    readonly color: string = '#000000';
    angleValue: number = 0;
    rateValue: number = 0;

    constructor(port: string, x: number, y: number, theta: number) {
        this.port = port;
        this.x = x;
        this.y = y;
        this.theta = theta;
    }

    updateAction(myRobot: BaseRobot, dt: number, interpreterRunning: boolean): void {
        let gyroReset = myRobot.interpreter.getRobotBehaviour().getActionState('gyroReset', false);
        if (gyroReset && gyroReset[this.port]) {
            myRobot.interpreter.getRobotBehaviour().getActionState('gyroReset', true);
            this.reset();
        }
    }

    reset(): void {
        this.angleValue = 0;
        this.rateValue = 0;
    }

    updateSensor(
        running: boolean,
        dt: number,
        myRobot: BaseRobot,
        values: object,
        uCtx: CanvasRenderingContext2D,
        udCtx: CanvasRenderingContext2D,
        personalObstacleList: any[]
    ): void {
        values['gyro'] = values['gyro'] || {};
        values['gyro'][this.port] = {};
        this.angleValue += SIMATH.toDegree((myRobot as BaseMobileRobot).thetaDiff);
        values['gyro'][this.port].angle = this.angleValue;
        this.rateValue = dt * SIMATH.toDegree((myRobot as BaseMobileRobot).thetaDiff);
        values['gyro'][this.port].rate = this.rateValue;
    }

    getLabel(): string {
        return (
            '<div><label>' +
            this.port.replace('ORT_', '') +
            ' ' +
            Blockly.Msg['SENSOR_GYRO'] +
            '</label><span>' +
            UTIL.round(this.angleValue, 0) +
            '°</span></div>'
        );
    }
}
