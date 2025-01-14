package de.fhg.iais.roberta.syntax.lang.stmt;

import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.util.ast.BlockDescriptor;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;

/**
 * the top class of all statements. There are two ways for a client to find out which kind of statement an {@link #Stmt}-object is:<br>
 * - {@link #getKind()}<br>
 * - {@link #getAs(Class)}<br>
 */
public abstract class Stmt<V> extends Phrase<V> {
    /**
     * This constructor set the kind of the statement object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockDescriptor}.
     *
     * @param kind of the the statement object used in AST,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment of the user for the specific block
     */
    public Stmt(BlocklyBlockProperties properties, BlocklyComment comment) {
        super(properties, comment);
    }

}