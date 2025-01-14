package de.fhg.iais.roberta.syntax.action.mbed;

import de.fhg.iais.roberta.syntax.action.Action;
import de.fhg.iais.roberta.syntax.lang.expr.Expr;
import de.fhg.iais.roberta.transformer.forField.NepoField;
import de.fhg.iais.roberta.transformer.forClass.NepoPhrase;
import de.fhg.iais.roberta.transformer.forField.NepoValue;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.util.dbc.Assert;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;
import de.fhg.iais.roberta.util.syntax.BlocklyConstants;

@NepoPhrase(category = "ACTOR", blocklyNames = {"mbedActions_motors_on"}, containerType = "BOTH_MOTORS_ON_ACTION")
public final class BothMotorsOnAction<V> extends Action<V> {
    @NepoValue(name = BlocklyConstants.POWER_A, type = BlocklyType.NUMBER_INT)
    public final Expr<V> speedA;
    @NepoValue(name = BlocklyConstants.POWER_B, type = BlocklyType.NUMBER_INT)
    public final Expr<V> speedB;
    @NepoField(name = BlocklyConstants.A, value = BlocklyConstants.A)
    public final String portA;
    @NepoField(name = BlocklyConstants.B, value = BlocklyConstants.B)
    public final String portB;

    public BothMotorsOnAction(BlocklyBlockProperties properties, BlocklyComment comment, Expr<V> speedA, Expr<V> speedB, String portA, String portB) {
        super(properties, comment);
        Assert.isTrue((speedA != null) && speedA.isReadOnly());
        Assert.isTrue((speedB != null) && speedB.isReadOnly());
        this.portA = portA;
        this.portB = portB;
        this.speedA = speedA;
        this.speedB = speedB;
        setReadOnly();
    }

    public static <V> BothMotorsOnAction<V> make(
        String portA,
        String portB,
        Expr<V> speedA,
        Expr<V> speedB,
        BlocklyBlockProperties properties,
        BlocklyComment comment) {
        return new BothMotorsOnAction<V>(properties, comment, speedA, speedB, portA, portB);
    }

    public Expr<V> getSpeedA() {
        return this.speedA;
    }

    public Expr<V> getSpeedB() {
        return this.speedB;
    }

    public String getPortA() {
        return this.portA;
    }

    public String getPortB() {
        return this.portB;
    }
}
