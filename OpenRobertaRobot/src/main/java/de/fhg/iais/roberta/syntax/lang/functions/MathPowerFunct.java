package de.fhg.iais.roberta.syntax.lang.functions;

import java.util.List;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.syntax.lang.expr.Expr;
import de.fhg.iais.roberta.transformer.Ast2Jaxb;
import de.fhg.iais.roberta.transformer.forClass.NepoBasic;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.util.dbc.Assert;
import de.fhg.iais.roberta.util.syntax.Assoc;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;
import de.fhg.iais.roberta.util.syntax.BlocklyConstants;
import de.fhg.iais.roberta.util.syntax.FunctionNames;

@NepoBasic(containerType = "MATH_POWER_FUNCT", category = "EXPR", blocklyNames = {})
public final class MathPowerFunct<V> extends Expr<V> {
    public final FunctionNames functName;
    public final List<Expr<V>> param;

    public MathPowerFunct(BlocklyBlockProperties properties, BlocklyComment comment, FunctionNames name, List<Expr<V>> param) {
        super(properties, comment);
        Assert.isTrue(name != null && param != null);
        this.functName = name;
        this.param = param;
        setReadOnly();
    }

    public static <V> MathPowerFunct<V> make(FunctionNames name, List<Expr<V>> param, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new MathPowerFunct<V>(properties, comment, name, param);
    }

    /**
     * @return name of the function
     */
    public FunctionNames getFunctName() {
        return this.functName;
    }

    /**
     * @return list of parameters for the function
     */
    public List<Expr<V>> getParam() {
        return this.param;
    }

    @Override
    public int getPrecedence() {
        return this.functName.getPrecedence();
    }

    @Override
    public String toString() {
        return "MathPowerFunct [" + this.functName + ", " + this.param + "]";
    }

    @Override
    public BlocklyType getVarType() {
        return BlocklyType.NOTHING;
    }

    @Override
    public Assoc getAssoc() {
        return this.functName.getAssoc();
    }

    @Override
    public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2Jaxb.setBasicProperties(this, jaxbDestination);

        Ast2Jaxb.addField(jaxbDestination, BlocklyConstants.OP, getFunctName().name());
        Ast2Jaxb.addValue(jaxbDestination, BlocklyConstants.A, getParam().get(0));
        Ast2Jaxb.addValue(jaxbDestination, BlocklyConstants.B, getParam().get(1));
        return jaxbDestination;
    }
}
