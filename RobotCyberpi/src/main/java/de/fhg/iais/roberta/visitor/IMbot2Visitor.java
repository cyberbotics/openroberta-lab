package de.fhg.iais.roberta.visitor;

import de.fhg.iais.roberta.syntax.action.mbot2.DisplaySetColourAction;
import de.fhg.iais.roberta.syntax.action.mbot2.LedBrightnessAction;
import de.fhg.iais.roberta.syntax.action.mbot2.LedOnActionWithIndex;
import de.fhg.iais.roberta.syntax.action.mbot2.LedsOffAction;
import de.fhg.iais.roberta.syntax.action.mbot2.PlayRecordingAction;
import de.fhg.iais.roberta.syntax.action.mbot2.PrintlnAction;
import de.fhg.iais.roberta.syntax.action.mbot2.QuadRGBLightOffAction;
import de.fhg.iais.roberta.syntax.action.mbot2.QuadRGBLightOnAction;
import de.fhg.iais.roberta.syntax.action.mbot2.Ultrasonic2LEDAction;
import de.fhg.iais.roberta.syntax.sensor.mbot2.GyroResetAxis;
import de.fhg.iais.roberta.syntax.sensor.mbot2.Joystick;
import de.fhg.iais.roberta.syntax.sensor.mbot2.QuadRGBSensor;
import de.fhg.iais.roberta.syntax.sensor.mbot2.SoundRecord;
import de.fhg.iais.roberta.visitor.hardware.actor.IActors4AutonomousDriveRobots;
import de.fhg.iais.roberta.visitor.hardware.sensor.ISensorVisitor;

/**
 * Interface to be used with the visitor pattern to traverse an AST (and generate code, e.g.).
 */
public interface IMbot2Visitor<V> extends IActors4AutonomousDriveRobots<V>, ISensorVisitor<V> {

    V visitJoystick(Joystick<V> joystick);

    V visitSoundRecord(SoundRecord<V> soundRecord);

    V visitGyroResetAxis(GyroResetAxis<V> gyroResetAxis);

    V visitPlayRecordingAction(PlayRecordingAction<V> playRecordingAction);

    V visitDisplaySetColourAction(DisplaySetColourAction<V> displaySetColourAction);

    V visitQuadRGBSensor(QuadRGBSensor<V> quadRGBSensor);

    V visitQuadRGBLightOnAction(QuadRGBLightOnAction<V> quadRGBLightOnAction);

    V visitQuadRGBLightOffAction(QuadRGBLightOffAction<V> quadRGBLightOffAction);

    V visitUltrasonic2LEDAction(Ultrasonic2LEDAction<V> ultrasonic2LEDAction);

    V visitLedsOffAction(LedsOffAction<V> ledsOffAction);

    V visitLedBrightnessAction(LedBrightnessAction<V> ledBrightnessAction);

    V visitPrintlnAction(PrintlnAction<V> printlnAction);

    V visitLedOnActionWithIndex(LedOnActionWithIndex<V> ledOnActionWithIndex);
}