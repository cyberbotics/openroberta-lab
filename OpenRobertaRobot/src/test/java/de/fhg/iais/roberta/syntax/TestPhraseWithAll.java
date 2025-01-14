package de.fhg.iais.roberta.syntax;

import de.fhg.iais.roberta.blockly.generated.Hide;
import de.fhg.iais.roberta.blockly.generated.Mutation;
import de.fhg.iais.roberta.syntax.lang.expr.Expr;
import de.fhg.iais.roberta.transformer.forClass.NepoPhrase;
import de.fhg.iais.roberta.transformer.forField.NepoData;
import de.fhg.iais.roberta.transformer.forField.NepoField;
import de.fhg.iais.roberta.transformer.forField.NepoHide;
import de.fhg.iais.roberta.transformer.forField.NepoMutation;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;

@NepoPhrase(containerType = "TEST_PHRASE_ALL", blocklyNames = {"test_phrase_all"}, category = "EXPR")
public class TestPhraseWithAll<V> extends Expr<V> {

    @NepoMutation
    public final Mutation mutation;

    @NepoData
    public final String data;

    @NepoField(name = "TYPE")
    public final String type;

    @NepoHide
    public final Hide hide;

    public TestPhraseWithAll(
        BlocklyBlockProperties properties,
        BlocklyComment comment,
        Mutation mutation,
        String data,
        String type,
        Hide hide) {
        super(properties, comment);
        this.mutation = mutation;
        this.data = data;
        this.type = type;
        this.hide = hide;
    }
}
