package de.fhg.iais.roberta.syntax.action.communication;

import de.fhg.iais.roberta.syntax.action.Action;
import de.fhg.iais.roberta.syntax.action.motor.differential.MotorDriveStopAction;
import de.fhg.iais.roberta.syntax.lang.expr.Expr;
import de.fhg.iais.roberta.transformer.forClass.NepoPhrase;
import de.fhg.iais.roberta.transformer.forField.NepoValue;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.util.dbc.Assert;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;
import de.fhg.iais.roberta.util.syntax.BlocklyConstants;

@NepoPhrase(category = "ACTOR", blocklyNames = {"robCommunication_startConnection"}, containerType = "BLUETOOTH_CONNECT_ACTION")
public final class BluetoothConnectAction<V> extends Action<V> {
    @NepoValue(name = BlocklyConstants.ADDRESS, type = BlocklyType.STRING)
    public final Expr<V> address;

    public BluetoothConnectAction(BlocklyBlockProperties properties, BlocklyComment comment, Expr<V> address) {
        super(properties, comment);
        Assert.isTrue(address.isReadOnly() && address != null);
        this.address = address;
        setReadOnly();
    }

    /**
     * Creates instance of {@link MotorDriveStopAction}. This instance is read only and can not be modified.
     *
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment added from the user,
     * @return read only object of class {@link MotorDriveStopAction}
     */
    public static <V> BluetoothConnectAction<V> make(Expr<V> address, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new BluetoothConnectAction<V>(properties, comment, address);
    }

    public Expr<V> getAddress() {
        return this.address;
    }

}
