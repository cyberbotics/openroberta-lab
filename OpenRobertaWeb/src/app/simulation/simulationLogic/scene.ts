/**
 * @fileOverview Scene for a robot simulation
 * @author Beate Jost <beate.jost@iais.fraunhofer.de>
 */
import * as UTIL from 'util';
import * as $ from 'jquery';
import { BaseSimulationObject, Ground, ISimulationObstacle, RectangleSimulationObject, Ruler, SimObjectFactory, SimObjectShape, SimObjectType } from './simulation.objects';
import { Simulation } from 'simulation.simulation';
import { BaseRobot, IDestroyable, RobotFactory } from './BaseRobot';
import { Interpreter } from 'interpreter.interpreter';
import { BaseMobileRobot, Pose } from './BaseMobileRobot';
import * as C from 'interpreter.constants';

/**
 * Creates a new Scene.
 *
 * @constructor
 */
export class Scene {
    backgroundImg: any;
    customBackgroundLoaded: boolean = false;
    ground: Ground = new Ground(0, 0, 0, 0);
    images: {};
    imgBackgroundList: any[] = [];
    imgList = ['simpleBackground.svg', 'drawBackground.svg', 'robertaBackground.svg', 'rescueBackground.svg', 'blank.svg', 'mathBackground.svg'];
    imgListIE = ['simpleBackground.png', 'drawBackground.png', 'robertaBackground.png', 'rescueBackground.png', 'blank.png', 'mathBackground.png'];
    imgPath = '/js/app/simulation/simBackgrounds/';
    objectToCopy: BaseSimulationObject;
    playground = {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
    };
    ruler: Ruler;
    sim: Simulation;
    readonly uCanvas: HTMLCanvasElement;
    private _colorAreaList: BaseSimulationObject[] = [];
    private _obstacleList: BaseSimulationObject[] = [];
    private _redrawColorAreas: boolean = false;
    private _redrawObstacles: boolean = false;
    private _redrawRuler: boolean = false;
    private _robots: BaseRobot[] = [];
    private _uniqueObjectId = 1;
    private readonly bCtx: CanvasRenderingContext2D;
    private currentBackground: number;
    private dCtx: CanvasRenderingContext2D;
    private readonly mCtx: CanvasRenderingContext2D;
    private readonly oCtx: CanvasRenderingContext2D;
    private readonly rCtx: CanvasRenderingContext2D;
    private robotClass;
    private robotType: string;
    private readonly uCtx: CanvasRenderingContext2D;
    private udCanvas: HTMLCanvasElement;
    private readonly udCtx: CanvasRenderingContext2D;

    constructor(sim: Simulation) {
        this.sim = sim;
        this.uCanvas = document.createElement('canvas');
        this.uCtx = this.uCanvas.getContext('2d'); // unit context
        this.udCanvas = document.createElement('canvas');
        this.udCtx = this.udCanvas.getContext('2d'); // unit context
        this.bCtx = ($('#backgroundLayer')[0] as HTMLCanvasElement).getContext('2d'); // background context
        this.dCtx = ($('#drawLayer')[0] as HTMLCanvasElement).getContext('2d'); // background context
        this.mCtx = ($('#rulerLayer')[0] as HTMLCanvasElement).getContext('2d'); // ruler == *m*easurement context
        this.oCtx = ($('#objectLayer')[0] as HTMLCanvasElement).getContext('2d'); // object context
        this.rCtx = ($('#robotLayer')[0] as HTMLCanvasElement).getContext('2d'); // robot context
    }

    get uniqueObjectId(): number {
        return this._uniqueObjectId;
    }

    get robots(): BaseRobot[] {
        return this._robots;
    }

    set robots(value: BaseRobot[]) {
        this.clearList(this._robots);
        this._robots = value;
    }

    get obstacleList(): BaseSimulationObject[] {
        return this._obstacleList;
    }

    set obstacleList(value: BaseSimulationObject[]) {
        this.clearList(this._obstacleList);
        this._obstacleList = value;
        this.redrawObstacles = true;
    }

    get colorAreaList(): BaseSimulationObject[] {
        return this._colorAreaList;
    }

    set colorAreaList(value: BaseSimulationObject[]) {
        this.clearList(this._colorAreaList);
        this._colorAreaList = value;
        this.redrawColorAreas = true;
    }

    get redrawObstacles(): boolean {
        return this._redrawObstacles;
    }

    set redrawObstacles(value: boolean) {
        this._redrawObstacles = value;
    }

    get redrawColorAreas(): boolean {
        return this._redrawColorAreas;
    }

    set redrawColorAreas(value: boolean) {
        this._redrawColorAreas = value;
    }

    get redrawRuler(): boolean {
        return this._redrawRuler;
    }

    set redrawRuler(value: boolean) {
        this._redrawRuler = value;
    }

    addColorArea(shape: SimObjectShape) {
        this.addSimulationObject(this.colorAreaList, shape, SimObjectType.ColorArea);
        this.redrawColorAreas = true;
    }

    addImportColorAreaList(importColorAreaList: any[]) {
        let newColorAreaList = [];
        importColorAreaList.forEach((obj) => {
            let newObject = SimObjectFactory.getSimObject(
                obj.id,
                this,
                this.sim.selectionListener,
                obj.shape,
                SimObjectType.ColorArea,
                obj.p,
                obj.color,
                ...obj.params
            );
            newColorAreaList.push(newObject);
        });
        this.colorAreaList = newColorAreaList;
    }

    addImportObstacle(importObstacleList: any[]) {
        let newObstacleList = [];
        importObstacleList.forEach((obj) => {
            let newObject = SimObjectFactory.getSimObject(
                obj.id,
                this,
                this.sim.selectionListener,
                obj.shape,
                SimObjectType.Obstacle,
                obj.p,
                obj.color,
                ...obj.params
            );
            newObstacleList.push(newObject);
        });
        this.obstacleList = newObstacleList;
    }

    addObstacle(shape: SimObjectShape) {
        this.addSimulationObject(this.obstacleList, shape, SimObjectType.Obstacle);
        this.redrawObstacles = true;
    }

    addSimulationObject(list: BaseSimulationObject[], shape: SimObjectShape, type: SimObjectType) {
        let $robotLayer = $('#robotLayer');
        $robotLayer.attr('tabindex', 0);
        $robotLayer.trigger('focus');
        let x = Math.random() * (this.ground['w'] - 300) + 100;
        let y = Math.random() * (this.ground['h'] - 200) + 100;
        let newObject = SimObjectFactory.getSimObject(this.uniqueObjectId, this, this.sim.selectionListener, shape, type, {
            x: x,
            y: y,
        });
        list.push(newObject);
        newObject.selected = true;
    }

    changeColorWithColorPicker(color) {
        let objectList: BaseSimulationObject[] = this.obstacleList.concat(this.colorAreaList); // >= 0 ? obstacleList[selectedObstacle] : selectedColorArea >= 0 ? colorAreaList[selectedColorArea] : null;
        let myObj: BaseSimulationObject[] = objectList.filter((obj) => obj.selected);
        if (myObj.length == 1) {
            myObj[0].color = color;
            if (myObj[0].type === SimObjectType.Obstacle) {
                this.redrawObstacles = true;
            } else {
                this.redrawColorAreas = true;
            }
        }
    }

    /**
     * Call destroy() for all items in the list
     * @param myList
     */
    clearList(myList: IDestroyable[]) {
        myList.forEach((obj) => {
            obj.destroy();
        });
        myList.length = 0;
    }

    deleteSelectedObject() {
        let scene = this;
        function findAndDelete(list: BaseSimulationObject[]) {
            for (let i = 0; i < list.length; i++) {
                if (list[i].selected) {
                    list[i].destroy();
                    list.splice(i, 1);
                    scene.redrawObstacles = true;
                    return true;
                }
            }
            return false;
        }

        if (!findAndDelete(this.obstacleList)) {
            if (findAndDelete(this.colorAreaList)) {
                this.redrawColorAreas = true;
            }
        } else {
            this.redrawObstacles = true;
        }
    }

    draw(dt, interpreterRunning: boolean) {
        this.rCtx.save();
        this.rCtx.scale(this.sim.scale, this.sim.scale);
        this.rCtx.clearRect(this.ground.x - 10, this.ground.y - 10, this.ground.w + 20, this.ground.h + 20);
        this.dCtx.save();
        this.dCtx.scale(this.sim.scale, this.sim.scale);
        this.robots.forEach((robot) => {
            //const current = this.sim.getRobotIndex() === r;
            //if (current) {
            robot.draw(this.rCtx, dt);
            if (robot instanceof BaseMobileRobot && interpreterRunning) {
                (robot as BaseMobileRobot).drawTrail(this.dCtx, this.udCtx, C.DEFAULT_TRAIL_WIDTH, C.DEFAULT_TRAIL_COLOR);
            }
        });
        if (this.redrawColorAreas) {
            this.drawColorAreas();
            this.redrawColorAreas = false;
        }
        if (this.redrawObstacles) {
            this.drawObstacles();
            this.redrawObstacles = false;
        }
        if (this.redrawRuler) {
            this.drawRuler();
            this.redrawRuler = false;
        }
        this.rCtx.restore();
        this.dCtx.restore();
    }

    drawColorAreas() {
        let w = this.backgroundImg.width + 20;
        let h = this.backgroundImg.height + 20;
        this.uCtx.clearRect(0, 0, w, h);
        this.uCtx.drawImage(this.backgroundImg, 10, 10, this.backgroundImg.width, this.backgroundImg.height);
        this.drawPattern(this.uCtx);
        this.bCtx.restore();
        this.bCtx.save();
        this.bCtx.scale(this.sim.scale, this.sim.scale);
        this.bCtx.clearRect(this.ground.x - 10, this.ground.y - 10, this.ground.w + 20, this.ground.h + 20);
        this.bCtx.drawImage(this.uCanvas, 0, 0, w, h, 0, 0, w, h);
        this.colorAreaList.forEach((colorArea) => colorArea.draw(this.bCtx, this.uCtx, this.mCtx));
    }

    drawObstacles() {
        this.oCtx.restore();
        this.oCtx.save();
        this.oCtx.scale(this.sim.scale, this.sim.scale);
        this.oCtx.clearRect(this.ground.x - 10, this.ground.y - 10, this.ground.w + 20, this.ground.h + 20);
        this.obstacleList.forEach((obstacle) => obstacle.draw(this.oCtx, this.uCtx, this.mCtx));
    }

    drawPattern(ctx) {
        ctx.beginPath();
        let patternImg = this.images['pattern'];
        ctx.strokeStyle = ctx.createPattern(patternImg, 'repeat');
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, this.backgroundImg.width + 10, this.backgroundImg.height + 10);
    }

    drawRuler() {
        this.mCtx.restore();
        this.mCtx.save();
        this.mCtx.scale(this.sim.scale, this.sim.scale);
        this.mCtx.clearRect(this.ground.x - 10, this.ground.y - 10, this.ground.w + 20, this.ground.h + 20);
        this.mCtx.drawImage(this.ruler.img, this.ruler.x, this.ruler.y, this.ruler.w, this.ruler.h);
    }

    getRobotPoses(): Pose[] {
        return this.robots.map((robot) => {
            return (robot as BaseMobileRobot).pose;
        });
    }

    handleKeyEvent(e) {
        if (e.key === 'v' && e.ctrlKey) {
            this.pasteObject(this.sim.lastMousePosition);
            e.stopImmediatePropagation();
        }
        if (e.key === 'Delete' || e.key.toLowerCase() === 'Backspace') {
            this.deleteSelectedObject();
            e.stopImmediatePropagation();
        }
    }

    init(robotType: string, refresh: boolean, interpreters: Interpreter[], configurations: object[], savedNames: string[]) {
        let switchRobot: boolean = !this.robotType || this.robotType != robotType;
        this.robotType = robotType;
        let scene = this;
        if (refresh) {
            this.robots = [];
            // run with a different robot type or different number of robots
            RobotFactory.createRobots(interpreters, configurations, savedNames, this.sim.selectionListener, this.robotType)
                .then((result) => {
                    this.robots = result.robots;
                    this.robotClass = result.robotClass;
                    this.initViews();
                    if (switchRobot) {
                        scene.currentBackground = 0;
                        let imgType = '.svg';
                        if (UTIL.isIE()) {
                            imgType = '.png';
                        }
                        scene.images = this.loadImages(
                            ['roadWorks', 'pattern', 'ruler'],
                            ['roadWorks' + imgType, 'wallPattern.png', 'ruler' + imgType],
                            function () {
                                scene.loadBackgroundImages(function () {
                                    if (UTIL.isIE() || UTIL.isEdge()) {
                                        // TODO IE and Edge: Input event not firing for file type of input
                                        $('.dropdown.sim, .simScene, #simEditButtons').show();
                                        $('#simImport').hide();
                                    } else {
                                        $('.dropdown.sim, .simScene, #simImport, #simResetPose, #simEditButtons').show();
                                    }
                                    scene.ground = new Ground(
                                        10,
                                        10,
                                        scene.imgBackgroundList[scene.currentBackground].width,
                                        scene.imgBackgroundList[scene.currentBackground].height
                                    );
                                    scene.ruler = new Ruler(
                                        1,
                                        scene,
                                        scene.sim.selectionListener,
                                        SimObjectType.Passiv,
                                        { x: 430, y: 400 },
                                        scene.images['ruler'],
                                        ...[300, 30]
                                    );
                                    let standardObstacle = new RectangleSimulationObject(
                                        0,
                                        scene,
                                        scene.sim.selectionListener,
                                        SimObjectType.Obstacle,
                                        { x: 580, y: 290 },
                                        null,
                                        ...[100, 100]
                                    );
                                    scene.obstacleList.push(standardObstacle);
                                    $('#simDiv>.pace').fadeOut('fast');
                                    scene.resetAllCanvas(scene.imgBackgroundList[0]);
                                    scene.resizeAll();
                                    scene.initEvents();
                                    scene.sim.initColorPicker(scene.robotClass.default.colorRange);
                                });
                            }
                        );
                    }
                })
                .then(() => this.sim.start());
        } else {
            // rerun the (updated) program
            this.robots.forEach((robot, index) => {
                robot.replaceState(interpreters[index]);
                robot.reset();
            });
            //this.sim.cancel(false);
        }
    }

    private initViews() {
        $('#constantValue').html('');
        if (this.robots.length > 1) {
            let robotIndexColour = '';
            robotIndexColour += '<select id="robotIndex" style="background-color:' + (this.robots[0] as BaseMobileRobot).chassis.geom.color + '">';
            this.robots.forEach((robot) => {
                robotIndexColour +=
                    '<option style="background-color:' + (robot as BaseMobileRobot).chassis.geom.color + '" value="' + robot.id + '">&nbsp' + '</option>';
            });
            robotIndexColour += '</select>';
            $('#constantValue').append('<div><label id="robotLabel">Robot</label><span style="width:auto">' + robotIndexColour + '</span></div>');
        } else {
            //remove if there is only one robot
            $('#robotLabel').remove();
            $('#robotIndex').remove();
        }
    }

    initEvents() {
        $(window).off('resize.sim');
        $(window).on('resize.sim', () => {
            this.resizeAll();
        });
        $('#robotLayer').off('keydown.sim');
        $('#robotLayer').on('keydown.sim', this.handleKeyEvent.bind(this));
        $('#robotLayer').on('keydown', this.handleKeyEvent.bind(this));
    }

    loadBackgroundImages(callback) {
        if (UTIL.isIE()) {
            this.imgList = this.imgListIE;
        }
        let numLoading = this.imgList.length;
        let scene = this;
        const onload = function () {
            if (--numLoading === 0) {
                callback();
                if (UTIL.isLocalStorageAvailable()) {
                    let customBackground = localStorage.getItem('customBackground');
                    if (customBackground) {
                        // TODO backwards compatibility for non timestamped background images; can be removed after some time
                        try {
                            JSON.parse(customBackground);
                        } catch (e) {
                            localStorage.setItem(
                                'customBackground',
                                JSON.stringify({
                                    image: customBackground,
                                    timestamp: new Date().getTime(),
                                })
                            );
                            customBackground = localStorage.getItem('customBackground');
                        }

                        let jsonCustomBackground = JSON.parse(customBackground);
                        // remove images older than 30 days
                        let currentTimestamp = new Date().getTime();
                        if (currentTimestamp - jsonCustomBackground.timestamp > 63 * 24 * 60 * 60 * 1000) {
                            localStorage.removeItem('customBackground');
                        } else {
                            // add image to backgrounds if recent
                            let dataImage = jsonCustomBackground.image;
                            let customImage = new Image();
                            customImage.src = 'data:image/png;base64,' + dataImage;
                            scene.imgBackgroundList.push(customImage);
                            scene.customBackgroundLoaded = true;
                        }
                    }
                }
            }
        };
        let i = 0;
        while (i < this.imgList.length) {
            const img = (this.imgBackgroundList[i] = new Image());
            img.onload = onload;
            img.onerror = function (e) {
                console.error(e);
            };
            img.src = this.imgPath + this.imgList[i++];
        }
    }

    loadImages(names, files, onAllLoaded) {
        let i = 0;
        let numLoading = names.length;
        const onload = function () {
            --numLoading === 0 && onAllLoaded();
        };
        const images = {};
        while (i < names.length) {
            const img = (images[names[i]] = new Image());
            img.onload = onload;
            img.onerror = function (e) {
                console.error(e);
            };
            img.src = this.imgPath + files[i++];
        }
        return images;
    }

    pasteObject(lastMousePosition: Point) {
        if (this.objectToCopy) {
            let newObject = SimObjectFactory.copy(this.objectToCopy);
            newObject.moveTo(lastMousePosition);
            if (this.objectToCopy.type === SimObjectType.Obstacle) {
                this.obstacleList.push(newObject);
                this.redrawObstacles = true;
            } else if (this.objectToCopy.type === SimObjectType.ColorArea) {
                this.colorAreaList.push(newObject);
                this.redrawColorAreas = true;
            }
        }
    }

    resetAllCanvas(opt_img?) {
        let resetUnified = false;
        if (opt_img) {
            this.backgroundImg = opt_img;
            resetUnified = true;
        }
        let sc = this.sim.scale;
        let left = (this.playground.w - (this.backgroundImg.width + 20) * sc) / 2.0;
        let top = (this.playground.h - (this.backgroundImg.height + 20) * sc) / 2.0;
        let w = Math.round((this.backgroundImg.width + 20) * sc);
        let h = Math.round((this.backgroundImg.height + 20) * sc);
        if ($('#simDiv').hasClass('shifting') && $('#simDiv').hasClass('rightActive')) {
            $('#canvasDiv').css({
                top: top + 'px',
                left: left + 'px',
            });
        }
        let scene = this;
        this.oCtx.canvas.width = w;
        this.oCtx.canvas.height = h;
        this.rCtx.canvas.width = w;
        this.rCtx.canvas.height = h;
        this.dCtx.canvas.width = w;
        this.dCtx.canvas.height = h;
        this.bCtx.canvas.width = w;
        this.bCtx.canvas.height = h;
        this.mCtx.canvas.width = w;
        this.mCtx.canvas.height = h;
        if (resetUnified) {
            this.uCanvas.width = this.backgroundImg.width + 20;
            this.uCanvas.height = this.backgroundImg.height + 20;
            this.udCanvas.width = this.backgroundImg.width + 20;
            this.udCanvas.height = this.backgroundImg.height + 20;
            this.uCtx.drawImage(this.backgroundImg, 10, 10, this.backgroundImg.width, this.backgroundImg.height);
            this.drawPattern(this.uCtx);
        }
        this.bCtx.restore();
        this.bCtx.save();
        this.bCtx.drawImage(this.uCanvas, 0, 0, this.backgroundImg.width + 20, this.backgroundImg.height + 20, 0, 0, w, h);
        this.dCtx.restore();
        this.dCtx.save();
        this.dCtx.drawImage(this.udCanvas, 0, 0, this.backgroundImg.width + 20, this.backgroundImg.height + 20, 0, 0, w, h);
        this.drawColorAreas();
        this.drawObstacles();
        if (this.currentBackground == 2) {
            this.redrawRuler = true;
        }
    }

    resizeAll() {
        // only when opening the sim view we want to calculate the offsets and scale
        if ($('#simDiv').hasClass('shifting') && $('#simButton').hasClass('rightActive')) {
            let $simDiv = $('#simDiv');
            let canvasOffset = $simDiv.offset();
            let offsetY = canvasOffset.top;
            this.playground.w = $simDiv.outerWidth();
            this.playground.h = $(window).height() - offsetY;
            let scaleX = this.playground.w / (this.ground.w + 20);
            let scaleY = this.playground.h / (this.ground.h + 20);
            this.sim.scale = Math.min(scaleX, scaleY) - 0.05;
            $('#canvasDiv canvas').each((canvas) => {
                $('#canvasDiv canvas')[canvas].style.top = '0px';
                $('#canvasDiv canvas')[canvas].style.left = '0px';
            });
            this.resetAllCanvas();
        }
    }

    setRobotPoses(importPoses: any[]) {
        importPoses.forEach((pose, index) => {
            if (this.robots[index]) {
                let newPose = new Pose(pose.x, pose.y, pose.theta);
                (this.robots[index] as BaseMobileRobot).pose = newPose;
                (this.robots[index] as BaseMobileRobot).initialPose = newPose;
            }
        });
    }

    stepBackground(num: number) {
        if (this.currentBackground == 2) {
            this.ruler.removeMouseEvents();
            let myObstacle: BaseSimulationObject = this.obstacleList.find((obstacle) => obstacle.myId === 0);
            if (myObstacle) {
                (myObstacle as RectangleSimulationObject).img = null;
            }
        }
        let configData = this.sim.getConfigData();
        this.obstacleList = [];
        this.colorAreaList = [];
        if (num < 0) {
            this.currentBackground++;
            this.currentBackground %= this.imgBackgroundList.length;
        } else {
            this.currentBackground = num;
        }
        if (this.currentBackground == 2) {
            this.ruler.addMouseEvents();
            let myObstacle: BaseSimulationObject = this.obstacleList.find((obstacle) => obstacle.myId === 0);
            if (myObstacle) {
                (myObstacle as RectangleSimulationObject).img = this.images['roadWorks'];
            }
        }
        this.ground.w = this.imgBackgroundList[this.currentBackground].width;
        this.ground.h = this.imgBackgroundList[this.currentBackground].height;
        this.resetAllCanvas(this.imgBackgroundList[this.currentBackground]);
        this.resizeAll();
        this.sim.setNewConfig(configData);
    }

    update(dt: number, interpreterRunning: boolean) {
        let personalObstacleList: ISimulationObstacle[] = this.obstacleList.slice();
        this.robots.forEach((robot) => personalObstacleList.push((robot as BaseMobileRobot).chassis as unknown as ISimulationObstacle));
        personalObstacleList.push(this.ground as ISimulationObstacle);
        this.robots.forEach((robot) => robot.updateActions(robot, dt, interpreterRunning));
        this.robots.forEach((robot) => (robot as BaseMobileRobot).updateSensors(interpreterRunning, dt, this.uCtx, this.udCtx, personalObstacleList));
        this.draw(dt, interpreterRunning);
    }

    toggleTrail() {
        this.robots.forEach((robot) => {
            (robot as BaseMobileRobot).hasTrail = !(robot as BaseMobileRobot).hasTrail;
            (robot as BaseMobileRobot).pose.xOld = (robot as BaseMobileRobot).pose.x;
            (robot as BaseMobileRobot).pose.yOld = (robot as BaseMobileRobot).pose.y;
        });
    }

    resetPoseAndDrawings() {
        this.robots.forEach((robot) => (robot as BaseMobileRobot).resetPose());
        this.dCtx.canvas.width = this.dCtx.canvas.width;
        this.udCtx.canvas.width = this.udCtx.canvas.width;
    }
}
