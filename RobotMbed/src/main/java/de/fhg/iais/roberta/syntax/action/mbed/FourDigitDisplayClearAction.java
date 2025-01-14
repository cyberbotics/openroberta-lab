package de.fhg.iais.roberta.syntax.action.mbed;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.syntax.action.Action;
import de.fhg.iais.roberta.syntax.lang.expr.Expr;
import de.fhg.iais.roberta.transformer.Ast2Jaxb;
import de.fhg.iais.roberta.transformer.Jaxb2Ast;
import de.fhg.iais.roberta.transformer.Jaxb2ProgramAst;
import de.fhg.iais.roberta.transformer.forClass.NepoBasic;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;

/**
 * This class represents the <b>mbedActions_fourdigitdisplay_show</b> block from Blockly into the AST (abstract syntax tree). Object from this class will
 * generate code for showing numbers on the Grove 4-Digit Display.<br>
 * <br>
 * To create an instance from this class use the method {@link #make(Expr, BlocklyBlockProperties, BlocklyComment)}.<br>
 * <br>
 */
@NepoBasic(containerType = "FOURDIGITDISPLAY_CLEAR_ACTION", category = "ACTOR", blocklyNames = {"mbedActions_fourDigitDisplay_clear"})
public final class FourDigitDisplayClearAction<V> extends Action<V> {

    private FourDigitDisplayClearAction(BlocklyBlockProperties properties, BlocklyComment comment) {
        super(properties, comment);
        setReadOnly();
    }

    /**
     * Creates instance of {@link FourDigitDisplayClearAction}. This instance is read only and can not be modified.
     *
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment added from the user,
     * @return read only object of class {@link FourDigitDisplayClearAction}
     */
    public static <V> FourDigitDisplayClearAction<V> make(BlocklyBlockProperties properties, BlocklyComment comment) {
        return new FourDigitDisplayClearAction<>(properties, comment);
    }

    @Override
    public String toString() {
        return "FourDigitDisplayClearAction []";
    }

    /**
     * Transformation from JAXB object to corresponding AST object.
     *
     * @param block for transformation
     * @param helper class for making the transformation
     * @return corresponding AST object
     */
    public static <V> Phrase<V> jaxbToAst(Block block, Jaxb2ProgramAst<V> helper) {
        return FourDigitDisplayClearAction.make(Jaxb2Ast.extractBlockProperties(block), Jaxb2Ast.extractComment(block));
    }

    @Override
    public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2Jaxb.setBasicProperties(this, jaxbDestination);

        return jaxbDestination;
    }

}
