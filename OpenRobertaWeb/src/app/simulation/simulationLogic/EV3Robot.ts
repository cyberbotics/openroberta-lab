import { BaseMobileRobot, Pose } from './BaseMobileRobot';
import { ColorSensor, DistanceSensor, GyroSensor, Timer, TouchSensor } from 'robot.sensors';
import { ChassisDiffDrive, EV3Chassis, Led, TTS, WebAudio } from './robot.actuators';
import { BaseRobot, SelectionListener } from './BaseRobot';
import { Interpreter } from 'interpreter.interpreter';

export default class EV3Robot extends BaseMobileRobot {
    chassis: ChassisDiffDrive;
    led: Led = new Led();
    volume: number = 50;
    tts: TTS = new TTS();
    webAudio: WebAudio = new WebAudio();
    override timer: Timer = new Timer(5);
    static colorRange = ['#000000', '#0056a6', '#00642f', '#532115', '#585858', '#b30006', '#f7e307'];

    constructor(id: number, configuration: object, interpreter: Interpreter, savedName: string, myListener: SelectionListener) {
        super(id, configuration, interpreter, savedName, myListener);
        this.chassis = new EV3Chassis(this.id, configuration, this.pose);
        this.configure(configuration['SENSORS']);
        //M.display(M.maze(8, 8));
    }

    override updateActions(robot: BaseRobot, dt, interpreterRunning: boolean): void {
        super.updateActions(robot, dt, interpreterRunning);
        let volume = this.interpreter.getRobotBehaviour().getActionState('volume', true);
        if (volume || volume === 0) {
            this.volume = volume / 100.0;
        }
    }

    override reset() {
        super.reset();
        this.volume = 50;
    }

    // this method might go up to BaseMobileRobots as soon as the configuration has detailed information about the sensors geometry and location on the robot
    protected configure(sensors: object): void {
        for (const c in sensors) {
            switch (sensors[c]) {
                case 'TOUCH':
                    // only one is drawable as bumper
                    this[c] = new TouchSensor(c, 25, 0, this.chassis.geom.color);
                    break;
                case 'GYRO':
                    // only one is usable
                    this[c] = new GyroSensor(c, 0, 0, 0);
                    break;
                case 'COLOR':
                    let myColorSensors = [];
                    let ev3 = this;
                    Object.keys(this).forEach((x) => {
                        if (ev3[x] && ev3[x] instanceof ColorSensor) {
                            myColorSensors.push(ev3[x]);
                        }
                    });
                    const ord = myColorSensors.length + 1;
                    const id = Object.keys(sensors).filter((type) => sensors[type] == 'COLOR').length;
                    let y = ord * 10 - 5 * (id + 1);
                    this[c] = new ColorSensor(c, 15, y, 0, 5, 'Color Sensor');
                    break;
                case 'ULTRASONIC': {
                    let myUltraSensors = [];
                    let ev3 = this;
                    Object.keys(this).forEach((x) => {
                        if (ev3[x] && ev3[x] instanceof DistanceSensor) {
                            myUltraSensors.push(ev3[x]);
                        }
                    });
                    const ord = myUltraSensors.length + 1;
                    const num = Object.keys(sensors).filter((type) => sensors[type] == 'ULTRASONIC').length;
                    let position: Pose = new Pose(this.chassis.geom.h / 2, 0, 0);
                    if (num == 3) {
                        if (ord == 1) {
                            position = new Pose(this.chassis.geom.h / 2, -this.chassis.geom.h / 2, -Math.PI / 4);
                        } else if (ord == 2) {
                            position = new Pose(this.chassis.geom.h / 2, this.chassis.geom.h / 2, Math.PI / 4);
                        }
                    } else if (num % 2 === 0) {
                        switch (ord) {
                            case 0:
                                position = new Pose(this.chassis.geom.h / 2, -this.chassis.geom.h / 2, -Math.PI / 4);
                                break;
                            case 1:
                                position = new Pose(this.chassis.geom.h / 2, this.chassis.geom.h / 2, Math.PI / 4);
                                break;
                            case 2:
                                position = new Pose(this.chassis.geom.x, -this.chassis.geom.h / 2, (-3 * Math.PI) / 4);
                                break;
                            case 3:
                                position = new Pose(this.chassis.geom.x, this.chassis.geom.h / 2, (3 * Math.PI) / 4);
                                break;
                        }
                    }
                    this[c] = new DistanceSensor(c, position.x, position.y, position.theta, 255, 'Ultra Sensor');
                    break;
                }
                case 'INFRARED': {
                    let myInfraSensors = [];
                    let ev3 = this;
                    Object.keys(this).forEach((x) => {
                        if (ev3[x] && ev3[x] instanceof DistanceSensor) {
                            myInfraSensors.push(ev3[x]);
                        }
                    });
                    const ord = myInfraSensors.length + 1;
                    const num = Object.keys(sensors).filter((type) => sensors[type] == 'INFRARED').length;
                    let position: Pose = new Pose(this.chassis.geom.h / 2, 0, 0);
                    if (num == 3) {
                        if (ord == 1) {
                            position = new Pose(this.chassis.geom.h / 2, -this.chassis.geom.h / 2, -Math.PI / 4);
                        } else if (ord == 2) {
                            position = new Pose(this.chassis.geom.h / 2, this.chassis.geom.h / 2, Math.PI / 4);
                        }
                    } else if (num % 2 === 0) {
                        switch (ord) {
                            case 0:
                                position = new Pose(this.chassis.geom.h / 2, -this.chassis.geom.h / 2, -Math.PI / 4);
                                break;
                            case 1:
                                position = new Pose(this.chassis.geom.h / 2, this.chassis.geom.h / 2, Math.PI / 4);
                                break;
                            case 2:
                                position = new Pose(this.chassis.geom.x, -this.chassis.geom.h / 2, (-3 * Math.PI) / 4);
                                break;
                            case 3:
                                position = new Pose(this.chassis.geom.x, this.chassis.geom.h / 2, (3 * Math.PI) / 4);
                                break;
                        }
                    }
                    this[c] = new DistanceSensor(c, position.x, position.y, position.theta, 70, 'IR Sensor');
                    break;
                }
            }
        }
    }
}
