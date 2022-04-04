/**
 * @fileOverview Simulate a robot
 * @author Beate Jost <beate.jost@iais.fraunhofer.de>
 */

import * as C from 'interpreter.constants';
import * as UTIL from 'util';
import * as SIM_I from 'interpreter.interpreter';
import { Interpreter } from 'interpreter.interpreter';
import * as ROBOT_B from 'interpreter.robotSimBehaviour';
// @ts-ignore
import * as Volume from 'volume-meter';
import * as MSG from 'message';
import * as $ from 'jquery';
// @ts-ignore
import * as HUEBEE from 'huebee';
// @ts-ignore
import * as Blockly from 'blockly';
import * as NN_CTRL from 'nn.controller';
import { Scene } from 'simulation.scene';
import { SelectionListener } from './BaseRobot';
import { BaseSimulationObject, CircleSimulationObject, RectangleSimulationObject, SimObjectShape, TriangleSimulationObject } from './simulation.objects';
import { Pose } from './BaseMobileRobot';

export class Simulation {
    private static _instance: Simulation;
    public canceled: boolean = true;
    private scene: Scene;
    private observers: MutationObserver[] = [];
    private numRobots: number = 0;
    private colorpicker: HUEBEE;
    private globalID: number = 0;
    private info: boolean = false;
    private debugMode: boolean = false;
    private stepCounter: number;
    private dist: number = 0;
    private storedPrograms: object[];

    public static get Instance() {
        if (!this._instance) {
            this._instance = new this();
            this._instance._selectionListener = new SelectionListener();
            this._instance.scene = new Scene(this._instance);
            this._instance.initEvents();
        }
        return this._instance;
    }

    private _lastMousePosition: Point;
    private _oldMousePosition: Point;

    get lastMousePosition(): Point {
        return this._lastMousePosition;
    }

    set lastMousePosition(value: Point) {
        this._lastMousePosition = value;
    }

    get oldMousePosition(): Point {
        return this._oldMousePosition;
    }

    set oldMousePosition(value: Point) {
        this._oldMousePosition = value;
    }

    private _selectionListener: SelectionListener;

    get selectionListener(): SelectionListener {
        return this._selectionListener;
    }

    private _renderUntil: number[] = [];

    get renderUntil(): number[] {
        return this._renderUntil;
    }

    private _breakpoints: object[] = [];

    get breakpoints(): any[] {
        return this._breakpoints;
    }

    set breakpoints(value: any[]) {
        this._breakpoints = value;
    }

    private _interpreters: Interpreter[] = [];

    get interpreters(): Interpreter[] {
        return this._interpreters;
    }

    set interpreters(value: Interpreter[]) {
        this._interpreters = value;
        this.numRobots = this._interpreters.length;
    }

    private _time = new Date().getTime();

    get time(): number {
        return this._time;
    }

    set time(value: number) {
        this._time = value;
    }

    private _renderTime = 5; // approx. time in ms only for the first rendering

    get renderTime(): number {
        return this._renderTime;
    }

    set renderTime(value: number) {
        this._renderTime = value;
    }

    private _dt = 0;

    get dt(): number {
        return this._dt;
    }

    set dt(value: number) {
        this._dt = value;
    }

    private _scale: number = 1;

    get scale(): number {
        return this._scale;
    }

    set scale(value: number) {
        this._scale = value;
    }

    private _interpreterRunning: boolean = false;

    get interpreterRunning(): boolean {
        return this._interpreterRunning;
    }

    set interpreterRunning(value: boolean) {
        this._interpreterRunning = value;
    }

    init(programs, refresh: boolean, robotType: string) {
        this.storedPrograms = programs;
        this.resetRenderUntil(programs.length);
        let configurations: object[] = [];
        this.interpreters = programs.map((x) => {
            let src = JSON.parse(x.javaScriptProgram);
            configurations.push(x.configuration);
            return new SIM_I.Interpreter(src, new ROBOT_B.RobotSimBehaviour(), this.callbackOnTermination.bind(this), this.breakpoints, x.savedName);
        });
        this.updateDebugMode(this.debugMode);
        let programNames = programs.map((x) => x.savedName);
        this.scene.init(robotType, refresh, this.interpreters, configurations, programNames);
        this.disableChangeObjectButtons();
    }

    resetRenderUntil(num: number) {
        this._renderUntil = [];
        for (let i = 0; i < num; i++) {
            this._renderUntil[i] = 0;
        }
    }

    initEvents() {
        $('#simDiv').on('wheel mousewheel touchmove', (e) => {
            this.handleMouseWheel(e);
        });
        $('#canvasDiv').on('mousedown touchstart mousemove touchmove mouseup touchend mouseout touchcancel', (e) => {
            // handle any mouse event that is not captured by the object's mouse listener on the specific layers
            this.handleMouse(e);
        });
        $('#robotLayer').on('click touchstart', function (e) {
            $('#robotLayer').attr('tabindex', 0);
            $('#robotLayer').trigger('focus');
            e.preventDefault();
        });
        $('#blocklyDiv').on('click touchstart', function (e) {
            $('#blocklyDiv').attr('tabindex', 0);
            $('#blocklyDiv').trigger('focus');
            e.preventDefault();
        });
    }

    resumeInterpreters() {
        if (!this.debugMode) {
            $('#simControl').addClass('typcn-media-stop').removeClass('typcn-media-play-outline');
            $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_STOP_TOOLTIP);
        }
        this.interpreterRunning = true;
    }

    setInfo() {
        if (this.info === true) {
            this.info = false;
        } else {
            this.info = true;
        }
    }

    addObstacle(shape) {
        this.scene.addObstacle(shape);
        this.enableChangeObjectButtons();
    }

    addColorArea(shape) {
        this.scene.addColorArea(shape);
        this.enableChangeObjectButtons();
    }

    deleteSelectedObject() {
        this.scene.deleteSelectedObject();
    }

    deleteAllObstacle() {
        this.scene.obstacleList = [];
    }

    deleteAllColorArea() {
        this.scene.colorAreaList = [];
    }

    toggleColorPicker() {
        if ($('.huebee').length) {
            this.colorpicker.close();
        } else {
            this.colorpicker.open();
        }
    }

    resetColorpickerCursor() {
        this.colorpicker.color = null;
        this.colorpicker.setTexts();
        this.colorpicker.setBackgrounds();
        this.colorpicker.cursor.classList.add('is-hidden');
    }

    stopProgram() {
        if (!this.debugMode) {
            $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
            $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
        }
        this.interpreters.forEach((interpreter) => {
            interpreter.removeHighlights();
            interpreter.terminate();
        });
        this.interpreterRunning = false;
        setTimeout(function () {
            //this.init(this.userPrograms, false, this.simRobotType);
            //this.addMouseEvents();
        }, 500);
        NN_CTRL.saveNN2Blockly();
    }

    getNumRobots() {
        return this.interpreters.length;
    }

    callbackOnTermination() {
        if (this.allInterpretersTerminated()) {
            if (!this.scene.robots[0]['endless']) {
                //TODO check here for endless robots
                if (this.debugMode) {
                    $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-play');
                    $('#simStop').removeClass('disabled');
                } else {
                    $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
                    $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
                }
            } else if (this.debugMode) {
                if (!$('#simStop').hasClass('disabled')) {
                    $('#simStop').hide();
                    $('#simControl').addClass('typcn-media-stop').removeClass('typcn-media-play').removeClass('blue');
                    $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_STOP_TOOLTIP);
                }
            }
        }
        NN_CTRL.saveNN2Blockly();
        console.log('END of Sim');
    }

    run(refresh, robotType) {
        this.init(this.storedPrograms, false, robotType);
    }

    stop() {
        NN_CTRL.saveNN2Blockly();
        this.stopProgram();
        this.canceled = true;
    }

    start() {
        this.canceled = false;
        if (this.globalID === 0) {
            this.render();
        }
    }

    render() {
        if (this.canceled) {
            cancelAnimationFrame(this.globalID);
            this.renderTime = 5;
            this.globalID = 0;
            return;
        }
        this.globalID = requestAnimationFrame(this.render.bind(this));
        let now = new Date().getTime();
        let dtSim = now - this.time;
        let dtRobot = Math.min(15, Math.abs(dtSim - this.renderTime) / this.getNumRobots());
        this.dt = dtSim / 1000;
        this.stepCounter += 1;

        this.interpreters.forEach((interpreter, index) => {
            if (this.interpreterRunning && !interpreter.isTerminated()) {
                if (this.renderUntil[index] <= now) {
                    let delayMs = interpreter.run(now + dtRobot);
                    let nowNext = new Date().getTime();
                    this.renderUntil[index] = nowNext + delayMs;
                }
            } else if (this.interpreterRunning && this.allInterpretersTerminated()) {
                this.interpreterRunning = false;
                setTimeout(function () {
                    //this.init(this.userPrograms, false, this.simRobotType);
                    // this.addMouseEvents();
                }, 500);
            }
        }, this);

        this.updateBreakpointEvent();

        let renderTimeStart = new Date().getTime();
        this.scene.update(this.dt, this.interpreterRunning);
        this.renderTime = new Date().getTime() - renderTimeStart;
        this.time = now;
    }

    allInterpretersTerminated() {
        for (let i = 0; i < this.interpreters.length; i++) {
            if (!this.interpreters[i].isTerminated()) {
                return false;
            }
        }
        return true;
    }

    resetButtons() {
        if (this.debugMode) {
            $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-play');
            $('#simStop').addClass('disabled');
        } else {
            $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
            $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
        }
    }

    disableChangeObjectButtons() {
        $('.simChangeObject').removeClass('disabled').addClass('disabled');
    }

    enableChangeObjectButtons() {
        $('.simChangeObject').removeClass('disabled');
    }

    handleMouse(e) {
        e.stopPropagation();
        e.preventDefault();
        if (!$('#robotLayer').data().hovered) {
            $('#robotLayer').css('cursor', 'auto');
        } else {
            $('#robotLayer').data('hovered', false);
        }
        if (e && !(e as unknown as SimMouseEvent).startX) {
            UTIL.extendMouseEvent(e, this.scale, $('#robotLayer'));
            this.lastMousePosition = {
                x: e.startX,
                y: e.startY,
            };
        }
        switch (e.type) {
            case 'mousedown':
            case 'touchstart': {
                this.oldMousePosition = this.lastMousePosition;
                this.selectionListener.fire(null);
                break;
            }
            case 'mousemove':
            case 'touchmove': {
                if (!this.oldMousePosition) {
                    return;
                }
                if (e && !(e as unknown as SimMouseEvent).startX) {
                    UTIL.extendMouseEvent(e, Simulation.Instance.scale, $('#robotLayer'));
                }
                let myEvent = e as unknown as SimMouseEvent;
                let dx = (myEvent.startX - this.oldMousePosition.x) * this.scale;
                let dy = (myEvent.startY - this.oldMousePosition.y) * this.scale;
                let position: JQuery.Coordinates = $('#canvasDiv').position();
                position.top += dy;
                position.left += dx;
                $('#canvasDiv').css({ top: position.top });
                $('#canvasDiv').css({ left: position.left });
                break;
            }
            default: {
                this.oldMousePosition = null;
            }
        }
    }

    handleMouseWheel(e) {
        let scaleOld = this.scale;
        let delta = 0;
        if (e.originalEvent.wheelDelta !== undefined) {
            delta = e.originalEvent.wheelDelta;
        } else {
            if (e.originalEvent.touches) {
                if (e.originalEvent.touches[0] && e.originalEvent.touches[1]) {
                    let diffX = e.originalEvent.touches[0].pageX - e.originalEvent.touches[1].pageX;
                    let diffY = e.originalEvent.touches[0].pageY - e.originalEvent.touches[1].pageY;
                    let newDist = diffX * diffX + diffY * diffY;
                    if (this.dist == 0) {
                        this.dist = newDist;
                        return;
                    } else {
                        delta = newDist - this.dist;
                        this.dist = newDist;
                    }
                } else {
                    this.dist = 0;
                    return;
                }
            } else {
                delta = -e.originalEvent.deltaY;
            }
        }
        let zoom = false;
        if (delta > 0) {
            this.scale *= 1.025;
            if (this.scale > 3) {
                this.scale = 3;
            }
            zoom = true;
        } else if (delta < 0) {
            this.scale *= 0.925;
            if (this.scale < 0.25) {
                this.scale = 0.25;
            }
            zoom = true;
        }
        if (zoom) {
            let scaleDif = this.scale - scaleOld;
            let position: JQuery.Coordinates = $('#canvasDiv').position();
            let wDif = this.scene.uCanvas.width * scaleDif;
            let hDif = this.scene.uCanvas.height * scaleDif;
            position.top = position.top - hDif / 2;
            position.left = position.left - wDif / 2;
            $('#canvasDiv').css({ top: position.top });
            $('#canvasDiv').css({ left: position.left });
            this.scene.resetAllCanvas();
            e.stopPropagation();
        }
    }

    importConfigData() {
        $('#backgroundFileSelector').val(null);
        $('#backgroundFileSelector').attr('accept', '.json');
        $('#backgroundFileSelector').off();
        let sim = this;
        $('#backgroundFileSelector').onWrap('change', function (event) {
            event.preventDefault();
            event.stopPropagation();
            let file = event.target['files'][0];
            let reader = new FileReader();
            reader.onload = (function () {
                return function (e) {
                    try {
                        const configData = JSON.parse(event.target.result);
                        sim.setNewConfig(configData);
                    } catch (ex) {
                        console.error(ex);
                        //TODO: MSG.displayPopupMessage('Blockly.Msg.POPUP_BACKGROUND_STORAGE', Blockly.Msg.POPUP_CONFIG_UPLOAD_ERROR);
                    }
                };
            })();
            reader.readAsText(file);
        });
        $('#backgroundFileSelector').clickWrap(); // opening dialog
    }

    /**
     * @returns {object} the configuration data
     */
    exportConfigData(): object[] {
        return this.getConfigData();
    }

    /**
     * Collects all simulation objects and calculates their relative location in the current background.
     * @returns {object} of all simulation objects
     */
    getConfigData(): object[] {
        let height: number = this.scene.uCanvas.height;
        let width: number = this.scene.uCanvas.width;
        let config: any = {};

        function calculateShape(object: BaseSimulationObject) {
            if (object instanceof RectangleSimulationObject) {
                return {
                    x: object.x / width,
                    y: object.y / height,
                    w: object.w / width,
                    h: object.h / height,
                    theta: object.theta,
                    color: object.color,
                    form: SimObjectShape.Rectangle,
                    type: object.type,
                };
            } else if (object instanceof TriangleSimulationObject) {
                return {
                    ax: object.ax / width,
                    ay: object.ay / height,
                    bx: object.bx / width,
                    by: object.by / height,
                    cx: object.cx / width,
                    cy: object.cy / height,
                    color: object.color,
                    form: SimObjectShape.Triangle,
                    type: object.type,
                };
            } else if (object instanceof CircleSimulationObject) {
                return {
                    x: object.x / width,
                    y: object.y / height,
                    r: object.r / height / width,
                    color: object.color,
                    form: SimObjectShape.Circle,
                    type: object.type,
                };
            }
        }

        let robotPosesList: Pose[] = this.scene.getRobotPoses();
        config.robotPoses = robotPosesList.map(function (pose) {
            return {
                x: pose.x / width,
                y: pose.y / height,
                theta: pose.theta,
            };
        });
        config.obstacles = this.scene.obstacleList.map(function (object) {
            return calculateShape(object);
        });
        config.colorAreas = this.scene.colorAreaList.map(function (object) {
            return calculateShape(object);
        });
        return config;
    }

    setNewConfig(relatives) {
        let height: number = this.scene.uCanvas.height;
        let width: number = this.scene.uCanvas.width;
        let sim = this;

        function calculateShape(object) {
            let newObject: any = {};
            newObject.id = sim.scene.uniqueObjectId;
            newObject.shape = object.form.toUpperCase() as SimObjectShape;
            newObject.color = object.color;
            newObject.newObjecttype = object.type;
            switch (object.form.toLowerCase()) {
                case 'rectangle':
                    newObject.p = { x: object.x * width, y: object.y * height };
                    newObject.params = [object.w * width, object.h * height];
                    break;
                case 'triangle':
                    newObject.p = { x: 0, y: 0 };
                    newObject.params = [object.ax * width, object.ay * height, object.bx * width, object.by * height, object.cx * width, object.cy * height];
                    break;
                case 'circle':
                    newObject.p = {
                        x: object.x * width,
                        y: object.y * height,
                    };
                    newObject.params = [object.r * height * width];
                    break;
            }
            return newObject;
        }

        let importPoses = [];
        relatives.robotPoses.forEach((pose) => {
            let myPose: any = {};
            myPose.x = pose.x * width;
            myPose.y = pose.y * height;
            myPose.theta = pose.theta;
            importPoses.push(myPose);
        });
        this.scene.setRobotPoses(importPoses);
        let importObstacles = [];
        relatives.obstacles.forEach((obstacle) => {
            importObstacles.push(calculateShape(obstacle));
        });
        this.scene.addImportObstacle(importObstacles);

        let importColorAreas = [];
        relatives.colorAreas.forEach((colorArea) => {
            importColorAreas.push(calculateShape(colorArea));
        });
        this.scene.addImportColorAreaList(importColorAreas);
    }

    importImage() {
        let $backgroundFileSelector = $('#backgroundFileSelector');
        $backgroundFileSelector.val(null);
        $backgroundFileSelector.attr('accept', '.png, .jpg, .jpeg, .svg');
        $backgroundFileSelector.clickWrap(); // opening dialog
        let sim = this;
        $backgroundFileSelector.on('change', function (event) {
            let file = event.target['files'][0];
            let reader = new FileReader();
            reader.onload = function () {
                let img = new Image();
                img.onload = function () {
                    let canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    let ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    let dataURL = canvas.toDataURL('image/png');
                    let image = new Image(canvas.width, canvas.height);
                    image.src = dataURL;
                    image.onload = function () {
                        if (sim.scene.customBackgroundLoaded) {
                            // replace previous image
                            sim.scene.imgBackgroundList[sim.scene.imgBackgroundList.length - 1] = image;
                        } else {
                            sim.scene.imgBackgroundList.push(image);
                        }
                        sim.setBackground(sim.scene.imgBackgroundList.length - 1);
                    };
                    if (UTIL.isLocalStorageAvailable()) {
                        $('#show-message-confirm').oneWrap('shown.bs.modal', function () {
                            $('#confirm').off();
                            $('#confirm').on('click', function (e) {
                                e.preventDefault();
                                localStorage.setItem(
                                    'customBackground',
                                    JSON.stringify({
                                        image: dataURL.replace(/^data:image\/(png|jpg);base64,/, ''),
                                        timestamp: new Date().getTime(),
                                    })
                                );
                            });
                            $('#confirmCancel').off();
                            $('#confirmCancel').on('click', function (e) {
                                e.preventDefault();
                            });
                        });
                        MSG.displayPopupMessage('Blockly.Msg.POPUP_BACKGROUND_STORAGE', Blockly.Msg.POPUP_BACKGROUND_STORAGE, Blockly.Msg.YES, Blockly.Msg.NO);
                    }
                };
                if (typeof reader.result === 'string') {
                    img.src = reader.result;
                }
            };
            reader.readAsDataURL(file);
            return false;
        });
    }

    /** adds/removes the ability for a block to be a breakpoint to a block */

    updateBreakpointEvent() {
        let sim = this;
        if (this.debugMode) {
            Blockly.getMainWorkspace()
                .getAllBlocks()
                .forEach(function (block) {
                    if (!$(block.svgGroup_).hasClass('blocklyDisabled')) {
                        if (sim.observers.hasOwnProperty(block.id)) {
                            sim.observers[block.id].disconnect();
                        }

                        let observer = new MutationObserver(function (mutations) {
                            mutations.forEach(function (mutation) {
                                if ($(block.svgGroup_).hasClass('blocklyDisabled')) {
                                    sim.removeBreakPoint(block);
                                    $(block.svgPath_).removeClass('breakpoint').removeClass('selectedBreakpoint');
                                } else {
                                    if ($(block.svgGroup_).hasClass('blocklySelected')) {
                                        if ($(block.svgPath_).hasClass('breakpoint')) {
                                            sim.removeBreakPoint(block);
                                            $(block.svgPath_).removeClass('breakpoint');
                                        } else if ($(block.svgPath_).hasClass('selectedBreakpoint')) {
                                            sim.removeBreakPoint(block);
                                            $(block.svgPath_).removeClass('selectedBreakpoint').stop(true, true).animate({ 'fill-opacity': '1' }, 0);
                                        } else {
                                            sim._breakpoints.push(block.id);
                                            $(block.svgPath_).addClass('breakpoint');
                                        }
                                    }
                                }
                            });
                        });
                        sim.observers[block.id] = observer;
                        observer.observe(block.svgGroup_, { attributes: true });
                    }
                }, sim);
        } else {
            Blockly.getMainWorkspace()
                .getAllBlocks()
                .forEach(function (block) {
                    if (sim.observers.hasOwnProperty(block.id)) {
                        sim.observers[block.id].disconnect();
                    }
                    $(block.svgPath_).removeClass('breakpoint');
                }, sim);
        }
    }

    getDebugMode() {
        return this.debugMode;
    }

    updateDebugMode(mode) {
        this.debugMode = mode;
        if (this.interpreters !== null) {
            for (let i = 0; i < this.interpreters.length; i++) {
                this.interpreters[i].setDebugMode(mode);
            }
        }
        this.updateBreakpointEvent();
    }

    removeBreakPoint(block) {
        for (let i = 0; i < this._breakpoints.length; i++) {
            if (this._breakpoints[i] === block.id) {
                this._breakpoints.splice(i, 1);
            }
        }
        if (!this._breakpoints && this._breakpoints.length > 0 && this.interpreters !== null) {
            for (let i = 0; i < this.interpreters.length; i++) {
                this.interpreters[i].removeEvent(C.DEBUG_BREAKPOINT);
            }
        }
    }

    /** adds an event to the interpreters */

    interpreterAddEvent(mode) {
        this.updateBreakpointEvent();
        if (this.interpreters) {
            this.interpreters.forEach((interpreter) => interpreter.addEvent(mode));
        }
    }

    endDebugging() {
        if (this.interpreters !== null) {
            this.interpreters.forEach((interpreter) => {
                interpreter.setDebugMode(false);
                interpreter.breakpoints = [];
            });
        }
        Blockly.getMainWorkspace()
            .getAllBlocks()
            .forEach(function (block) {
                $(block.svgPath_).stop(true, true).removeAttr('style');
            });
        this._breakpoints = [];
        this.debugMode = false;
        this.updateBreakpointEvent();
    }

    setBackground(num: number) {
        this.scale = 1;
        this.scene.stepBackground(num);
    }

    toggleTrail() {
        this.scene.toggleTrail();
    }

    initColorPicker(robotColors: string[]) {
        let sim = this;
        if (robotColors && robotColors.length > 0) {
            this.colorpicker = new HUEBEE('#colorpicker', {
                shades: 1,
                hues: 8,
                customColors: robotColors,
                setText: false,
            });
        } else {
            this.colorpicker = new HUEBEE('#colorpicker', {
                shades: 1,
                hues: 8,
                setText: false,
            });
        }
        this.colorpicker.on('change', function (color) {
            sim.scene.changeColorWithColorPicker(color);
        });
        let close = HUEBEE.prototype.close;
        HUEBEE.prototype.close = function () {
            $('.huebee__container').off('mouseup touchend', (e) => {
                e.stopPropagation();
                sim.resetColorpickerCursor();
            });
            close.call(this);
        };
        let open = HUEBEE.prototype.open;
        HUEBEE.prototype.open = function () {
            open.call(this);
            $('.huebee__container').on('mouseup touchend', (e) => {
                sim.resetColorpickerCursor();
            });
        };
    }

    resetPose() {
        this.scene.resetPoseAndDrawings();
    }

    setPause(value) {
        if (value) {
            if (value && !this.debugMode) {
                $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
                $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
            } else if (!value && !this.debugMode) {
                $('#simControl').addClass('typcn-media-stop').removeClass('typcn-media-play-outline');
                $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_STOP_TOOLTIP);
            }
        }
        this.interpreterRunning = !value;
    }
}

// requestAnimationFrame polyfill by Erik Möller.
// Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavic, Darius Bacon and Joan Alba Maldonado.
// Adapted from https://gist.github.com/paulirish/1579671 which derived from
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// Added high resolution timing. This window.performance.now() polyfill can be used: https://gist.github.com/jalbam/cc805ac3cfe14004ecdf323159ecf40e
// MIT license
// Gist: https://gist.github.com/jalbam/5fe05443270fa6d8136238ec72accbc0
(function () {
    var vendors = ['webkit', 'moz', 'ms', 'o'],
        vp = null;
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame && !window.cancelAnimationFrame; x++) {
        vp = vendors[x];
        window.requestAnimationFrame = window.requestAnimationFrame || window[vp + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window.cancelAnimationFrame || window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        //iOS6 is buggy.
        var lastTime = 0;
        // @ts-ignore
        window.requestAnimationFrame = function (callback, element) {
            var now = window.performance.now();
            var nextTime = Math.max(lastTime + 16, now); //First time will execute it immediately but barely noticeable and performance is gained.
            return setTimeout(function () {
                callback((lastTime = nextTime));
            }, nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
})();
