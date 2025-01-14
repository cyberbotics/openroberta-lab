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
 * This class represents the <b>robSensors_colour_getMode</b>, <b>robSensors_colour_getSample</b> and <b>robSensors_colour_setMode</b> blocks from Blockly into
 * the AST (abstract syntax tree). Object from this class will generate code for setting the mode of the sensor or getting a sample from the sensor.<br/>
 * <br>
 * The client must provide the {@link SensorPort} and {@link LightSensorMode}. See enum {@link LightSensorMode} for all possible modes of the sensor.<br>
 * <br>
 * To create an instance from this class use the method {@link #make(LightSensorMode, SensorPort, BlocklyBlockProperties, BlocklyComment)}.<br>
 */
@NepoBasic(sampleValues = {@NepoSampleValue(blocklyFieldName = "INFRARED_AMBIENTLIGHT", sensor = "LIGHT", mode = "AMBIENTLIGHT"), @NepoSampleValue(blocklyFieldName = "LIGHT_LEVEL", sensor = "LIGHT_LEVEL", mode = "LIGHT_LEVEL"), @NepoSampleValue(blocklyFieldName = "LIGHT_LIGHT", sensor = "LIGHT", mode = "LIGHT"), @NepoSampleValue(blocklyFieldName = "LIGHT_AMBIENTLIGHT", sensor = "LIGHT", mode = "AMBIENTLIGHT"), @NepoSampleValue(blocklyFieldName = "LIGHT_VALUE", sensor = "LIGHT_VALUE", mode = "LIGHT_VALUE"), @NepoSampleValue(blocklyFieldName = "LIGHT_LINE", sensor = "LINETRACKER", mode = "LINE")}, containerType = "LIGHT_SENSING", category = "SENSOR", blocklyNames = {"robSensors_light_getSample", "sim_light_getSample"})
public final class LightSensor<V> extends ExternalSensor<V> {

    private LightSensor(SensorMetaDataBean sensorMetaDataBean, BlocklyBlockProperties properties, BlocklyComment comment) {
        super(properties, comment, sensorMetaDataBean);
        setReadOnly();
    }

    /**
     * Create object of the class {@link LightSensor}.
     *
     * @param mode in which the sensor is operating; must be <b>not</b> null; see enum {@link LightSensorMode} for all possible modes that the sensor have,
     * @param port on where the sensor is connected; must be <b>not</b> null; see enum {@link SensorPort} for all possible sensor ports,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment added from the user,
     * @return read only object of class {@link LightSensor}
     */
    public static <V> LightSensor<V> make(SensorMetaDataBean sensorMetaDataBean, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new LightSensor<V>(sensorMetaDataBean, properties, comment);
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
        return LightSensor.make(sensorData, Jaxb2Ast.extractBlockProperties(block), Jaxb2Ast.extractComment(block));
    }

}
