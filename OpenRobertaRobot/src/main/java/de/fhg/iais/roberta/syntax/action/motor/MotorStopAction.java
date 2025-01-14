package de.fhg.iais.roberta.syntax.action.motor;

import java.util.List;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Field;
import de.fhg.iais.roberta.factory.BlocklyDropdownFactory;
import de.fhg.iais.roberta.inter.mode.action.IMotorStopMode;
import de.fhg.iais.roberta.mode.action.MotorStopMode;
import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.syntax.action.MoveAction;
import de.fhg.iais.roberta.transformer.Ast2Jaxb;
import de.fhg.iais.roberta.transformer.Jaxb2Ast;
import de.fhg.iais.roberta.transformer.Jaxb2ProgramAst;
import de.fhg.iais.roberta.transformer.forClass.NepoBasic;
import de.fhg.iais.roberta.util.dbc.Assert;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;
import de.fhg.iais.roberta.util.syntax.BlocklyConstants;

/**
 * This class represents the <b>robActions_motor_stop</b> block from Blockly into the AST (abstract syntax tree). Object from this class will generate code for
 * turning off the motor.<br/>
 * <br/>
 * The client must provide the {@link ActorPort} and {@link MotorStopMode} (is the motor breaking or not).
 */
@NepoBasic(containerType = "MOTOR_STOP_ACTION", category = "ACTOR", blocklyNames = {"makeblockActions_motor_stop", "sim_motor_stop", "mbedActions_motor_stop", "robActions_motor_stop"})
public final class MotorStopAction<V> extends MoveAction<V> {
    public final IMotorStopMode mode;

    private MotorStopAction(String port, IMotorStopMode mode, BlocklyBlockProperties properties, BlocklyComment comment) {
        super(properties, comment, port);
        Assert.isTrue(port != null);
        this.mode = mode;
        setReadOnly();
    }

    /**
     * Creates instance of {@link MotorStopAction}. This instance is read only and can not be modified.
     *
     * @param port {@link ActorPort} on which the motor is connected; must be <b>not</b> null,
     * @param mode of stopping {@link MotorStopMode}; must be <b>not</b> null,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment added from the user,
     * @return read only object of class {@link MotorStopAction}
     */
    public static <V> MotorStopAction<V> make(String port, IMotorStopMode mode, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new MotorStopAction<V>(port, mode, properties, comment);
    }

    /**
     * @return stopping mode in which the motor is set.
     */
    public IMotorStopMode getMode() {
        return this.mode;
    }

    @Override
    public String toString() {
        if ( getMode() != null ) {
            return "MotorStop [port=" + getUserDefinedPort() + ", mode=" + this.mode + "]";
        } else {
            return "MotorStop [port=" + getUserDefinedPort() + "]";
        }
    }

    /**
     * Transformation from JAXB object to corresponding AST object.
     *
     * @param block for transformation
     * @param helper class for making the transformation
     * @return corresponding AST object
     */
    public static <V> Phrase<V> jaxbToAst(Block block, Jaxb2ProgramAst<V> helper) {

        BlocklyDropdownFactory factory = helper.getDropdownFactory();
        List<Field> fields = Jaxb2Ast.extractFields(block, (short) 2);
        String portName = Jaxb2Ast.extractField(fields, BlocklyConstants.MOTORPORT);
        if ( fields.size() > 1 ) {
            String modeName = Jaxb2Ast.extractField(fields, BlocklyConstants.MODE);
            return MotorStopAction
                .make(
                    Jaxb2Ast.sanitizePort(portName),
                    factory.getMotorStopMode(modeName),
                    Jaxb2Ast.extractBlockProperties(block),
                    Jaxb2Ast.extractComment(block));

        }
        return MotorStopAction.make(Jaxb2Ast.sanitizePort(portName), null, Jaxb2Ast.extractBlockProperties(block), Jaxb2Ast.extractComment(block));

    }

    @Override
    public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2Jaxb.setBasicProperties(this, jaxbDestination);

        Ast2Jaxb.addField(jaxbDestination, BlocklyConstants.MOTORPORT, getUserDefinedPort().toString());
        if ( getMode() != null ) {
            Ast2Jaxb.addField(jaxbDestination, BlocklyConstants.MODE, getMode().toString());
        }

        return jaxbDestination;
    }
}
