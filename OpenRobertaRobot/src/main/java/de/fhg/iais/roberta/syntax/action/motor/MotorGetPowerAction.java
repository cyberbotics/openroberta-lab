package de.fhg.iais.roberta.syntax.action.motor;

import de.fhg.iais.roberta.syntax.action.MoveAction;
import de.fhg.iais.roberta.transformer.forClass.NepoPhrase;
import de.fhg.iais.roberta.transformer.forField.NepoField;
import de.fhg.iais.roberta.util.dbc.Assert;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;
import de.fhg.iais.roberta.util.syntax.BlocklyConstants;

/**
 * This class represents the <b>robActions_motor_getPower</b> block from Blockly into the AST (abstract syntax tree). Object from this class will generate code
 * for returning the power of the motor on given port.<br/>
 * <br/>
 * The client must provide the {@link ActorPort} on which the motor is connected.
 */
@NepoPhrase(category = "ACTOR", blocklyNames = {"robActions_motor_getPower"}, containerType = "MOTOR_GET_POWER_ACTION")
public final class MotorGetPowerAction<V> extends MoveAction<V> {
    @NepoField(name = BlocklyConstants.MOTORPORT)
    public final String port;

    public MotorGetPowerAction(BlocklyBlockProperties properties, BlocklyComment comment, String port) {
        super(properties, comment, port);
        Assert.isTrue(port != null);
        this.port = port;
        setReadOnly();
    }

    /**
     * Creates instance of {@link MotorGetPowerAction}. This instance is read only and can not be modified.
     *
     * @param port on which the motor is connected that we want to check; must be <b>not</b> null,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment added from the user,
     * @return read only object of class {@link MotorGetPowerAction}
     */
    public static <V> MotorGetPowerAction<V> make(String port, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new MotorGetPowerAction<V>(properties, comment, port);
    }

}
