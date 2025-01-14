package de.fhg.iais.roberta.syntax.functions.arduino;

import java.util.List;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Value;
import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.syntax.lang.expr.Expr;
import de.fhg.iais.roberta.syntax.lang.functions.Function;
import de.fhg.iais.roberta.transformer.Ast2Jaxb;
import de.fhg.iais.roberta.transformer.ExprParam;
import de.fhg.iais.roberta.transformer.Jaxb2Ast;
import de.fhg.iais.roberta.transformer.Jaxb2ProgramAst;
import de.fhg.iais.roberta.transformer.forClass.NepoBasic;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.util.dbc.Assert;
import de.fhg.iais.roberta.util.syntax.Assoc;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;
import de.fhg.iais.roberta.util.syntax.BlocklyConstants;

/**
 * This class represents the <b>mbedImage_invert</b> blocks from Blockly into the AST (abstract syntax tree).<br>
 * <br>
 * The user must provide image to be inverted. <br>
 * To create an instance from this class use the method {@link #make(Expr, BlocklyBlockProperties, BlocklyComment)}.<br>
 */
@NepoBasic(containerType = "LED_MATRIX_IMAGE_INVERT", category = "FUNCTION", blocklyNames = {"mBotImage_invert"})
public final class LEDMatrixImageInvertFunction<V> extends Function<V> {
    public final Expr<V> image;

    private LEDMatrixImageInvertFunction(Expr<V> image, BlocklyBlockProperties properties, BlocklyComment comment) {
        super(properties, comment);
        Assert.notNull(image);

        this.image = image;
        setReadOnly();
    }

    /**
     * Creates instance of {@link LEDMatrixImageInvertFunction}. This instance is read only and can not be modified.
     *
     * @param image ; must be <b>not</b> null,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment that user has added to the block,
     * @return read only object of class {@link LEDMatrixImageInvertFunction}
     */
    public static <V> LEDMatrixImageInvertFunction<V> make(Expr<V> image, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new LEDMatrixImageInvertFunction<>(image, properties, comment);
    }

    /**
     * @return image under invertion
     */
    public Expr<V> getImage() {
        return this.image;
    }

    @Override
    public int getPrecedence() {
        return 10;
    }

    @Override
    public Assoc getAssoc() {
        return Assoc.LEFT;
    }

    @Override
    public BlocklyType getReturnType() {
        return BlocklyType.VOID;
    }

    @Override
    public String toString() {
        return "ImageInvertFunction [" + this.image + "]";
    }

    /**
     * Transformation from JAXB object to corresponding AST object.
     *
     * @param block for transformation
     * @param helper class for making the transformation
     * @return corresponding AST object
     */
    public static <V> Phrase<V> jaxbToAst(Block block, Jaxb2ProgramAst<V> helper) {
        List<Value> values = Jaxb2Ast.extractValues(block, (short) 1);
        Phrase<V> image = helper.extractValue(values, new ExprParam(BlocklyConstants.VAR, BlocklyType.PREDEFINED_IMAGE));
        return LEDMatrixImageInvertFunction.make(Jaxb2Ast.convertPhraseToExpr(image), Jaxb2Ast.extractBlockProperties(block), Jaxb2Ast.extractComment(block));
    }

    @Override
    public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2Jaxb.setBasicProperties(this, jaxbDestination);

        Ast2Jaxb.addValue(jaxbDestination, BlocklyConstants.VAR, this.image);
        return jaxbDestination;
    }

}
