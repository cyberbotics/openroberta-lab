package de.fhg.iais.roberta.syntax.sensor.mbed;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.syntax.sensor.ExternalSensor;
import de.fhg.iais.roberta.transformer.Jaxb2Ast;
import de.fhg.iais.roberta.transformer.Jaxb2ProgramAst;
import de.fhg.iais.roberta.transformer.forClass.NepoBasic;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;
import de.fhg.iais.roberta.util.ast.SensorMetaDataBean;

@NepoBasic(containerType = "RADIO_RSSI", category = "SENSOR", blocklyNames = {"mbedSensors_getRssi", "robsensors_rssi_getsample"})
public final class RadioRssiSensor<V> extends ExternalSensor<V> {

    private RadioRssiSensor(SensorMetaDataBean sensorMetaDataBean, BlocklyBlockProperties properties, BlocklyComment comment) {
        super(properties, comment, sensorMetaDataBean);
        setReadOnly();
    }

    public static <V> RadioRssiSensor<V> make(SensorMetaDataBean sensorMetaDataBean, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new RadioRssiSensor<>(sensorMetaDataBean, properties, comment);
    }

    public static <V> Phrase<V> jaxbToAst(Block block, Jaxb2ProgramAst<V> helper) {
        SensorMetaDataBean sensorData = extractPortAndModeAndSlot(block, helper);
        return RadioRssiSensor.make(sensorData, Jaxb2Ast.extractBlockProperties(block), Jaxb2Ast.extractComment(block));
    }
}
