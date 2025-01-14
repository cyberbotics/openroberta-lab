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

/**
 * This class represents the <b>mbedSensors_pin_getSample</b> blocks from Blockly into the AST (abstract syntax tree). Object from this class will generate code
 * for reading values from a given pin.<br/>
 * <br>
 * <br>
 * To create an instance from this class use the method {@link #make(BlocklyBlockProperties, BlocklyComment)}.<br>
 */
@NepoBasic(sampleValues = {@NepoSampleValue(blocklyFieldName = "OUT_DIGITAL", sensor = "PIN_DIGITAL", mode = "DIGITAL"), @NepoSampleValue(blocklyFieldName = "PIN_PULSEHIGH", sensor = "PIN_PULSEHIGH", mode = "PULSEHIGH"), @NepoSampleValue(blocklyFieldName = "PIN_ANALOG", sensor = "PIN_ANALOG", mode = "ANALOG"), @NepoSampleValue(blocklyFieldName = "PIN_PULSELOW", sensor = "PIN_PULSELOW", mode = "PULSELOW"), @NepoSampleValue(blocklyFieldName = "PIN_DIGITAL", sensor = "PIN_DIGITAL", mode = "DIGITAL"), @NepoSampleValue(blocklyFieldName = "OUT_ANALOG", sensor = "PIN_ANALOG", mode = "ANALOG")}, containerType = "PIN_READ_VALUE", category = "SENSOR", blocklyNames = {"robsensors_pin_getsample", "mbedSensors_pin_getSample", "robsensors_out_getsample"})
public final class PinGetValueSensor<V> extends ExternalSensor<V> {

    private PinGetValueSensor(SensorMetaDataBean sensorMetaDataBean, BlocklyBlockProperties properties, BlocklyComment comment) {
        super(properties, comment, sensorMetaDataBean);
        setReadOnly();
    }

    /**
     * Create object of the class {@link PinGetValueSensor}.
     *
     * @param port on which the sensor is connected; must be <b>not</b> null; see enum {@link SensorPort} for all possible ports that the sensor can be
     *     connected,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment added from the user,
     * @return read only object of {@link PinGetValueSensor}
     */
    public static <V> PinGetValueSensor<V> make(SensorMetaDataBean sensorMetaDataBean, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new PinGetValueSensor<>(sensorMetaDataBean, properties, comment);
    }

    /**
     * Transformation from JAXB object to corresponding AST object.
     *
     * @param helper class for making the transformation
     * @return corresponding AST object
     */
    public static <V> Phrase<V> jaxbToAst(Block block, Jaxb2ProgramAst<V> helper) {
        SensorMetaDataBean sensorData = extractPortAndModeAndSlot(block, helper);
        return PinGetValueSensor.make(sensorData, Jaxb2Ast.extractBlockProperties(block), Jaxb2Ast.extractComment(block));
    }
}
