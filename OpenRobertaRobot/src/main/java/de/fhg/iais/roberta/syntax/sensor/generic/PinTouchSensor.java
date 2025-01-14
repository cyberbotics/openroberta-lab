package de.fhg.iais.roberta.syntax.sensor.generic;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.syntax.sensor.ExternalSensor;
import de.fhg.iais.roberta.transformer.Jaxb2Ast;
import de.fhg.iais.roberta.transformer.Jaxb2ProgramAst;
import de.fhg.iais.roberta.transformer.forClass.NepoBasic;
import de.fhg.iais.roberta.transformer.forClass.NepoSampleValue;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;
import de.fhg.iais.roberta.util.ast.SensorMetaDataBean;

@NepoBasic(sampleValues = {@NepoSampleValue(blocklyFieldName = "PIN_TOUCHED", sensor = "PIN_TOUCHED", mode = "PIN_TOUCHED"), @NepoSampleValue(blocklyFieldName = "PINTOUCH_PRESSED", sensor = "PINTOUCH", mode = "PRESSED")}, containerType = "PIN_TOUCH_SENSING", category = "SENSOR", blocklyNames = {"robsensors_pintouch_getsample"})
public final class PinTouchSensor<V> extends ExternalSensor<V> {

    private PinTouchSensor(SensorMetaDataBean sensorMetaDataBean, BlocklyBlockProperties properties, BlocklyComment comment) {
        super(properties, comment, sensorMetaDataBean);
        setReadOnly();
    }

    /**
     * Creates instance of {@link PinTouch}. This instance is read only and can not be modified.
     *
     * @return read only object of class {@link PinTouch}
     */
    public static <V> PinTouchSensor<V> make(SensorMetaDataBean sensorMetaDataBean, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new PinTouchSensor<>(sensorMetaDataBean, properties, comment);
    }

    /**
     * Transformation from JAXB object to corresponding AST object.
     *
     * @param block for transformation
     * @param helper class for making the transformation
     * @return corresponding AST object
     */
    public static <V> Phrase<V> jaxbToAst(Block block, Jaxb2ProgramAst<V> helper) {
        SensorMetaDataBean sensorData = extractPortAndModeAndSlot(block, helper);
        return PinTouchSensor.make(sensorData, Jaxb2Ast.extractBlockProperties(block), Jaxb2Ast.extractComment(block));
    }

}
