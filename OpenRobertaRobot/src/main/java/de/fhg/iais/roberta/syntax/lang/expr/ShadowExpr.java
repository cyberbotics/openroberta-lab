package de.fhg.iais.roberta.syntax.lang.expr;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.util.dbc.Assert;
import de.fhg.iais.roberta.util.syntax.Assoc;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;

public class ShadowExpr<V> extends Expr<V> {
    private final Expr<V> shadow;
    private final Expr<V> block;

    private ShadowExpr(Expr<V> shadow, Expr<V> block) {
        super(BlocklyBlockProperties.make("SHADOW_EXPR", "1"), null);
        Assert.isTrue(shadow != null);
        this.shadow = shadow;
        this.block = block;
        setReadOnly();
    }

    /**
     * create read only instance from {@link ShadowExpr}.
     *
     * @param defVal type of the value that the missing expression should have.
     * @return read only object of class {@link ShadowExpr}.
     */
    public static <V> ShadowExpr<V> make(Expr<V> shadow, Expr<V> block) {
        return new ShadowExpr<V>(shadow, block);
    }

    /**
     * create read only instance from {@link ShadowExpr}.
     *
     * @param defVal type of the value that the missing expression should have.
     * @return read only object of class {@link ShadowExpr}.
     */
    public static <V> ShadowExpr<V> make(Expr<V> shadow) {
        return new ShadowExpr<V>(shadow, null);
    }

    @Override
    public int getPrecedence() {
        return 999;
    }

    @Override
    public Assoc getAssoc() {
        return Assoc.NONE;
    }

    @Override
    public BlocklyType getVarType() {
        return BlocklyType.NOTHING;
    }

    @Override
    public Block astToBlock() {
        return null;
    }

    public Expr<V> getBlock() {
        return this.block;
    }

    public Expr<V> getShadow() {
        return this.shadow;
    }

    @Override
    public String toString() {
        return "ShadowExpr [" + this.shadow + ", " + this.block + "]";
    }

}
