import { BaseMobileRobot, Pose } from './BaseMobileRobot';
import { BaseRobot, IDrawable, ILabel, IReset, IUpdateAction, IUpdateSensor } from './BaseRobot';
import * as C from 'interpreter.constants';
import * as SIMATH from 'simulation.math';
import * as GUISTATE_C from 'guiState.controller';
import { CircleSimulationObject, ISimulationObstacle } from './simulation.objects';
import * as UTIL from 'util';
import * as $ from 'jquery';
// @ts-ignore
import * as Blockly from 'blockly';

export abstract class ChassisDiffDrive implements IUpdateAction, IUpdateSensor, IDrawable, IReset, ISimulationObstacle {
    abstract backLeft: PointRobotWorldBumped;
    abstract backMiddle: PointRobotWorld;
    abstract backRight: PointRobotWorldBumped;
    abstract frontLeft: PointRobotWorldBumped;
    abstract frontMiddle: PointRobotWorld;
    abstract frontRight: PointRobotWorldBumped;
    abstract geom: Geometry;
    id: number;
    left: Motor = { port: '', speed: 0 };
    right: Motor = { port: '', speed: 0 };
    abstract topView: string;
    abstract wheelBack: Geometry;
    wheelBackLeft: PointRobotWorldBumped = { bumped: false, rx: 0, ry: 0, x: 0, y: 0 };
    wheelBackRight: PointRobotWorldBumped = { bumped: false, rx: 0, ry: 0, x: 0, y: 0 };
    wheelFrontLeft: PointRobotWorldBumped = { bumped: false, rx: 0, ry: 0, x: 0, y: 0 };
    wheelFrontRight: PointRobotWorldBumped = { bumped: false, rx: 0, ry: 0, x: 0, y: 0 };
    abstract wheelLeft: Geometry;
    abstract wheelRight: Geometry;
    protected readonly ENC: number;
    protected encoder: Encoder = {
        left: 0,
        right: 0,
        rightAngle: 0,
        leftAngle: 0,
    };
    private readonly MAXPOWER: number;
    private readonly TRACKWIDTH: number;
    private readonly WHEELDIAMETER: number;
    private angle: number;
    private distance: number;

    protected constructor(id: number, configuration: {}) {
        this.id = id;
        this.TRACKWIDTH = configuration['TRACKWIDTH'] * 3;
        this.WHEELDIAMETER = configuration['WHEELDIAMETER'];
        this.ENC = 360.0 / (3.0 * Math.PI * this.WHEELDIAMETER);
        this.MAXPOWER = (2 * this.WHEELDIAMETER * Math.PI * 3) / 100;
        for (const item in configuration['ACTUATORS']) {
            const motor = configuration['ACTUATORS'][item];
            if (motor['MOTOR_DRIVE'] === 'RIGHT') {
                this.right.port = item;
                this.right.speed = 0;
            }
            if (motor['MOTOR_DRIVE'] === 'LEFT') {
                this.left.port = item;
                this.left.speed = 0;
            }
        }
    }

    draw(rCtx: CanvasRenderingContext2D, myRobot: BaseMobileRobot): void {
        rCtx.save();
        // draw axis
        rCtx.lineWidth = 2.5;
        rCtx.strokeStyle = this.wheelLeft.color;
        rCtx.beginPath();
        rCtx.moveTo(0, this.wheelLeft.y - 2);
        rCtx.lineTo(0, this.wheelRight.y + 10);
        rCtx.stroke();
        rCtx.closePath();
        //draw back wheel
        rCtx.fillStyle = this.wheelBack.color;
        rCtx.fillRect(this.wheelBack.x, this.wheelBack.y, this.wheelBack.w, this.wheelBack.h);
        // draw geometry
        rCtx.fillStyle = this.geom.color;
        rCtx.fillRect(15, -10, 8, 20);
        rCtx.shadowBlur = 5;
        rCtx.shadowColor = 'black';
        rCtx.beginPath();
        const radius = this.geom.radius || 0;
        rCtx.moveTo(this.geom.x + radius, this.geom.y);
        rCtx.lineTo(this.geom.x + this.geom.w - radius, this.geom.y);
        rCtx.quadraticCurveTo(this.geom.x + this.geom.w, this.geom.y, this.geom.x + this.geom.w, this.geom.y + radius);
        rCtx.lineTo(this.geom.x + this.geom.w, this.geom.y + this.geom.h - radius);
        rCtx.quadraticCurveTo(this.geom.x + this.geom.w, this.geom.y + this.geom.h, this.geom.x + this.geom.w - radius, this.geom.y + this.geom.h);
        rCtx.lineTo(this.geom.x + radius, this.geom.y + this.geom.h);
        rCtx.quadraticCurveTo(this.geom.x, this.geom.y + this.geom.h, this.geom.x, this.geom.y + this.geom.h - radius);
        rCtx.lineTo(this.geom.x, this.geom.y + radius);
        rCtx.quadraticCurveTo(this.geom.x, this.geom.y, this.geom.x + radius, this.geom.y);
        rCtx.closePath();
        rCtx.fill();
        rCtx.shadowBlur = 0;
        rCtx.shadowOffsetX = 0;
        rCtx.beginPath();
        rCtx.lineWidth = 2;
        rCtx.fill();
        rCtx.closePath();
        // rCtx.restore();
        //draw wheels
        // rCtx.save();
        rCtx.fillStyle = this.wheelLeft.color;
        rCtx.fillRect(this.wheelLeft.x, this.wheelLeft.y, this.wheelLeft.w, this.wheelLeft.h);
        rCtx.fillStyle = this.wheelRight.color;
        rCtx.fillRect(this.wheelRight.x, this.wheelRight.y, this.wheelRight.w, this.wheelRight.h);
        rCtx.restore();
        //rCtx.save();
    }

    public readonly drawPriority: number = 0;

    getLines(): Line[] {
        return [
            {
                x1: this.backLeft.rx,
                x2: this.frontLeft.rx,
                y1: this.backLeft.ry,
                y2: this.frontLeft.ry,
            },
            {
                x1: this.frontLeft.rx,
                x2: this.frontRight.rx,
                y1: this.frontLeft.ry,
                y2: this.frontRight.ry,
            },
            {
                x1: this.frontRight.rx,
                x2: this.backRight.rx,
                y1: this.frontRight.ry,
                y2: this.backRight.ry,
            },
            {
                x1: this.backRight.rx,
                x2: this.backLeft.rx,
                y1: this.backRight.ry,
                y2: this.backLeft.ry,
            },
        ];
    }

    getTolerance(): number {
        return Math.max(Math.abs(this.right.speed), Math.abs(this.left.speed) || 0);
    }

    abstract reset(): void;

    transformNewPose(pose: Pose, chassis: ChassisDiffDrive) {
        SIMATH.transform(pose, chassis.frontRight);
        SIMATH.transform(pose, chassis.frontLeft);
        SIMATH.transform(pose, chassis.frontMiddle);
        SIMATH.transform(pose, chassis.backRight);
        SIMATH.transform(pose, chassis.backLeft);
        SIMATH.transform(pose, chassis.backMiddle);
        SIMATH.transform(pose, chassis.wheelFrontRight);
        SIMATH.transform(pose, chassis.wheelFrontRight);
        SIMATH.transform(pose, chassis.wheelBackRight);
        SIMATH.transform(pose, chassis.wheelFrontLeft);
        SIMATH.transform(pose, chassis.wheelBackLeft);
    }

    updateAction(myRobot: BaseMobileRobot, dt: number, interpreterRunning: boolean): void {
        let left: number;
        let right: number;
        const motors = myRobot.interpreter.getRobotBehaviour().getActionState('motors', true);
        if (motors) {
            left = motors[C.MOTOR_LEFT];
            right = motors[C.MOTOR_RIGHT];
            // diff drive action
            if (left && right) {
                // turn action
                if (motors[C.ANGLE]) {
                    this.angle = Math.abs(motors[C.ANGLE]);
                }
                // drive or curve action
                if (motors[C.DISTANCE]) {
                    this.distance = Math.abs(motors[C.DISTANCE]) * 3;
                }
            } else {
                // motor action
                let angle: number;
                if (motors[C.ROTATIONS]) {
                    angle = motors[C.ROTATIONS] * 360;
                }
                if (motors[C.DEGREE]) {
                    angle = motors[C.DEGREE];
                }
                if (motors[C.DISTANCE]) {
                    angle = (motors[C.DISTANCE] / Math.PI / this.WHEELDIAMETER / 360) * 3;
                }
                for (let myMotor in motors) {
                    if (myMotor.toLowerCase() === this.left.port.toLowerCase()) {
                        left = motors[myMotor];
                        if (angle) {
                            this.encoder.leftAngle = angle;
                        }
                    }
                    if (myMotor.toLowerCase() === this.right.port.toLowerCase()) {
                        right = motors[myMotor];
                        if (angle) {
                            this.encoder.rightAngle = angle;
                        }
                    }
                }
            }
        }
        if (left !== undefined) {
            if (left > 100) {
                left = 100;
            } else if (left < -100) {
                left = -100;
            }
            this.left.speed = left * this.MAXPOWER;
        }
        if (right !== undefined) {
            if (right > 100) {
                right = 100;
            } else if (right < -100) {
                right = -100;
            }
            this.right.speed = right * this.MAXPOWER;
        }
        let tempRight = (this.right.speed = interpreterRunning ? this.right.speed : 0);
        let tempLeft = (this.left.speed = interpreterRunning ? this.left.speed : 0);

        if ((this.frontLeft.bumped || this.wheelFrontLeft.bumped) && this.left.speed > 0) {
            tempLeft *= -1;
        }
        if (this.backLeft.bumped && this.left.speed < 0) {
            tempLeft *= -1;
        }
        if ((this.frontRight.bumped || this.wheelFrontRight.bumped) && this.right.speed > 0) {
            tempRight *= -1;
        }
        if (this.backRight.bumped && this.right.speed < 0) {
            tempRight *= -1;
        }
        // move the robot according to the action values
        if (tempRight == tempLeft) {
            const moveXY = tempRight * dt;
            const mX = Math.cos(myRobot.pose.theta) * moveXY;
            const mY = Math.sqrt(Math.pow(moveXY, 2) - Math.pow(mX, 2));
            myRobot.pose.x += mX;
            if (moveXY >= 0) {
                if (myRobot.pose.theta < Math.PI) {
                    myRobot.pose.y += mY;
                } else {
                    myRobot.pose.y -= mY;
                }
            } else {
                if (myRobot.pose.theta > Math.PI) {
                    myRobot.pose.y += mY;
                } else {
                    myRobot.pose.y -= mY;
                }
            }
            myRobot.thetaDiff = 0;
        } else {
            const R = (this.TRACKWIDTH / 2) * ((tempLeft + tempRight) / (tempLeft - tempRight));
            const rot = (tempLeft - tempRight) / this.TRACKWIDTH;
            const iccX = myRobot.pose.x - R * Math.sin(myRobot.pose.theta);
            const iccY = myRobot.pose.y + R * Math.cos(myRobot.pose.theta);
            myRobot.pose.x = Math.cos(rot * dt) * (myRobot.pose.x - iccX) - Math.sin(rot * dt) * (myRobot.pose.y - iccY) + iccX;
            myRobot.pose.y = Math.sin(rot * dt) * (myRobot.pose.x - iccX) + Math.cos(rot * dt) * (myRobot.pose.y - iccY) + iccY;
            myRobot.thetaDiff = rot * dt;
            myRobot.pose.theta += myRobot.thetaDiff;
        }
        // check if the action is done
        const chassis = this;
        function resetSpeed() {
            myRobot.interpreter.getRobotBehaviour().setBlocking(false);
            chassis.right.speed = 0;
            chassis.left.speed = 0;
        }
        if (this.angle) {
            if (myRobot.thetaDiff >= 0) {
                this.angle -= myRobot.thetaDiff;
            } else {
                this.angle += myRobot.thetaDiff;
            }
            let div = (Math.abs(this.right.speed) + dt * this.TRACKWIDTH) * 10;
            if (this.angle < Math.abs(myRobot.thetaDiff) / div) {
                this.angle = null;
                resetSpeed();
            }
        }
        if (this.distance) {
            let dist = Math.sqrt(Math.pow(myRobot.pose.x - myRobot.pose.xOld, 2) + Math.pow(myRobot.pose.y - myRobot.pose.yOld, 2));
            this.distance -= dist;
            let div = (Math.abs(this.right.speed) + Math.abs(this.left.speed)) / 20;
            if (this.distance < dist / div) {
                this.distance = null;
                resetSpeed();
            }
        }
        if (this.encoder.leftAngle) {
            let leftAngle = this.left.speed * dt * this.ENC;
            this.encoder.leftAngle -= leftAngle;
            let div = Math.abs(this.left.speed); // TODO
            if (this.encoder.leftAngle < 0) {
                this.encoder.leftAngle = null;
                resetSpeed();
            }
        }
        if (this.encoder.rightAngle) {
            let rightAngle = this.right.speed * dt * this.ENC;
            this.encoder.rightAngle -= rightAngle;
            let div = Math.abs(this.right.speed); // TODO
            if (this.encoder.rightAngle < 0) {
                this.encoder.rightAngle = null;
                resetSpeed();
            }
        }
        this.transformNewPose(myRobot.pose, this);
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
        this.checkCollisions(this.id, dt, personalObstacleList);
    }

    private checkCollisions(myId: number, dt: number, personalObstacleList: ISimulationObstacle[]): void {
        let ground = personalObstacleList.slice(-1)[0] as any; // ground is always the last element in the personal obstacle list
        function checkGround(p: PointRobotWorldBumped): void {
            if (p.rx < ground.x || p.rx > ground.x + ground.w || p.ry < ground.y || p.ry > ground.y + ground.h) {
                p.bumped = true;
            }
        }
        let myCheckPoints: PointRobotWorldBumped[] = [
            this.frontLeft,
            this.frontRight,
            this.backLeft,
            this.backRight,
            this.wheelFrontRight,
            this.wheelFrontLeft,
            this.wheelBackLeft,
            this.wheelBackRight,
        ];
        myCheckPoints.forEach((checkPoint) => {
            checkPoint.bumped = false;
            checkGround(checkPoint);
        });
        for (let i = 0; i < personalObstacleList.length - 1; i++) {
            let myObstacle: any = personalObstacleList[i];
            if (myObstacle instanceof ChassisDiffDrive && myObstacle.id == myId) {
                // never check if you are bumping yourself ;-)
                continue;
            }
            let pointsInObstacle: boolean = myCheckPoints
                .filter((checkPoint) => {
                    return (checkPoint.bumped = checkPoint.bumped || SIMATH.checkInObstacle(myObstacle, checkPoint));
                })
                .map((checkPoint) => checkPoint.bumped)
                .reduce((previous, current) => {
                    return previous || current;
                }, false);
            if (!pointsInObstacle) {
                let myCheckLines = [
                    [this.frontLeft, this.frontRight, this.frontMiddle],
                    [this.backLeft, this.backRight, this.backMiddle],
                    [this.wheelFrontRight, this.wheelBackRight],
                    [this.wheelFrontLeft, this.wheelBackLeft],
                ];
                let p: Point = { x: 0, y: 0 };
                let thisTolerance = Math.max(Math.abs(this.right['SPEED']), Math.abs(this.left['SPEED']));
                if (!(myObstacle instanceof CircleSimulationObject)) {
                    const obstacleLines = myObstacle.getLines();
                    myCheckLines.forEach((checkLine) => {
                        for (let k = 0; k < obstacleLines.length; k++) {
                            const interPoint = SIMATH.getIntersectionPoint(
                                { x1: checkLine[0].rx, x2: checkLine[1].rx, y1: checkLine[0].ry, y2: checkLine[1].ry },
                                obstacleLines[k]
                            );
                            if (interPoint) {
                                if (Math.abs(checkLine[0].rx - interPoint.x) < Math.abs(checkLine[1].rx - interPoint.x)) {
                                    checkLine[0].bumped = true;
                                } else {
                                    checkLine[1].bumped = true;
                                }
                            } else if (checkLine[2]) {
                                p = SIMATH.getDistanceToLine(
                                    {
                                        x: checkLine[2].rx,
                                        y: checkLine[2].ry,
                                    },
                                    {
                                        x: obstacleLines[k].x1,
                                        y: obstacleLines[k].y1,
                                    },
                                    {
                                        x: obstacleLines[k].x2,
                                        y: obstacleLines[k].y2,
                                    }
                                );
                                if (SIMATH.sqr(checkLine[2].rx - p.x) + SIMATH.sqr(checkLine[2].ry - p.y) < dt * (myObstacle.getTolerance() + thisTolerance)) {
                                    checkLine[0].bumped = true;
                                    checkLine[1].bumped = true;
                                }
                            }
                        }
                    });
                }
            } else {
                this.frontLeft.bumped = this.frontLeft.bumped || this.frontMiddle.bumped;
                this.frontRight.bumped = this.frontRight.bumped || this.frontMiddle.bumped;
                this.backLeft.bumped = this.backLeft.bumped || this.backMiddle.bumped || this.wheelBackLeft.bumped;
                this.backRight.bumped = this.backRight.bumped || this.backMiddle.bumped || this.wheelFrontRight.bumped;
            }
        }
    }
}

export class EV3Chassis extends ChassisDiffDrive implements ILabel {
    readonly labelPriority: number = 10;
    backLeft: PointRobotWorldBumped = {
        x: -30,
        y: -20,
        rx: 0,
        ry: 0,
        bumped: false,
    };
    backMiddle: PointRobotWorld = {
        x: -30,
        y: 0,
        rx: 0,
        ry: 0,
    };
    backRight: PointRobotWorldBumped = {
        x: -30,
        y: 20,
        rx: 0,
        ry: 0,
        bumped: false,
    };
    frontLeft: PointRobotWorldBumped = {
        x: 25,
        y: -22.5,
        rx: 0,
        ry: 0,
        bumped: false,
    };
    frontMiddle: PointRobotWorld = {
        x: 25,
        y: 0,
        rx: 0,
        ry: 0,
    };
    frontRight: PointRobotWorldBumped = {
        x: 25,
        y: 22.5,
        rx: 0,
        ry: 0,
        bumped: false,
    };
    geom: Geometry = {
        x: -30,
        y: -20,
        w: 50,
        h: 40,
        radius: 2.5,
        color: '#FCCC00',
    };

    getLabel(): string {
        return (
            '<div><label>' +
            this.left.port +
            ' ' +
            Blockly.Msg['LEFT_MOTOR'] +
            '</label><span>' +
            UTIL.round(this.encoder.left * this.ENC, 0) +
            '°</span></div>' +
            '<div><label>' +
            this.right.port +
            ' ' +
            Blockly.Msg['RIGHT_MOTOR'] +
            '</label><span>' +
            UTIL.round(this.encoder.right * this.ENC, 0) +
            '°</span></div>'
        );
    }

    reset(): void {
        this.encoder.left = 0;
        this.encoder.right = 0;
        this.left.speed = 0;
        this.right.speed = 0;
        $('#display' + this.id).html('');
    }

    topView: string =
        '<svg id="brick' +
        this.id +
        '" xmlns="http://www.w3.org/2000/svg" width="313" height="482" viewBox="0 0 313 482">' +
        '<path stroke-alignment="inner" d="M1 88h17.5v-87h276v87h17.5v306h-17.5v87h-276v-87h-17.5z" style="fill:#fff;stroke:#000;stroke-width:2"/>' +
        '<rect x="19.5" y="2" width="274" height="225" style="fill:#A3A2A4;stroke:none"/>' +
        '<rect x="19.5" y="202" width="274" height="25" style="fill:#635F61;stroke:none"/>' +
        '<path d="M45 47.4c0-5.3 5.7-7.7 5.7-7.7s206.7 0 211 0c4.3 0 6.7 7.7 6.7 7.7v118.3c0 5.3-5.7 7.7-5.7 7.7s-206.7 0-211 0S44 164.7 44 164.7" fill="#333"/>' +
        '<rect x="67" y="41" width="180" height="130" fill="#ddd"/>' +
        '<line x1="155.7" y1="246" x2="155.7" y2="172.4" style="fill:none;stroke-width:9;stroke:#000"/>' +
        '<path id="led' +
        this.id +
        '" fill="url("#LIGHTGRAY' +
        this.id +
        '") d="M155.5 242.5 l20 0 40 40 0 52 -40 40 -40 0 -40 -40 0 -52 40 -40z" fill="#977" />' +
        '<path id="up' +
        this.id +
        '" class="simKey" d="M156 286c0 0 7 0 14.3-0.2s9 7.2 9 7.2v12.3h10.5v-19.5l9.7-9.7c0 0 2.8-0.2 0-3.3-2.8-3.2-26.5-25.7-26.5-25.7h-17-0.3-17c0 0-23.7 22.5-26.5 25.7s0 3.3 0 3.3l9.7 9.7v19.5h10.5v-12.3c0 0 1.7-7.3 9-7.2s14.3 0.2 14.3 0.2z" style="fill:#A3A2A4;stroke-width:2;stroke:#000"/>' +
        '<path id="down' +
        this.id +
        '" class="simKey" d="M156 331c0 0 7 0 14.3 0.2s9-7.2 9-7.2v-12.3h10.5v19.5l9.7 9.7c0 0 2.8 0.2 0 3.3-2.8 3.2-26.5 25.7-26.5 25.7h-17-0.3-17c0 0-23.7-22.5-26.5-25.7s0-3.3 0-3.3l9.7-9.7v-19.5h10.5v12.3c0 0 1.7 7.3 9 7.2s14.3-0.2 14.3-0.2z" style="fill:#A3A2A4;stroke-width:2;stroke:#000"/>' +
        '<path id="enter' +
        this.id +
        '" class="simKey" d="M138 293c0-1.4 0.9-2 0.9-2s32.6 0 33.2 0 1.1 2 1.1 2v31.4c0 1.4-0.9 2-0.9 2s-32.5 0-33.2 0c-0.7 0-1-2-1-2V293.1z" style="fill:#3C3C3B;stroke-width:2;stroke:#000"/>' +
        '<path id="escape' +
        this.id +
        '" class="simKey" d="M37 227v26.4c0 0 1.2 4.8 4.9 4.8s44.8 0 44.8 0l15.7-15.6v-15.7z" style="fill:#A3A2A4;stroke-width:2;stroke:#000"/>' +
        '<path id="left' +
        this.id +
        '" class="simKey" d="M69 309c0 12.5 14 17.9 14 17.9s27.1 0 29.8 0 2.8-1.7 2.8-1.7v-16.4 0.1-16.4c0 0-0.2-1.7-2.8-1.7s-29.7 0-29.7 0S69.3 296.7 69.3 309.2z" style="fill:#A3A2A4;stroke-width:2;stroke:#000"/>' +
        '<path id="right' +
        this.id +
        '" class="simKey" d="M242 309c0 12.5-14 17.9-14 17.9s-27.1 0-29.7 0-2.8-1.7-2.8-1.7v-16.4 0.1-16.4c0 0 0.2-1.7 2.8-1.7s29.8 0 29.8 0S241.9 296.7 241.9 309.2z" style="fill:#A3A2A4;stroke-width:2;stroke:#000"/>' +
        '<rect x="19" y="412.4" width="274" height="67.7" style="fill:#A3A2A4"/>' +
        '<rect x="2" y="376" width="17.5" height="17.5" style="fill:#635F61"/>' +
        '<rect x="294" y="376" width="17.5" height="17.5" style="fill:#635F61"/>' +
        '<rect x="231.7" y="426.6" width="9.6" height="5.4" style="fill:#E52520;stroke:#000"/>' +
        '<rect x="246.2" y="426.7" width="9.6" height="5.4" style="fill:#E52520;stroke:#000"/>' +
        '<rect x="227.5" y="432.4" width="32.6" height="26.2" style="fill:#E52520;stroke:#000"/>' +
        '<g id="display' +
        this.id +
        '" clip-path="url(#clipPath)" fill="#000" transform="translate(67, 41)" font-family="Courier New" font-size="10pt">' +
        '</g>' +
        '<defs>' +
        '<clipPath id="clipPath">' +
        '<rect x="0" y="0" width="178" height="128"/>' +
        '</clipPath>' +
        '<radialGradient id="ORANGE' +
        this.id +
        '" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">' +
        '<stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0" />' +
        '<stop offset="100%" style="stop-color:rgb( 255, 165, 0);stop-opacity:1" />' +
        '</radialGradient>' +
        '<radialGradient id="RED' +
        this.id +
        '" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">' +
        '<stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0" />' +
        '<stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />' +
        '</radialGradient>' +
        '<radialGradient id="GREEN' +
        this.id +
        '" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">' +
        '<stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0" />' +
        '<stop offset="100%" style="stop-color:rgb(0,128,0);stop-opacity:1" />' +
        '</radialGradient>' +
        '<radialGradient id="LIGHTGRAY' +
        this.id +
        '" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">' +
        '<stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0" />' +
        '<stop offset="100%" style="stop-color:rgb(211,211,211);stop-opacity:1" />' +
        '</radialGradient>' +
        '</defs>' +
        '</svg>';

    override updateAction(myRobot: BaseMobileRobot, dt: number, interpreterRunning: boolean): void {
        super.updateAction(myRobot, dt, interpreterRunning);
        this.encoder.left += this.left.speed * dt;
        this.encoder.right += this.right.speed * dt;
        const encoder = myRobot.interpreter.getRobotBehaviour().getActionState('encoder', true);
        if (encoder) {
            if (encoder[this.left.port.toLowerCase()] && encoder[this.left.port.toLowerCase()] === 'reset') {
                this.encoder.left = 0;
            }
            if (encoder[this.right.port.toLowerCase()] && encoder[this.right.port.toLowerCase()] === 'reset') {
                this.encoder.right = 0;
            }
        }
        let display = myRobot.interpreter.getRobotBehaviour().getActionState('display', true);
        if (display) {
            let text = display.text;
            let x = display.x;
            let y = display.y;
            let $display = $('#display' + this.id);
            if (text) {
                $display.html($display.html() + '<text x=' + x * 10 + ' y=' + (y + 1) * 16 + '>' + text + '</text>');
            }
            if (display.picture) {
                $display.html(this.display[display.picture]);
            }
            if (display.clear) {
                $display.html('');
            }
        }
    }

    override updateSensor(
        running: boolean,
        dt: number,
        myRobot: BaseRobot,
        values: object,
        uCtx: CanvasRenderingContext2D,
        udCtx: CanvasRenderingContext2D,
        personalObstacleList: any[]
    ): void {
        super.updateSensor(running, dt, myRobot, values, uCtx, udCtx, personalObstacleList);
        if (running) {
            this.updateEncoders(running, values);
            this.updateButtons(running, values);
        }
    }

    wheelBack: Geometry = {
        x: -33,
        y: -2,
        w: 4,
        h: 4,
        color: '#000000',
    };
    wheelLeft: Geometry = {
        x: -8,
        y: -24,
        w: 16,
        h: 8,
        color: '#000000',
    };
    wheelRight: Geometry = {
        x: -8,
        y: 16,
        w: 16,
        h: 8,
        color: '#000000',
    };
    buttons = {
        escape: false,
        up: false,
        left: false,
        enter: false,
        right: false,
        down: false,
    };
    display = {
        OLDGLASSES:
            '<image  width="178" height="128" alt="old glasses" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALIAAACACAQAAAAFMftFAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAFeAAABXgAY1ULDgAAAMxSURBVHja7Z3blqowEESJy///Zc7TjA6XpDvpSzWn9tOohGyKNiBoZtsIIYQQQgghhBBCCCGEEEIIIYQQQggBpZmtac/eFFPscjFY2d9oTdXSMN+m+VVcV279mB22a67xs4YGKdNB6xv+nwH/MBW0rpFtwJFDi6W52lvTwL6Go2K2Nld6Sxf3GyS8g5YcyGa2TuEtW9R7HPYL+sq8iZc0spYsuItar+0Ij5h1J2OO1TxebFe0XAnaOmZ5Da/Yi6xfE6rb1hwqz3ZI0kfsaK3ft/bVYB/EXMSz7sM19yo5qhqsifYe7pyXqql/xOuDxqz3Ss+Dti9Fs5gqXos5y7trPTrw6VRtDl7za5mvYtdPAm+hbIWxeAa7cPf7jF6Xix8BqIZJfM+FhGuTDBeSk58gXWWryIg7nEPWdu1Twfp16r3DrMeVDFINE/TMQ72PIes691T1NPHzvlzzqJJhqkHNvXm49+jiNZDq0pZFep96fusWD1TVnJuDn9fLP/H1N8oDjLMWA3r3NvLecLbbFW9+6H2uktGBGixGY/IVoXUs6UycaNo7sFgle9z38kdbycHV0H47bF/PfYtUCP1TydCHsyZ4ZkDk9h36encXbf3GMbTzn/vPgxuhHavA4cfkdvVnu3i1T+r79GM5+hJL9nCif1dlmrfrB9khjpX37jNY/AlZf56cw37xGGrc7VGjkutRspKP4qVKokrI7eJxmaDhT+G2bbsbfcuMyRVCbhOvQFEh5B4lYv6EjKqL6qVwrl7JJWDIAaCHXHGwOIEe8pgCu+E75AK6JTjliF3JD9nt2CE/BIgbTEK3e8CtWckBnHNHqYrM6U6MrVnJAVj/1t/Tqw+wNSs5gNyvmOqsRsBaI34H2XpCwHRrDhcB4P3wZu2jNKQ12k/I1q9WAFpj/d7Ub3KcVOvRApHCNedyFlj7TX/kIKsAyjpuPhYDWRVA1k+eRhLGOn9C1OiZOhOsc6f2rTEJ2rJ17lXbCpOgGVjnXVKMvUmaap1zvSvnLnSadfwVr9zb/CnWtv/MxbcvO4Kt/T/K4kT7HGtCCCGEEEIIIYQQQgghhBBCCCGEEEIIId/8A/WUnnVgvvqBAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE2LTAzLTEzVDE0OjE3OjMyKzAxOjAw2vjCoQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNi0wMy0xM1QxNDoxNzozMiswMTowMKuleh0AAAAASUVORK5CYII=" />',
        EYESOPEN:
            '<image width="178" height="128" alt="eyes open" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALIAAACACAQAAAAFMftFAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAFeAAABXgAY1ULDgAAAUkSURBVHja7Z3btuMgCIbjrHn/V3YuOl05efhBQLR8F3u1aWPwD6Ki6T6OIAiCIAiCIAiCIAieZOxrabadC/ORGFAwROZyenFXwz+zbV0ZMFqEyBaEyAZETObyjRWAguHJPPJBcNAQ2YAQ2YAQ2YAQ2YAQ2YAQmUN5bJFrU8C/s+1VhzCeHb5GhV1Fzs0jkoID5e4mMpazkRI8fUvKzWL2mlajabEyuBbvmNycAe7lyd9q8sQmTZUp7CXyl7eXoWSWzD/a8V3hS16m7PGNm/MLIt/5iJGbn9Lo3rbfE/lDWWp+RG6eaSkyvLprxl1qnmVA+KGKPN4x8ErQZNyeTgm03EU+6B3He0Y/3vUsBidBhIv0FDi582Je7VPlXQVKuPgUiEr8/l66/P0ptDo+uX7bM+AckRYuUKl+Q+J7jRst/G/1JP5M6RmH51T6jY4l+fKKlOrMl78002b7cAY+k7MpYUnT0gf5VUC6CN6KQ3MlpgwNuZaVat91xlq4SMcpKerTMyVGrp0fr2XsA7TpjS5OoSWqiZ1JO/tZQv3MZ75CYu4JuV+qntoKCal4lCoScvP65XCWktBz3l34eyoiPBmRgzpSSZ3PoapeuLbPuz/TEvzgdWn+2v+kX+HaTHDsWyp54IIFZ+0JYy9JT0am3GhDfa/W5Uqvzu/A8P7med1EG962G2IiHD+rjQzwKMKUz5Ma9eIyPztO+Mq9hp3Ao5TKyJwttwSAykzMvZ1Y7YUbk/jtwTNy0tc6kGrR/nJtfkMVSqtpS0136L5Mou3J3K6hXAXpZR7JHIQqSLgYk1k2LbNk0rQnslQDl/c6WblVb15J5HxLQUuEDK2tqotQ9+RTar7MeoLIe56iL9dTnedQaST3qmw+wQoJO5h5u/q0+plN5jJT4vx6N8WaWrj4BorvsJtunE6ooMzz7pOH1A17ajegJHJ6va+lZvrM8+NSmJAZ95Mpe/IkY3aFnurE9hCNpG8kuqr2qrVx+6rF5Fm+fN8kkvdoT542gefq0THPy4/0KIchC1pDuMxqWFK+Ny7MuE1CYaXlyTSZsVU59PzriIB3s/mIX6sfLnoV9Bk1W92z+bCyLXLdVGlpe+X5ewiCAJLq9OSr7QfE3t/Ejys+OISt8dnLnAuvqCTwmDr9mJwKaRYLJK5zb4fTAg46TvYWE3F7+KMjMZBw8Y2Dmj7RKzHB39S1gwUWk8+JgZ9OUNYS1Xqhm1vSJeGp40v4T5/o+bJSydSnnyh7Z7S9Xq58ZUtH1++kS0cn55Lrh+prkdy9cFoG3VtKYkwp+FdWw1Oqk1Pd8aGlQVeuu6tTswIyqVCTbQsePZnKnB3TBEaK1+r8eFfnbuc1mG7v4MkfKP6s9ZOSFfQ9Waca/JS8scCjl5m3xaV/ZeSxNbOU1+g6cLtUrb57fNRimlOUFLnlPZ52KJsnbSVExhZaLR+iKa9NTsuIW1xYI88wv1YEbMyxfXrUmcR2Bo0P/VfYrlvB6onU9zPRNPysyAxVXh+JB9i91cmlQVSh6R7sTuIZJjF/VAROHIfI/+H+ZorfGrk1ibajbdHh23HMTXW21jZcijVaUe8sHCziv5iZsJfILv14N5GdsobIS0+qVxEZw2mw2Etkt6wg8uLBYg2RMdwGi51EdkyIbIB/kZePyCuIjOE4Iu8jsmtCZANcN7Nj6VT9SXiyASGyAb5F3mD4dhzeRcZwHpH3ENk9IbIBnpvaFsO34whPNiFENsCvyJsM347Ds8gbESIb8A/fWiYeASG9lAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNi0wMy0xM1QxNDoyMzoxMyswMTowMK6jCBMAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTYtMDMtMTNUMTQ6MjM6MTMrMDE6MDDf/rCvAAAAAElFTkSuQmCC" />',
        EYESCLOSED:
            '<image width="178" height="128" alt="eyes closed" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALIAAACACAQAAAAFMftFAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAFeAAABXgAY1ULDgAAATbSURBVHja7ZxJksMgDEUhlftfmV7EiW3MIEDDh+ZvutoDoBcZgwR2bmtra2tra2tra2srlrdugJKCpbX/A3Kwtfdlbb+CwngRY1ofsjni9buLJ2IDi9f2ZAAvdm5tyCCIV+4uUoj3EI5VEH0xQNWCihEbW7ki5DtiAAsBmsCsK2IQ60CawSZAxEANYREk4nXHyUCIwRozKONYW14ozRkHBIsYo0E8o9owdLeo3qa180UXgBFbQuYM30AjtoIsEx8DRWzRsBrg9haZJkkp0vXkEuAxSMCIdRuXRgyNh0d6JoKFHzWlY+o/BqxlLlx8V1vyJv97xPJGgwYfdSVrOHDQRlOSxoNPdvUkBwB+HqYn2RmfHWKgpS3reRol9KRu80qQW2J7qnavApkypzSbdyJAHu8/W0bjBiN3S8g8/WcPNOo9TLNVG8itmZF8K/unO+k7RSLeCJkRSv9Zu6rHDr6fWurGTrU+3KXrOWaUKiMSq8xIS73p+7gm7XTME0DmerT97QhH+6mYu+vSWnA4Go+LPdhi0013nbrpJ+5Hm6v1wr6s4cl8IU9f+I+vXHbJQ+aNKiPMUJslDZk/cO+jv7ylikjnxcdpAsw+U7pkg/ZyQPg9z8st5JWEvF6OLzSEk75HvMaCw3UQ55SPswRpBDJ+LJuerXcYvnBlLoTlpT0Z0495JzXlQKxKd4GlkDnanomhpRO8c3KQRx5r/nVH9W6gFXNTnWieHB7/aUWLJexQGML1NSx1tD+tSlWthjhFVb4+eo75IXN5T+k9zlu37zhTb8XlXj7Iox+kyWWGvQvNk4Ca/MDZs06KNzvnOCDbxhL4N6zV5X+JA2LpvZC50dbKC9mhfgxAQ/6oO+3PjyN9kO281x/GSYTv24adJ+jqHUiji7vBlBef9XzSF/z5IlTI1n09VSR/nvXzOPw/QX+J/rg/W0IfZImQOfW8bBfRu2ChCHpWT+b25fHSCu8QHMiefE7Ol0dDnhl/loQs/eriz8mNK+nP49+uolQ5Uq4vXse5Fo7vCYlK7PVkqUfW30r22Xr0X709ZQ3n+Kw3c3Gvr+Nv669kWcj4mKWXLQTnkEYXI4b0vbiCOOKjZPnkjlb6nmdjjohwYxetaklTKe/l00hTSpiRr3uazZK928B6DW8VfaVP6S7Tbb/0lE6oXCH1YuGLNKgoD7m0TzMdDCn9YEgrlEE+xRAq51q2eXFjpk2CpvioSB5N/2ITvT131mmpSLnJyBm2G1fPMpW0pkRcnvHxb6bpnZuN3musEuSQOdYDvz4iKWtawM6VIHOvab9ibkM2sQ/Hpt/NSp8dXco69imGEYtM9YxdyEamroOrUk3heQCQHtnolGnto+c29XwzxTJSMqjn8Ko8ctaeubW+MAERf7oLSmRVYmtX63ataeUbpsbonzezbmNW3xdf/YNKkM2fQ6+Ei4TEf3MgBm3luxKvnAkxrG7jZH/743AQTz7ju0yrYRFTBdvSH+TpEQPr6C4ixFifA5m8szggJxFjAKYLuL2vRRBD67URy+vz4kNGPH2P/IGMjJgq6Fa/o6w0dGNn1ae72IhFdeYcMAFPHKo/9YJGvIjuo4stEWHjnTofcmqFjTngiNeADK8NWUHIj9oSwzfntieraENWEC7kBaJvX+FCXkgbsoL+APENFhEdy5OyAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE2LTAzLTEzVDE0OjI0OjIzKzAxOjAwwvAUiQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNi0wMy0xM1QxNDoyNDoyMyswMTowMLOtrDUAAAAASUVORK5CYII=" />',
        FLOWERS:
            '<image width="178" height="128" alt="flowers" xlink:href="data:image/png;base64,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" />',
        TACHO: '<image width="178" height="128" alt="tacho" xlink:href="data:image/png;base64,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" />',
    };

    constructor(id: number, configuration: {}, pose: Pose) {
        super(id, configuration);
        this.transformNewPose(pose, this);
        this.wheelLeft.w = configuration['WHEELDIAMETER'] * 3;
        this.wheelLeft.x = -this.wheelLeft.w / 2;
        this.wheelRight.w = configuration['WHEELDIAMETER'] * 3;
        this.wheelRight.x = -this.wheelRight.w / 2;
        this.wheelLeft.y = (-configuration['TRACKWIDTH'] * 3) / 2 - 4;
        this.wheelRight.y = (configuration['TRACKWIDTH'] * 3) / 2 - 4;
        this.wheelFrontRight.x = this.wheelRight.x + this.wheelRight.w;
        this.wheelFrontRight.y = this.wheelRight.y + this.wheelRight.h;
        this.wheelBackRight.x = this.wheelRight.x;
        this.wheelBackRight.y = this.wheelRight.y + this.wheelRight.h;
        this.wheelFrontLeft.x = this.wheelLeft.x + this.wheelLeft.w;
        this.wheelFrontLeft.y = this.wheelLeft.y;
        this.wheelBackLeft.x = this.wheelLeft.x;
        this.wheelBackLeft.y = this.wheelLeft.y;
        SIMATH.transform(pose, this.wheelFrontRight);
        SIMATH.transform(pose, this.wheelBackRight);
        SIMATH.transform(pose, this.wheelFrontLeft);
        SIMATH.transform(pose, this.wheelBackLeft);
        $('#simRobotContent').append(this.topView);
        $('#brick' + this.id).hide();
        let chassis = this;
        for (let property in this.buttons) {
            let $property = $('#' + property + this.id);
            $property.on('mousedown touchstart', function () {
                chassis.buttons[this.id.replace(/\d+$/, '')] = true;
            });
            $property.on('mouseup touchend', function () {
                chassis.buttons[this.id.replace(/\d+$/, '')] = false;
            });
        }
    }

    private updateButtons(running: boolean, values: any) {
        values.buttons = {};
        values.buttons.any = false;
        values.buttons.Reset = false;
        for (let key in this.buttons) {
            values.buttons[key] = this.buttons[key] === true;
            values.buttons.any = values.buttons.any || this.buttons[key];
        }
    }

    private updateEncoders(running: boolean, values: any) {
        if (running) {
            values.encoder = {};
            values.encoder[this.left.port.toLowerCase()] = this.encoder.left * this.ENC;
            values.encoder[this.right.port.toLowerCase()] = this.encoder.right * this.ENC;
        }
    }
}

export class Led implements IUpdateAction, IDrawable, IReset {
    blink: number = 0;
    blinkColor: string = 'LIGHTGREY';
    color: string = 'LIGHTGREY';
    mode: string;
    r: number = 7;
    timer: number = 0;
    x: number = -10;
    y: number = 0;

    draw(rCtx: CanvasRenderingContext2D, myRobot: BaseMobileRobot): void {
        rCtx.save();
        rCtx.fillStyle = this.color;
        let grd = rCtx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
        grd.addColorStop(0, this.color);
        grd.addColorStop(0.25, this.color);
        grd.addColorStop(1, myRobot.chassis.geom.color);
        rCtx.fillStyle = grd;
        rCtx.beginPath();
        rCtx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        rCtx.fill();
        rCtx.restore();
    }

    public readonly drawPriority: number = 10;

    reset(): void {
        this.color = 'LIGHTGRAY';
        this.mode = C.OFF;
        this.blink = 0;
    }

    updateAction(myRobot: BaseRobot, dt: number, interpreterRunning: boolean): void {
        let led = myRobot.interpreter.getRobotBehaviour().getActionState('led', true);
        if (led) {
            let color = led.color;
            let mode = led.mode;
            if (color) {
                this.color = color.toUpperCase();
                this.blinkColor = color.toUpperCase();
            }
            switch (mode) {
                case C.OFF:
                    this.timer = 0;
                    this.blink = 0;
                    this.color = 'LIGHTGRAY';
                    break;
                case C.ON:
                    this.timer = 0;
                    this.blink = 0;
                    break;
                case C.FLASH:
                    this.blink = 2;
                    break;
                case C.DOUBLE_FLASH:
                    this.blink = 4;
                    break;
            }
        }
        if (this.blink > 0) {
            if (this.timer > 0.5 && this.blink == 2) {
                this.color = this.blinkColor;
            } else if (this.blink == 4 && ((this.timer > 0.5 && this.timer < 0.67) || this.timer > 0.83)) {
                this.color = this.blinkColor;
            } else {
                this.color = 'LIGHTGRAY';
            }
            this.timer += dt;
            if (this.timer > 1.0) {
                this.timer = 0;
            }
        }
        $('#led' + myRobot.id).attr('fill', "url('#" + this.color + myRobot.id + "')");
    }
}

export class TTS implements IUpdateAction {
    language: string = 'en-US';
    speechSynthesis: SpeechSynthesis;
    volume: number = 0.5;

    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        if (!speechSynthesis) {
            console.log(
                'Sorry, but the Speech Synthesis API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox'
            );
        } else {
            //cancel needed so speak works in chrome because it's created already speaking
            this.speechSynthesis.cancel();
        }
    }

    updateAction(myRobot: BaseRobot, dt: number, interpreterRunning: boolean): void {
        this.volume = (myRobot as any).volume || this.volume;
        // update sayText
        this.language = GUISTATE_C.getLanguage(); // reset language
        let language = myRobot.interpreter.getRobotBehaviour().getActionState('language', true);
        if (language !== null && language !== undefined && window.speechSynthesis) {
            this.language = language;
        }
        let sayText = myRobot.interpreter.getRobotBehaviour().getActionState('sayText', true);
        let callBackOnFinished = function () {
            myRobot.interpreter.getRobotBehaviour().setBlocking(false);
        };
        if (sayText && window.speechSynthesis) {
            if (sayText.text !== undefined) {
                this.say(callBackOnFinished, sayText.text, this.language, sayText.speed, sayText.pitch);
            }
        }
    }

    private say(callBackOnFinished: () => void, text: string, lang: string, speed: number, pitch: number) {
        // Prevents an empty string from crashing the simulation
        if (text === '') {
            text = ' ';
        }
        // IE apparently doesn't support default parameters, this prevents it from crashing the whole simulation
        speed = speed === undefined ? 30 : speed;
        pitch = pitch === undefined ? 50 : pitch;
        // Clamp values
        speed = Math.max(0, Math.min(100, speed));
        pitch = Math.max(0, Math.min(100, pitch));
        // Convert to SpeechSynthesis values
        speed = speed * 0.015 + 0.5; // use range 0.5 - 2; range should be 0.1 - 10, but some voices don't accept values beyond 2
        pitch = pitch * 0.02 + 0.001; // use range 0.0 - 2.0; + 0.001 as some voices dont accept 0

        let utterThis: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(text);
        // https://bugs.chromium.org/p/chromium/issues/detail?id=509488#c11
        // Workaround to keep utterance object from being garbage collected by the browser
        window['utterances'] = [];
        window['utterances'].push(utterThis);

        if (lang === '') {
            console.log('Language is not supported!');
        } else {
            let voices: SpeechSynthesisVoice[];
            voices = this.speechSynthesis.getVoices();
            for (let i = 0; i < voices.length; i++) {
                // TODO check substr equivalent
                if (voices[i].lang.indexOf(lang) !== -1 || voices[i].lang.indexOf(lang.substr(0, 2)) !== -1) {
                    utterThis.voice = voices[i];
                    break;
                }
            }
            if (utterThis.voice === null) {
                console.log(
                    'Language "' +
                        lang +
                        '" could not be found. Try a different browser or for chromium add the command line flag "--enable-speech-dispatcher".'
                );
            }
        }
        utterThis.pitch = pitch;
        utterThis.rate = speed;
        utterThis.volume = this.volume;
        utterThis.onend = function (e) {
            callBackOnFinished();
        };
        //does not work for volume = 0 thus workaround with if statement
        if (this.volume != 0) {
            this.speechSynthesis.speak(utterThis);
        } else {
            callBackOnFinished();
        }
    }
}

export class WebAudio implements IUpdateAction {
    context: AudioContext;
    gainNode: GainNode;
    tone = {
        duration: 0,
        timer: 0,
        file: {
            0: function (webAudio: WebAudio, osci: OscillatorNode) {
                let ct = webAudio.context.currentTime;
                osci.frequency.setValueAtTime(600, ct);
                osci.start(ct);
                osci.stop(ct + 200 / 1000);
            },
            1: function (webAudio: WebAudio, osci: OscillatorNode) {
                let ct = webAudio.context.currentTime;
                osci.frequency.setValueAtTime(600, ct);
                osci.start(ct);
                webAudio.gainNode.gain.setValueAtTime(0, ct + 200 / 1000);
                webAudio.gainNode.gain.setValueAtTime(webAudio.volume, ct + 300 / 1000);
                osci.stop(ct + 500 / 1000);
            },
            2: function (webAudio: WebAudio, osci: OscillatorNode) {
                let frequency = 300;
                let ct = webAudio.context.currentTime;
                osci.start(ct);
                for (let i = 0; i < 4; i++) {
                    osci.frequency.setValueAtTime(frequency + i * 200, ct + (i * 300) / 1000);
                    webAudio.gainNode.gain.setValueAtTime(0, ct + (i * 300 + 200) / 1000);
                    webAudio.gainNode.gain.setValueAtTime(webAudio.volume, ct + (i * 300) / 1000);
                }
                osci.stop(ct + 1100 / 1000);
            },
            3: function (webAudio: WebAudio, osci: OscillatorNode) {
                let frequency = 700;
                let ct = webAudio.context.currentTime;
                osci.start(ct);
                for (let i = 0; i < 4; i++) {
                    osci.frequency.setValueAtTime(frequency - i * 200, ct + (i * 300) / 1000);
                    webAudio.gainNode.gain.setValueAtTime(0, ct + (i * 300 + 200) / 1000);
                    webAudio.gainNode.gain.setValueAtTime(webAudio.volume, ct + (i * 300) / 1000);
                }
                osci.stop(ct + 1100 / 1000);
            },
            4: function (webAudio: WebAudio, osci: OscillatorNode) {
                let ct = webAudio.context.currentTime;
                osci.frequency.setValueAtTime(200, ct);
                osci.start(ct);
                osci.stop(ct + 200 / 1000);
            },
        },
    };
    volume: number = 0.5;

    constructor() {
        let AudioContext: any = window.AudioContext || (window as any).webkitAudioContext || null;
        if (AudioContext) {
            this.context = new AudioContext();
            this.gainNode = this.context.createGain();
        } else {
            console.log(
                'Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox'
            );
        }
    }

    updateAction(myRobot: BaseRobot, dt: number, interpreterRunning: boolean): void {
        this.volume = (myRobot as any).volume || this.volume;
        let tone: any = myRobot.interpreter.getRobotBehaviour().getActionState('tone', true);
        if (tone && this.context) {
            let callBackOnFinished = function () {
                myRobot.interpreter.getRobotBehaviour().setBlocking(false);
            };
            this.playTone(callBackOnFinished, tone);
        }
    }

    private playTone(callBackOnFinished: () => void, tone: any): void {
        let cT = this.context.currentTime;
        this.gainNode.gain.value = this.volume;
        let oscillator = this.context.createOscillator();
        oscillator.type = 'square';
        //applies gain to Sound
        oscillator.connect(this.gainNode).connect(this.context.destination);
        let myAudio = this;
        oscillator.onended = function (e) {
            oscillator.disconnect(myAudio.gainNode);
            myAudio.gainNode.disconnect(myAudio.context.destination);
            callBackOnFinished();
        };
        if (tone.frequency && tone.duration > 0) {
            oscillator.frequency.value = tone.frequency;
            oscillator.start(cT);
            oscillator.stop(cT + tone.duration / 1000.0);
        } else if (tone.file !== undefined) {
            this.tone.file[tone.file](this, oscillator);
        } else {
            callBackOnFinished();
        }
    }
}
