package de.fhg.iais.roberta.syntax.lang.expr;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.transformer.forClass.NepoBasic;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.util.dbc.Assert;
import de.fhg.iais.roberta.util.dbc.DbcException;
import de.fhg.iais.roberta.util.syntax.Assoc;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;

@NepoBasic(containerType = "EXPR_LIST", category = "EXPR", blocklyNames = {})
public final class ExprList<V> extends Expr<V> {
    public final List<Expr<V>> el = new ArrayList<Expr<V>>();

    private ExprList() {
        super(BlocklyBlockProperties.make("1", "1", false, false, false, false, false, null, false, false), null);
    }

    /**
     * @return writable object of type {@link ExprList}.
     */
    public static <V> ExprList<V> make() {
        return new ExprList<V>();
    }

    /**
     * Add new element to the list.
     *
     * @param expr
     */
    public final void addExpr(Expr<V> expr) {
        Assert.isTrue(mayChange() && expr != null && expr.isReadOnly());
        this.el.add(expr);
    }

    /**
     * @return list with elements of type {@link Expr}.
     */
    public final List<Expr<V>> get() {
        Assert.isTrue(isReadOnly());
        return Collections.unmodifiableList(this.el);
    }

    @Override
    public int getPrecedence() {
        throw new DbcException("not supported");
    }

    @Override
    public Assoc getAssoc() {
        throw new DbcException("not supported");
    }

    @Override
    public BlocklyType getVarType() {
        return BlocklyType.NOTHING;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        for ( Expr<?> expr : this.el ) {
            if ( first ) {
                first = false;
            } else {
                sb.append(", ");
            }
            sb.append(expr.toString());
        }
        return sb.toString();
    }

    @Override
    public Block astToBlock() {
        return null;
    }

}
