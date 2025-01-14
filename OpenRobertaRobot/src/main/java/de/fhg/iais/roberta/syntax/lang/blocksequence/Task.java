package de.fhg.iais.roberta.syntax.lang.blocksequence;

import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.transformer.AnnotationHelper;
import de.fhg.iais.roberta.util.syntax.Assoc;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;

/**
 * the top class of all tasks. There are two ways for a client to find out which kind of task an {@link #Task}-object is:<br>
 * - {@link #getKind()}<br>
 * - {@link #getAs(Class)}<br>
 */
public abstract class Task<V> extends Phrase<V> {

    public Task(BlocklyBlockProperties properties, BlocklyComment comment) {
        super(properties, comment);
    }

    /**
     * get the precedence of the task
     * <b>This is the default implementation of annotated AST classes</b>
     *
     * @return the precedence
     */
    public int getPrecedence() {
        return AnnotationHelper.getPrecedence(this.getClass());
    }

    /**
     * get the association of the task
     * <b>This is the default implementation of annotated AST classes</b>
     *
     * @return the association
     */
    public Assoc getAssoc() {
        return AnnotationHelper.getAssoc(this.getClass());
    }

}
