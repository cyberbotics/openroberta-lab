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
@NepoBasic(sampleValues = {@NepoSampleValue(blocklyFieldName = "LIGHTVEML_UVLIGHT", sensor = "LIGHTVEML_LIGHT", mode = "UVLIGHT"), @NepoSampleValue(blocklyFieldName = "LIGHTVEML_LIGHT", sensor = "LIGHTVEML_LIGHT", mode = "LIGHT")}, containerType = "VEMLLIGHT_SENSING", category = "SENSOR", blocklyNames = {"robSensors_lightveml_getSample"})
public final class VemlLightSensor<V> extends ExternalSensor<V> {

    private VemlLightSensor(SensorMetaDataBean sensorMetaDataBean, BlocklyBlockProperties properties, BlocklyComment comment) {
        super(properties, comment, sensorMetaDataBean);
        this.setReadOnly();
    }

    /**
     * Create object of the class {@link VemlLightSensor}.
     *
     * @param mode in which the sensor is operating; must be <b>not</b> null; see enum {@link LightSensorMode} for all possible modes that the sensor have,
     * @param port on where the sensor is connected; must be <b>not</b> null; see enum {@link SensorPort} for all possible sensor ports,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment added from the user,
     * @return read only object of class {@link VemlLightSensor}
     */
    public static <V> VemlLightSensor<V> make(SensorMetaDataBean sensorMetaDataBean, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new VemlLightSensor<>(sensorMetaDataBean, properties, comment);
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
        return VemlLightSensor.make(sensorData, Jaxb2Ast.extractBlockProperties(block), Jaxb2Ast.extractComment(block));
    }

}
