package de.fhg.iais.roberta.syntax;

import de.fhg.iais.roberta.syntax.lang.expr.Expr;
import de.fhg.iais.roberta.transformer.forClass.NepoPhrase;
import de.fhg.iais.roberta.transformer.forField.NepoField;
import de.fhg.iais.roberta.transformer.forField.NepoValue;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;

@NepoPhrase(containerType = "TEST_PHRASE_WRONG_CONSTRUCTOR", blocklyNames = {"test_phrase_wrong_constructor"}, category = "EXPR")
public class TestPhraseWrongConstructor<V> extends Phrase<V> {

    @NepoField(name = "TYPE")
    public final String type;
    @NepoValue(name = "VALUE", type = BlocklyType.ANY)
    public final Expr<V> value;

    public TestPhraseWrongConstructor(
        BlocklyBlockProperties property,
        BlocklyComment comment,
        Expr<V> value, String type) {
        super(property, comment);
        this.type = type;
        this.value = value;
    }
}
