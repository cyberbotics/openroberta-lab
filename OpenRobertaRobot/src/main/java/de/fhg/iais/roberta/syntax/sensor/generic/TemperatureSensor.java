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
 * This class represents the <b>mbedSensors_temperature_getSample</b> blocks from Blockly into the AST (abstract syntax tree). Object from this class will
 * generate code for checking if the sensor is pressed.<br/>
 * <br>
 * <br>
 * To create an instance from this class use the method {@link #make(BlocklyBlockProperties, BlocklyComment)}.<br>
 */
@NepoBasic(sampleValues = {@NepoSampleValue(blocklyFieldName = "TEMPERATURE_PRESSURE", sensor = "TEMPERATURE", mode = "PRESSURE"), @NepoSampleValue(blocklyFieldName = "TEMPERATURE", sensor = "TEMPERATURE", mode = "TEMPERATURE"), @NepoSampleValue(blocklyFieldName = "TEMPERATURE_TEMPERATURE", sensor = "TEMPERATURE", mode = "TEMPERATURE"), @NepoSampleValue(blocklyFieldName = "TEMPERATURE_VALUE", sensor = "TEMPERATURE", mode = "TEMPERATURE")}, containerType = "TEMPERATURE_SENSING", category = "SENSOR", blocklyNames = {"mbedsensors_temperature_getsample", "robSensors_temperature_getSample"})
public final class TemperatureSensor<V> extends ExternalSensor<V> {

    private TemperatureSensor(SensorMetaDataBean sensorMetaDataBean, BlocklyBlockProperties properties, BlocklyComment comment) {
        super(properties, comment, sensorMetaDataBean);
        setReadOnly();
    }

    /**
     * Create object of the class {@link TemperatureSensor}.
     *
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment added from the user,
     * @return read only object of {@link TemperatureSensor}
     */
    public static <V> TemperatureSensor<V> make(SensorMetaDataBean sensorMetaDataBean, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new TemperatureSensor<V>(sensorMetaDataBean, properties, comment);
    }

    /**
     * Transformation from JAXB object to corresponding AST object.
     *
     * @param block for transformation
     * @param helper class for making the transformation
     * @return corresponding AST object
     */
    public static <V> Phrase<V> jaxbToAst(Block block, Jaxb2ProgramAst<V> helper) {
        SensorMetaDataBean sensorData = extractPortModeSlotMutationHide(block, helper);
        return TemperatureSensor.make(sensorData, Jaxb2Ast.extractBlockProperties(block), Jaxb2Ast.extractComment(block));

    }
}
