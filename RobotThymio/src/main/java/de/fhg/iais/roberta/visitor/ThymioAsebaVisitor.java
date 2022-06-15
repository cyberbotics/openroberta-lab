package de.fhg.iais.roberta.visitor;

import java.util.List;

import com.google.common.collect.ClassToInstanceMap;

import de.fhg.iais.roberta.bean.CodeGeneratorSetupBean;
import de.fhg.iais.roberta.bean.IProjectBean;
import de.fhg.iais.roberta.components.ConfigurationAst;
import de.fhg.iais.roberta.constants.ThymioConstants;
import de.fhg.iais.roberta.inter.mode.action.IDriveDirection;
import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.syntax.action.motor.MotorGetPowerAction;
import de.fhg.iais.roberta.syntax.action.motor.MotorOnAction;
import de.fhg.iais.roberta.syntax.action.motor.MotorSetPowerAction;
import de.fhg.iais.roberta.syntax.action.motor.MotorStopAction;
import de.fhg.iais.roberta.syntax.action.motor.differential.CurveAction;
import de.fhg.iais.roberta.syntax.action.motor.differential.DriveAction;
import de.fhg.iais.roberta.syntax.action.motor.differential.MotorDriveStopAction;
import de.fhg.iais.roberta.syntax.action.motor.differential.TurnAction;
import de.fhg.iais.roberta.syntax.action.serial.SerialWriteAction;
import de.fhg.iais.roberta.syntax.configuration.ConfigurationComponent;
import de.fhg.iais.roberta.syntax.lang.blocksequence.MainTask;
import de.fhg.iais.roberta.syntax.lang.expr.ColorConst;
import de.fhg.iais.roberta.syntax.lang.expr.ConnectConst;
import de.fhg.iais.roberta.syntax.lang.expr.RgbColor;
import de.fhg.iais.roberta.syntax.lang.stmt.StmtList;
import de.fhg.iais.roberta.syntax.lang.stmt.TernaryExpr;
import de.fhg.iais.roberta.syntax.lang.stmt.WaitStmt;
import de.fhg.iais.roberta.syntax.lang.stmt.WaitTimeStmt;
import de.fhg.iais.roberta.syntax.sensor.generic.TimerSensor;
import de.fhg.iais.roberta.util.dbc.DbcException;
import de.fhg.iais.roberta.util.syntax.MotionParam;
import de.fhg.iais.roberta.util.syntax.SC;
import de.fhg.iais.roberta.visitor.hardware.actor.IDifferentialMotorVisitor;

public final class ThymioAsebaVisitor extends AbstractAsebaVisitor implements IDifferentialMotorVisitor<Void> {//} implements IMbot2Visitor<Void> {

    private final ConfigurationAst configurationAst;
    private String rightMotorPort;

    public ThymioAsebaVisitor(
        List<List<Phrase<Void>>> programPhrases, ClassToInstanceMap<IProjectBean> beans, ConfigurationAst configurationAst) {
        super(programPhrases, beans);
        this.configurationAst = configurationAst;
//        setRightMotorPort();
    }

    @Override
    public Void visitDriveAction(DriveAction<Void> driveAction) {
        String multiplier = driveAction.getDirection().toString().equals(SC.FOREWARD) ? "" : "-";
        this.sb.append("motor.left.target = ").append(multiplier);
        driveAction.getParam().getSpeed().accept(this);
        nlIndent();
        this.sb.append("motor.right.target = ").append(multiplier);
        driveAction.getParam().getSpeed().accept(this);
        return null;
    }

    @Override
    public Void visitCurveAction(CurveAction<Void> curveAction) {
        return null;
    }

    @Override
    public Void visitMotorGetPowerAction(MotorGetPowerAction<Void> motorGetPowerAction) {
        return null;
    }

    @Override
    public Void visitMotorOnAction(MotorOnAction<Void> motorOnAction) {
        return null;
    }

    @Override
    public Void visitMotorSetPowerAction(MotorSetPowerAction<Void> motorSetPowerAction) {
        return null;
    }

    @Override
    public Void visitMotorStopAction(MotorStopAction<Void> motorStopAction) {
        return null;
    }

    @Override
    public Void visitTurnAction(TurnAction<Void> turnAction) {
        return null;
    }

    @Override
    public Void visitMotorDriveStopAction(MotorDriveStopAction<Void> stopAction) {
        this.sb.append("motor.left.target = 0");
        nlIndent();
        this.sb.append("motor.right.target = 0");
        return null;
    }

    @Override
    protected void generateProgramPrefix(boolean withWrapping) {
        if ( !withWrapping ) {
            return;
        }
        nlIndent();
        this.sb.append("<!DOCTYPE aesl-source>");
        nlIndent();
        this.sb.append("<network>");
        nlIndent();
        this.sb.append("<!--node thymio-II-->");
        nlIndent();
        this.sb.append("<node nodeId=\"51938\" name=\"thymio-II\">");
        nlIndent();
        appendRobotVariables();
        generateTimerVariables();
        if ( !this.getBean(CodeGeneratorSetupBean.class).getUsedMethods().isEmpty() ) {
            String helperMethodImpls =
                this.getBean(CodeGeneratorSetupBean.class)
                    .getHelperMethodGenerator()
                    .getHelperMethodDefinitions(this.getBean(CodeGeneratorSetupBean.class).getUsedMethods());
            this.sb.append(helperMethodImpls);
        }
    }

    private void appendRobotVariables() {
        ConfigurationComponent diffDrive = getDiffDrive();
        if ( diffDrive != null ) {
            nlIndent();
            double circumference = 6.5 * Math.PI;
            double trackWidth = 11.5;
            this.sb.append("var _trackWidth = ");
            this.sb.append((int) Math.floor(trackWidth));
            nlIndent();
            this.sb.append("var _circumference = ");
            this.sb.append((int) Math.floor(circumference));
            nlIndent();
        }
    }

    private void generateTimerVariables() {
//        this.getBean(UsedHardwareBean.class)
//            .getUsedSensors()
//            .stream()
//            .filter(usedSensor -> usedSensor.getType().equals(SC.TIMER))
//            .collect(Collectors.groupingBy(UsedSensor::getPort))
//            .keySet()
//            .forEach(port -> {
//                this.usedGlobalVarInFunctions.add("_timer" + port);
//                this.sb.append("_timer").append(port).append(" = cyberpi.timer.get()");
//                nlIndent();
//            });
    }

    @Override
    public Void visitMainTask(MainTask<Void> mainTask) {
        StmtList<Void> variables = mainTask.getVariables();
        variables.accept(this);
        generateUserDefinedMethods();
//        this.sb.append("def run():");
//        incrIndentation();
//        if ( !this.usedGlobalVarInFunctions.isEmpty() ) {
//            nlIndent();
//            this.sb.append("global ").append(String.join(", ", this.usedGlobalVarInFunctions));
//        }

        return null;
    }

    @Override
    protected void generateProgramSuffix(boolean withWrapping) {
        if ( !withWrapping ) {
            return;
        }
        nlIndent();
        nlIndent();
        this.sb.append("</node>");
        nlIndent();
        this.sb.append("</network>");
        nlIndent();
        nlIndent();
    }

    private void appendTurnForAction(TurnAction<Void> turnAction, String direction) {
        this.sb.append("mbot2.turn(");
        String multi = "";
        String optBracket = "";
        if ( direction.equals("left") ) {
            multi = "-(";
            optBracket = ")";
        }
        sb.append(multi);
        turnAction.getParam().getDuration().getValue().accept(this);
        sb.append(optBracket);
        this.sb.append(", ");
        turnAction.getParam().getSpeed().accept(this);
        this.sb.append(")");
    }

    private void appendCurveAction(MotionParam<Void> speedLeft, MotionParam<Void> speedRight, IDriveDirection direction) {
        this.sb.append("mbot2.drive_speed(");
        boolean isForward = direction.toString().equals(SC.FOREWARD);
        if ( isForward ) {
            speedLeft.getSpeed().accept(this);
            this.sb.append(", -(");
            speedRight.getSpeed().accept(this);
            this.sb.append(")");
        } else {
            this.sb.append("-(");
            speedLeft.getSpeed().accept(this);
            this.sb.append("),");
            speedRight.getSpeed().accept(this);
        }
        this.sb.append(")");
    }

    private ConfigurationComponent getDiffDrive() {
        for ( ConfigurationComponent component : this.configurationAst.getConfigurationComponents().values() ) {
            if ( component.getComponentType().equals(ThymioConstants.DIFFERENTIALDRIVE) ) {
                return component;
            }
        }
        return null;
    }

    @Override
    public Void visitConnectConst(ConnectConst<Void> connectConst) {
        return null;
    }


    @Override
    public Void visitTimerSensor(TimerSensor<Void> timerSensor) {
        switch ( timerSensor.getMode() ) {
            case SC.DEFAULT:
            case SC.VALUE:
                this.sb.append("((cyberpi.timer.get() - _timer").append(timerSensor.getUserDefinedPort()).append(")*1000)");
                break;
            case SC.RESET:
                this.sb.append("_timer").append(timerSensor.getUserDefinedPort()).append(" = cyberpi.timer.get()");
                break;
            default:
                throw new DbcException("Invalid Time Mode!");
        }
        return null;
    }

    @Override
    public Void visitWaitStmt(WaitStmt<Void> waitStmt) {
        this.sb.append("while True:");
        incrIndentation();
        visitStmtList(waitStmt.getStatements());
        decrIndentation();
        return null;
    }

    @Override
    public Void visitWaitTimeStmt(WaitTimeStmt<Void> waitTimeStmt) {
        this.sb.append("time.sleep(");
        waitTimeStmt.getTime().accept(this);
        this.sb.append("/1000)");
        return null;
    }

    @Override
    public Void visitSerialWriteAction(SerialWriteAction<Void> serialWriteAction) {
        return null;
    }

    @Override
    public Void visitColorConst(ColorConst<Void> colorConst) {
        this.sb.append("(").append(colorConst.getRedChannelInt()).append(", ").append(colorConst.getGreenChannelInt()).append(", ").append(colorConst.getBlueChannelInt()).append(")");
        return null;
    }

    @Override
    public Void visitRgbColor(RgbColor<Void> rgbColor) {
        this.sb.append("(");
        rgbColor.getR().accept(this);
        this.sb.append(", ");
        rgbColor.getG().accept(this);
        this.sb.append(", ");
        rgbColor.getB().accept(this);
        this.sb.append(")");
        return null;
    }

    @Override
    protected void generateCodeFromTernary(TernaryExpr<Void> ternaryExpr) {

    }
}
