package de.fhg.iais.roberta.syntax.action.sound;

import de.fhg.iais.roberta.blockly.generated.Hide;
import de.fhg.iais.roberta.syntax.action.Action;
import de.fhg.iais.roberta.syntax.lang.expr.Expr;
import de.fhg.iais.roberta.transformer.forClass.NepoPhrase;
import de.fhg.iais.roberta.transformer.forField.NepoField;
import de.fhg.iais.roberta.transformer.forField.NepoHide;
import de.fhg.iais.roberta.transformer.forField.NepoValue;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.util.dbc.Assert;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;
import de.fhg.iais.roberta.util.syntax.BlocklyConstants;

/**
 * This class represents the <b>robActions_play_tone</b> block<br/>
 * The client must provide the frequency and the duration of the sound.
 */
@NepoPhrase(category = "ACTOR", blocklyNames = {"robActions_play_tone", "mbedActions_play_tone"}, containerType = "TONE_ACTION")
public final class ToneAction<V> extends Action<V> {
    @NepoValue(name = BlocklyConstants.FREQUENCE, type = BlocklyType.NUMBER_INT)
    public final Expr<V> frequency;
    @NepoValue(name = BlocklyConstants.DURATION, type = BlocklyType.NUMBER_INT)
    public final Expr<V> duration;
    @NepoField(name = BlocklyConstants.ACTORPORT, value = BlocklyConstants.EMPTY_PORT)
    public final String port;
    @NepoHide
    public final Hide hide;

    public ToneAction(BlocklyBlockProperties properties, BlocklyComment comment, Expr<V> frequency, Expr<V> duration, String port, Hide hide) {
        super(properties, comment);
        Assert.isTrue(frequency.isReadOnly() && duration.isReadOnly() && (frequency != null) && (duration != null));
        this.frequency = frequency;
        this.duration = duration;
        this.port = port;
        this.hide = hide;
        setReadOnly();
    }

    public static <V> ToneAction<V> make(Expr<V> frequency, Expr<V> duration, String port, BlocklyBlockProperties properties, BlocklyComment comment, Hide hide) {
        return new ToneAction<>(properties, comment, frequency, duration, port, hide);
    }

    public Expr<V> getDuration() {
        return this.duration;
    }

    public Expr<V> getFrequency() {
        return this.frequency;
    }

    public Hide getHide() {
        return this.hide;
    }

    public String getPort() {
        return this.port;
    }
}
