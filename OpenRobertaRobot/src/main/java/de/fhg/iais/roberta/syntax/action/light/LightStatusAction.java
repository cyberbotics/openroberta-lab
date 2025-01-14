package de.fhg.iais.roberta.syntax.action.light;

import java.util.List;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Field;
import de.fhg.iais.roberta.factory.BlocklyDropdownFactory;
import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.syntax.action.Action;
import de.fhg.iais.roberta.transformer.Ast2Jaxb;
import de.fhg.iais.roberta.transformer.Jaxb2Ast;
import de.fhg.iais.roberta.transformer.Jaxb2ProgramAst;
import de.fhg.iais.roberta.transformer.forClass.NepoBasic;
import de.fhg.iais.roberta.util.dbc.Assert;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;
import de.fhg.iais.roberta.util.syntax.BlocklyConstants;
import de.fhg.iais.roberta.util.syntax.WithUserDefinedPort;

/**
 * This class represents the <b>robActions_brickLight_off</b> and <b>robActions_brickLight_reset</b> blocks from Blockly into the AST (abstract syntax tree).
 * Object from this class will generate code for turning the light off or reset them.<br/>
 * <br/>
 * The client must provide the {@link Status}.
 */
@NepoBasic(containerType = "LIGHT_STATUS_ACTION", category = "ACTOR", blocklyNames = {"robActions", "robActions_brickLight_reset", "robActions_brickLight_off", "mbedActions_leds_off", "robActions_led_off"})
public final class LightStatusAction<V> extends Action<V> implements WithUserDefinedPort<V> {
    public final Status status;
    public final String userDefinedPort;

    private LightStatusAction(String userDefinedPort, Status status, BlocklyBlockProperties properties, BlocklyComment comment) {
        super(properties, comment);
        Assert.isTrue(status != null);
        this.status = status;
        this.userDefinedPort = userDefinedPort;
        setReadOnly();
    }

    /**
     * Creates instance of {@link LightStatusAction}. This instance is read only and can not be modified.
     *
     * @param status in which we want to set the lights (off or reset); must be <b>not</b> null,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment added from the user,
     * @return read only object of class {@link LightStatusAction}
     */
    public static <V> LightStatusAction<V> make(String userDefinedPort, Status status, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new LightStatusAction<>(userDefinedPort, status, properties, comment);
    }

    /**
     * @return status of the lights user wants to set.
     */
    public Status getStatus() {
        return this.status;
    }

    @Override
    public String toString() {
        return "LightStatusAction [" + this.userDefinedPort + ", " + this.status + "]";
    }

    /**
     * @return port.
     */
    public String getUserDefinedPort() {
        return this.userDefinedPort;
    }

    /**
     * Transformation from JAXB object to corresponding AST object.
     *
     * @param block for transformation
     * @param helper class for making the transformation
     * @return corresponding AST object
     */
    public static <V> Phrase<V> jaxbToAst(Block block, Jaxb2ProgramAst<V> helper) {
        Status status = LightStatusAction.Status.RESET;
        BlocklyDropdownFactory factory = helper.getDropdownFactory();
        List<Field> fields = Jaxb2Ast.extractFields(block, (short) 1);
        String port = Jaxb2Ast.extractField(fields, BlocklyConstants.ACTORPORT, "0");
        if ( block.getType().equals(BlocklyConstants.ROB_ACTIONS_BRICK_LIGHT_OFF)
            || block.getType().equals("mbedActions_leds_off")
            || block.getType().equals("robActions_leds_off") ) {
            status = LightStatusAction.Status.OFF;
        }
        return LightStatusAction.make(Jaxb2Ast.sanitizePort(port), status, Jaxb2Ast.extractBlockProperties(block), Jaxb2Ast.extractComment(block));
    }

    @Override
    public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2Jaxb.setBasicProperties(this, jaxbDestination);
        if ( !this.userDefinedPort.toString().equals("0") ) {
            Ast2Jaxb.addField(jaxbDestination, BlocklyConstants.ACTORPORT, getUserDefinedPort().toString());
        }
        return jaxbDestination;
    }

    /**
     * Status in which user can set the lights.
     */
    public static enum Status {
        OFF, RESET;
    }
}
