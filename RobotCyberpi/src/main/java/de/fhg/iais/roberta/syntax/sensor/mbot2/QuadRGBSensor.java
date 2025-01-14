package de.fhg.iais.roberta.syntax.sensor.mbot2;

import de.fhg.iais.roberta.blockly.generated.Mutation;
import de.fhg.iais.roberta.syntax.action.mbot2.DisplaySetColourAction;
import de.fhg.iais.roberta.syntax.sensor.Sensor;
import de.fhg.iais.roberta.transformer.forClass.NepoPhrase;
import de.fhg.iais.roberta.transformer.forClass.NepoSampleValue;
import de.fhg.iais.roberta.transformer.forField.NepoField;
import de.fhg.iais.roberta.transformer.forField.NepoMutation;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;
import de.fhg.iais.roberta.util.syntax.BlocklyConstants;
import de.fhg.iais.roberta.util.ast.SensorMetaDataBean;
import de.fhg.iais.roberta.util.syntax.WithUserDefinedPort;

@NepoPhrase(sampleValues = {@NepoSampleValue(blocklyFieldName="QUADRGB_COLOUR",sensor="QUADRGB",mode="COLOUR"),@NepoSampleValue(blocklyFieldName="QUADRGB_AMBIENTLIGHT",sensor="QUADRGB",mode="AMBIENTLIGHT"),@NepoSampleValue(blocklyFieldName="QUADRGB_LINE",sensor="QUADRGB",mode="LINE")}, category = "SENSOR", blocklyNames = {"robSensors_line_getSample", "robSensors_quadrgb_getSample"}, containerType = "QUAD_COLOR_SENSING")
public final class QuadRGBSensor<V> extends Sensor<V> implements WithUserDefinedPort<V> {
    @NepoMutation(fieldName = BlocklyConstants.MODE)
    public final Mutation mutation;
    @NepoField(name = BlocklyConstants.MODE)
    public final String mode;
    @NepoField(name = BlocklyConstants.SENSORPORT)
    public final String sensorPort;
    @NepoField(name = BlocklyConstants.SLOT)
    public final String slot;

    public QuadRGBSensor(BlocklyBlockProperties properties, BlocklyComment comment, Mutation mutation, String mode, String sensorPort, String slot) {
        super(properties, comment);
        this.mutation = mutation;
        this.mode = mode;
        this.sensorPort = sensorPort;
        this.slot = slot;
        setReadOnly();
    }

    /**
     * Creates instance of {@link QuadRGBSensor}. This instance is read only and can not be modified.
     *
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment added from the user,
     * @return read only object of class {@link DisplaySetColourAction}
     */
    public static <V> QuadRGBSensor<V> make(SensorMetaDataBean sensorMetaDataBean, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new QuadRGBSensor<>(properties, comment, sensorMetaDataBean.getMutation(), sensorMetaDataBean.getMode(), sensorMetaDataBean.getPort(), sensorMetaDataBean.getSlot());
    }

    @Override
    public String getUserDefinedPort() {
        return this.sensorPort;
    }

}
