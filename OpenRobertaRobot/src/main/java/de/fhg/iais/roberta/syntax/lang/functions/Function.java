package de.fhg.iais.roberta.syntax.lang.functions;

import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.transformer.AnnotationHelper;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.util.syntax.Assoc;
import de.fhg.iais.roberta.util.ast.BlockDescriptor;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;

/**
 * the top class of all functions. There are two ways for a client to find out which kind of function {@link #Function}-object is:<br>
 * - {@link #getKind()}<br>
 * - {@link #getAs(Class)}<br>
 */
public abstract class Function<V> extends Phrase<V> {

    /**
     * create a mutable function of the given {@link BlockDescriptor}
     *
     * @param kind the kind of the function,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment of the user for the specific block
     */
    public Function(BlocklyBlockProperties properties, BlocklyComment comment) {
        super(properties, comment);

    }

    /**
     * get the precedence of the expression
     * <b>This is the default implementation of annotated AST classes</b>
     *
     * @return the precedence
     */
    public int getPrecedence() {
        return AnnotationHelper.getPrecedence(this.getClass());
    }

    /**
     * get the association of the expression
     * <b>This is the default implementation of annotated AST classes</b>
     *
     * @return the association
     */
    public Assoc getAssoc() {
        return AnnotationHelper.getAssoc(this.getClass());
    }

    /**
     * get the BlocklyType (used for typechecking ...) of this expression
     * <b>This is the default implementation of annotated AST classes</b>
     *
     * @return the BlocklyType
     */
    public BlocklyType getReturnType() {
        return AnnotationHelper.getReturnType(this.getClass());
    }

}
