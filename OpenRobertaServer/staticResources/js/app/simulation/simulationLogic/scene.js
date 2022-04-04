var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
define(["require", "exports", "util", "jquery", "./simulation.objects", "./BaseRobot", "./BaseMobileRobot", "interpreter.constants"], function (require, exports, UTIL, $, simulation_objects_1, BaseRobot_1, BaseMobileRobot_1, C) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Scene = void 0;
    /**
     * Creates a new Scene.
     *
     * @constructor
     */
    var Scene = /** @class */ (function () {
        function Scene(sim) {
            this.customBackgroundLoaded = false;
            this.ground = new simulation_objects_1.Ground(0, 0, 0, 0);
            this.imgBackgroundList = [];
            this.imgList = ['simpleBackground.svg', 'drawBackground.svg', 'robertaBackground.svg', 'rescueBackground.svg', 'blank.svg', 'mathBackground.svg'];
            this.imgListIE = ['simpleBackground.png', 'drawBackground.png', 'robertaBackground.png', 'rescueBackground.png', 'blank.png', 'mathBackground.png'];
            this.imgPath = '/js/app/simulation/simBackgrounds/';
            this.playground = {
                x: 0,
                y: 0,
                w: 0,
                h: 0,
            };
            this._colorAreaList = [];
            this._obstacleList = [];
            this._redrawColorAreas = false;
            this._redrawObstacles = false;
            this._redrawRuler = false;
            this._robots = [];
            this._uniqueObjectId = 1;
            this.sim = sim;
            this.uCanvas = document.createElement('canvas');
            this.uCtx = this.uCanvas.getContext('2d'); // unit context
            this.udCanvas = document.createElement('canvas');
            this.udCtx = this.udCanvas.getContext('2d'); // unit context
            this.bCtx = $('#backgroundLayer')[0].getContext('2d'); // background context
            this.dCtx = $('#drawLayer')[0].getContext('2d'); // background context
            this.mCtx = $('#rulerLayer')[0].getContext('2d'); // ruler == *m*easurement context
            this.oCtx = $('#objectLayer')[0].getContext('2d'); // object context
            this.rCtx = $('#robotLayer')[0].getContext('2d'); // robot context
        }
        Object.defineProperty(Scene.prototype, "uniqueObjectId", {
            get: function () {
                return this._uniqueObjectId;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "robots", {
            get: function () {
                return this._robots;
            },
            set: function (value) {
                this.clearList(this._robots);
                this._robots = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "obstacleList", {
            get: function () {
                return this._obstacleList;
            },
            set: function (value) {
                this.clearList(this._obstacleList);
                this._obstacleList = value;
                this.redrawObstacles = true;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "colorAreaList", {
            get: function () {
                return this._colorAreaList;
            },
            set: function (value) {
                this.clearList(this._colorAreaList);
                this._colorAreaList = value;
                this.redrawColorAreas = true;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "redrawObstacles", {
            get: function () {
                return this._redrawObstacles;
            },
            set: function (value) {
                this._redrawObstacles = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "redrawColorAreas", {
            get: function () {
                return this._redrawColorAreas;
            },
            set: function (value) {
                this._redrawColorAreas = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "redrawRuler", {
            get: function () {
                return this._redrawRuler;
            },
            set: function (value) {
                this._redrawRuler = value;
            },
            enumerable: false,
            configurable: true
        });
        Scene.prototype.addColorArea = function (shape) {
            this.addSimulationObject(this.colorAreaList, shape, simulation_objects_1.SimObjectType.ColorArea);
            this.redrawColorAreas = true;
        };
        Scene.prototype.addImportColorAreaList = function (importColorAreaList) {
            var _this = this;
            var newColorAreaList = [];
            importColorAreaList.forEach(function (obj) {
                var newObject = simulation_objects_1.SimObjectFactory.getSimObject.apply(simulation_objects_1.SimObjectFactory, __spreadArray([obj.id,
                    _this,
                    _this.sim.selectionListener,
                    obj.shape,
                    simulation_objects_1.SimObjectType.ColorArea,
                    obj.p,
                    obj.color], obj.params, false));
                newColorAreaList.push(newObject);
            });
            this.colorAreaList = newColorAreaList;
        };
        Scene.prototype.addImportObstacle = function (importObstacleList) {
            var _this = this;
            var newObstacleList = [];
            importObstacleList.forEach(function (obj) {
                var newObject = simulation_objects_1.SimObjectFactory.getSimObject.apply(simulation_objects_1.SimObjectFactory, __spreadArray([obj.id,
                    _this,
                    _this.sim.selectionListener,
                    obj.shape,
                    simulation_objects_1.SimObjectType.Obstacle,
                    obj.p,
                    obj.color], obj.params, false));
                newObstacleList.push(newObject);
            });
            this.obstacleList = newObstacleList;
        };
        Scene.prototype.addObstacle = function (shape) {
            this.addSimulationObject(this.obstacleList, shape, simulation_objects_1.SimObjectType.Obstacle);
            this.redrawObstacles = true;
        };
        Scene.prototype.addSimulationObject = function (list, shape, type) {
            var $robotLayer = $('#robotLayer');
            $robotLayer.attr('tabindex', 0);
            $robotLayer.trigger('focus');
            var x = Math.random() * (this.ground['w'] - 300) + 100;
            var y = Math.random() * (this.ground['h'] - 200) + 100;
            var newObject = simulation_objects_1.SimObjectFactory.getSimObject(this.uniqueObjectId, this, this.sim.selectionListener, shape, type, {
                x: x,
                y: y,
            });
            list.push(newObject);
            newObject.selected = true;
        };
        Scene.prototype.changeColorWithColorPicker = function (color) {
            var objectList = this.obstacleList.concat(this.colorAreaList); // >= 0 ? obstacleList[selectedObstacle] : selectedColorArea >= 0 ? colorAreaList[selectedColorArea] : null;
            var myObj = objectList.filter(function (obj) { return obj.selected; });
            if (myObj.length == 1) {
                myObj[0].color = color;
                if (myObj[0].type === simulation_objects_1.SimObjectType.Obstacle) {
                    this.redrawObstacles = true;
                }
                else {
                    this.redrawColorAreas = true;
                }
            }
        };
        /**
         * Call destroy() for all items in the list
         * @param myList
         */
        Scene.prototype.clearList = function (myList) {
            myList.forEach(function (obj) {
                obj.destroy();
            });
            myList.length = 0;
        };
        Scene.prototype.deleteSelectedObject = function () {
            var scene = this;
            function findAndDelete(list) {
                for (var i = 0; i < list.length; i++) {
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
            }
            else {
                this.redrawObstacles = true;
            }
        };
        Scene.prototype.draw = function (dt, interpreterRunning) {
            var _this = this;
            this.rCtx.save();
            this.rCtx.scale(this.sim.scale, this.sim.scale);
            this.rCtx.clearRect(this.ground.x - 10, this.ground.y - 10, this.ground.w + 20, this.ground.h + 20);
            this.dCtx.save();
            this.dCtx.scale(this.sim.scale, this.sim.scale);
            this.robots.forEach(function (robot) {
                //const current = this.sim.getRobotIndex() === r;
                //if (current) {
                robot.draw(_this.rCtx, dt);
                if (robot instanceof BaseMobileRobot_1.BaseMobileRobot && interpreterRunning) {
                    robot.drawTrail(_this.dCtx, _this.udCtx, C.DEFAULT_TRAIL_WIDTH, C.DEFAULT_TRAIL_COLOR);
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
        };
        Scene.prototype.drawColorAreas = function () {
            var _this = this;
            var w = this.backgroundImg.width + 20;
            var h = this.backgroundImg.height + 20;
            this.uCtx.clearRect(0, 0, w, h);
            this.uCtx.drawImage(this.backgroundImg, 10, 10, this.backgroundImg.width, this.backgroundImg.height);
            this.drawPattern(this.uCtx);
            this.bCtx.restore();
            this.bCtx.save();
            this.bCtx.scale(this.sim.scale, this.sim.scale);
            this.bCtx.clearRect(this.ground.x - 10, this.ground.y - 10, this.ground.w + 20, this.ground.h + 20);
            this.bCtx.drawImage(this.uCanvas, 0, 0, w, h, 0, 0, w, h);
            this.colorAreaList.forEach(function (colorArea) { return colorArea.draw(_this.bCtx, _this.uCtx, _this.mCtx); });
        };
        Scene.prototype.drawObstacles = function () {
            var _this = this;
            this.oCtx.restore();
            this.oCtx.save();
            this.oCtx.scale(this.sim.scale, this.sim.scale);
            this.oCtx.clearRect(this.ground.x - 10, this.ground.y - 10, this.ground.w + 20, this.ground.h + 20);
            this.obstacleList.forEach(function (obstacle) { return obstacle.draw(_this.oCtx, _this.uCtx, _this.mCtx); });
        };
        Scene.prototype.drawPattern = function (ctx) {
            ctx.beginPath();
            var patternImg = this.images['pattern'];
            ctx.strokeStyle = ctx.createPattern(patternImg, 'repeat');
            ctx.lineWidth = 10;
            ctx.strokeRect(5, 5, this.backgroundImg.width + 10, this.backgroundImg.height + 10);
        };
        Scene.prototype.drawRuler = function () {
            this.mCtx.restore();
            this.mCtx.save();
            this.mCtx.scale(this.sim.scale, this.sim.scale);
            this.mCtx.clearRect(this.ground.x - 10, this.ground.y - 10, this.ground.w + 20, this.ground.h + 20);
            this.mCtx.drawImage(this.ruler.img, this.ruler.x, this.ruler.y, this.ruler.w, this.ruler.h);
        };
        Scene.prototype.getRobotPoses = function () {
            return this.robots.map(function (robot) {
                return robot.pose;
            });
        };
        Scene.prototype.handleKeyEvent = function (e) {
            if (e.key === 'v' && e.ctrlKey) {
                this.pasteObject(this.sim.lastMousePosition);
                e.stopImmediatePropagation();
            }
            if (e.key === 'Delete' || e.key.toLowerCase() === 'Backspace') {
                this.deleteSelectedObject();
                e.stopImmediatePropagation();
            }
        };
        Scene.prototype.init = function (robotType, refresh, interpreters, configurations, savedNames) {
            var _this = this;
            var switchRobot = !this.robotType || this.robotType != robotType;
            this.robotType = robotType;
            var scene = this;
            if (refresh) {
                this.robots = [];
                // run with a different robot type or different number of robots
                BaseRobot_1.RobotFactory.createRobots(interpreters, configurations, savedNames, this.sim.selectionListener, this.robotType)
                    .then(function (result) {
                    _this.robots = result.robots;
                    _this.robotClass = result.robotClass;
                    _this.initViews();
                    if (switchRobot) {
                        scene.currentBackground = 0;
                        var imgType = '.svg';
                        if (UTIL.isIE()) {
                            imgType = '.png';
                        }
                        scene.images = _this.loadImages(['roadWorks', 'pattern', 'ruler'], ['roadWorks' + imgType, 'wallPattern.png', 'ruler' + imgType], function () {
                            scene.loadBackgroundImages(function () {
                                if (UTIL.isIE() || UTIL.isEdge()) {
                                    // TODO IE and Edge: Input event not firing for file type of input
                                    $('.dropdown.sim, .simScene, #simEditButtons').show();
                                    $('#simImport').hide();
                                }
                                else {
                                    $('.dropdown.sim, .simScene, #simImport, #simResetPose, #simEditButtons').show();
                                }
                                scene.ground = new simulation_objects_1.Ground(10, 10, scene.imgBackgroundList[scene.currentBackground].width, scene.imgBackgroundList[scene.currentBackground].height);
                                scene.ruler = new (simulation_objects_1.Ruler.bind.apply(simulation_objects_1.Ruler, __spreadArray([void 0, 1,
                                    scene,
                                    scene.sim.selectionListener,
                                    simulation_objects_1.SimObjectType.Passiv,
                                    { x: 430, y: 400 },
                                    scene.images['ruler']], [300, 30], false)))();
                                var standardObstacle = new (simulation_objects_1.RectangleSimulationObject.bind.apply(simulation_objects_1.RectangleSimulationObject, __spreadArray([void 0, 0,
                                    scene,
                                    scene.sim.selectionListener,
                                    simulation_objects_1.SimObjectType.Obstacle,
                                    { x: 580, y: 290 },
                                    null], [100, 100], false)))();
                                scene.obstacleList.push(standardObstacle);
                                $('#simDiv>.pace').fadeOut('fast');
                                scene.resetAllCanvas(scene.imgBackgroundList[0]);
                                scene.resizeAll();
                                scene.initEvents();
                                scene.sim.initColorPicker(scene.robotClass.default.colorRange);
                            });
                        });
                    }
                })
                    .then(function () { return _this.sim.start(); });
            }
            else {
                // rerun the (updated) program
                this.robots.forEach(function (robot, index) {
                    robot.replaceState(interpreters[index]);
                    robot.reset();
                });
                //this.sim.cancel(false);
            }
        };
        Scene.prototype.initViews = function () {
            $('#constantValue').html('');
            if (this.robots.length > 1) {
                var robotIndexColour_1 = '';
                robotIndexColour_1 += '<select id="robotIndex" style="background-color:' + this.robots[0].chassis.geom.color + '">';
                this.robots.forEach(function (robot) {
                    robotIndexColour_1 +=
                        '<option style="background-color:' + robot.chassis.geom.color + '" value="' + robot.id + '">&nbsp' + '</option>';
                });
                robotIndexColour_1 += '</select>';
                $('#constantValue').append('<div><label id="robotLabel">Robot</label><span style="width:auto">' + robotIndexColour_1 + '</span></div>');
            }
            else {
                //remove if there is only one robot
                $('#robotLabel').remove();
                $('#robotIndex').remove();
            }
        };
        Scene.prototype.initEvents = function () {
            var _this = this;
            $(window).off('resize.sim');
            $(window).on('resize.sim', function () {
                _this.resizeAll();
            });
            $('#robotLayer').off('keydown.sim');
            $('#robotLayer').on('keydown.sim', this.handleKeyEvent.bind(this));
            $('#robotLayer').on('keydown', this.handleKeyEvent.bind(this));
        };
        Scene.prototype.loadBackgroundImages = function (callback) {
            if (UTIL.isIE()) {
                this.imgList = this.imgListIE;
            }
            var numLoading = this.imgList.length;
            var scene = this;
            var onload = function () {
                if (--numLoading === 0) {
                    callback();
                    if (UTIL.isLocalStorageAvailable()) {
                        var customBackground = localStorage.getItem('customBackground');
                        if (customBackground) {
                            // TODO backwards compatibility for non timestamped background images; can be removed after some time
                            try {
                                JSON.parse(customBackground);
                            }
                            catch (e) {
                                localStorage.setItem('customBackground', JSON.stringify({
                                    image: customBackground,
                                    timestamp: new Date().getTime(),
                                }));
                                customBackground = localStorage.getItem('customBackground');
                            }
                            var jsonCustomBackground = JSON.parse(customBackground);
                            // remove images older than 30 days
                            var currentTimestamp = new Date().getTime();
                            if (currentTimestamp - jsonCustomBackground.timestamp > 63 * 24 * 60 * 60 * 1000) {
                                localStorage.removeItem('customBackground');
                            }
                            else {
                                // add image to backgrounds if recent
                                var dataImage = jsonCustomBackground.image;
                                var customImage = new Image();
                                customImage.src = 'data:image/png;base64,' + dataImage;
                                scene.imgBackgroundList.push(customImage);
                                scene.customBackgroundLoaded = true;
                            }
                        }
                    }
                }
            };
            var i = 0;
            while (i < this.imgList.length) {
                var img = (this.imgBackgroundList[i] = new Image());
                img.onload = onload;
                img.onerror = function (e) {
                    console.error(e);
                };
                img.src = this.imgPath + this.imgList[i++];
            }
        };
        Scene.prototype.loadImages = function (names, files, onAllLoaded) {
            var i = 0;
            var numLoading = names.length;
            var onload = function () {
                --numLoading === 0 && onAllLoaded();
            };
            var images = {};
            while (i < names.length) {
                var img = (images[names[i]] = new Image());
                img.onload = onload;
                img.onerror = function (e) {
                    console.error(e);
                };
                img.src = this.imgPath + files[i++];
            }
            return images;
        };
        Scene.prototype.pasteObject = function (lastMousePosition) {
            if (this.objectToCopy) {
                var newObject = simulation_objects_1.SimObjectFactory.copy(this.objectToCopy);
                newObject.moveTo(lastMousePosition);
                if (this.objectToCopy.type === simulation_objects_1.SimObjectType.Obstacle) {
                    this.obstacleList.push(newObject);
                    this.redrawObstacles = true;
                }
                else if (this.objectToCopy.type === simulation_objects_1.SimObjectType.ColorArea) {
                    this.colorAreaList.push(newObject);
                    this.redrawColorAreas = true;
                }
            }
        };
        Scene.prototype.resetAllCanvas = function (opt_img) {
            var resetUnified = false;
            if (opt_img) {
                this.backgroundImg = opt_img;
                resetUnified = true;
            }
            var sc = this.sim.scale;
            var left = (this.playground.w - (this.backgroundImg.width + 20) * sc) / 2.0;
            var top = (this.playground.h - (this.backgroundImg.height + 20) * sc) / 2.0;
            var w = Math.round((this.backgroundImg.width + 20) * sc);
            var h = Math.round((this.backgroundImg.height + 20) * sc);
            if ($('#simDiv').hasClass('shifting') && $('#simDiv').hasClass('rightActive')) {
                $('#canvasDiv').css({
                    top: top + 'px',
                    left: left + 'px',
                });
            }
            var scene = this;
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
        };
        Scene.prototype.resizeAll = function () {
            // only when opening the sim view we want to calculate the offsets and scale
            if ($('#simDiv').hasClass('shifting') && $('#simButton').hasClass('rightActive')) {
                var $simDiv = $('#simDiv');
                var canvasOffset = $simDiv.offset();
                var offsetY = canvasOffset.top;
                this.playground.w = $simDiv.outerWidth();
                this.playground.h = $(window).height() - offsetY;
                var scaleX = this.playground.w / (this.ground.w + 20);
                var scaleY = this.playground.h / (this.ground.h + 20);
                this.sim.scale = Math.min(scaleX, scaleY) - 0.05;
                $('#canvasDiv canvas').each(function (canvas) {
                    $('#canvasDiv canvas')[canvas].style.top = '0px';
                    $('#canvasDiv canvas')[canvas].style.left = '0px';
                });
                this.resetAllCanvas();
            }
        };
        Scene.prototype.setRobotPoses = function (importPoses) {
            var _this = this;
            importPoses.forEach(function (pose, index) {
                if (_this.robots[index]) {
                    var newPose = new BaseMobileRobot_1.Pose(pose.x, pose.y, pose.theta);
                    _this.robots[index].pose = newPose;
                    _this.robots[index].initialPose = newPose;
                }
            });
        };
        Scene.prototype.stepBackground = function (num) {
            if (this.currentBackground == 2) {
                this.ruler.removeMouseEvents();
                var myObstacle = this.obstacleList.find(function (obstacle) { return obstacle.myId === 0; });
                if (myObstacle) {
                    myObstacle.img = null;
                }
            }
            var configData = this.sim.getConfigData();
            this.obstacleList = [];
            this.colorAreaList = [];
            if (num < 0) {
                this.currentBackground++;
                this.currentBackground %= this.imgBackgroundList.length;
            }
            else {
                this.currentBackground = num;
            }
            if (this.currentBackground == 2) {
                this.ruler.addMouseEvents();
                var myObstacle = this.obstacleList.find(function (obstacle) { return obstacle.myId === 0; });
                if (myObstacle) {
                    myObstacle.img = this.images['roadWorks'];
                }
            }
            this.ground.w = this.imgBackgroundList[this.currentBackground].width;
            this.ground.h = this.imgBackgroundList[this.currentBackground].height;
            this.resetAllCanvas(this.imgBackgroundList[this.currentBackground]);
            this.resizeAll();
            this.sim.setNewConfig(configData);
        };
        Scene.prototype.update = function (dt, interpreterRunning) {
            var _this = this;
            var personalObstacleList = this.obstacleList.slice();
            this.robots.forEach(function (robot) { return personalObstacleList.push(robot.chassis); });
            personalObstacleList.push(this.ground);
            this.robots.forEach(function (robot) { return robot.updateActions(robot, dt, interpreterRunning); });
            this.robots.forEach(function (robot) { return robot.updateSensors(interpreterRunning, dt, _this.uCtx, _this.udCtx, personalObstacleList); });
            this.draw(dt, interpreterRunning);
        };
        Scene.prototype.toggleTrail = function () {
            this.robots.forEach(function (robot) {
                robot.hasTrail = !robot.hasTrail;
                robot.pose.xOld = robot.pose.x;
                robot.pose.yOld = robot.pose.y;
            });
        };
        Scene.prototype.resetPoseAndDrawings = function () {
            this.robots.forEach(function (robot) { return robot.resetPose(); });
            this.dCtx.canvas.width = this.dCtx.canvas.width;
            this.udCtx.canvas.width = this.udCtx.canvas.width;
        };
        return Scene;
    }());
    exports.Scene = Scene;
});
