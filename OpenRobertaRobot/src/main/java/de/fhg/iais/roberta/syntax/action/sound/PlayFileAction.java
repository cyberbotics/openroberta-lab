package de.fhg.iais.roberta.syntax.action.sound;

import de.fhg.iais.roberta.syntax.action.Action;
import de.fhg.iais.roberta.transformer.forClass.NepoPhrase;
import de.fhg.iais.roberta.transformer.forField.NepoField;
import de.fhg.iais.roberta.util.dbc.Assert;
import de.fhg.iais.roberta.util.ast.BlocklyBlockProperties;
import de.fhg.iais.roberta.util.ast.BlocklyComment;
import de.fhg.iais.roberta.util.syntax.BlocklyConstants;

/**
 * This class represents the <b>robActions_play_file</b> block from Blockly into the AST (abstract syntax tree). Object from this class will generate code for
 * playing a stored music file in the brick.<br/>
 * <br/>
 * The client must provide the name of the file.
 */
@NepoPhrase(category = "ACTOR", blocklyNames = {"robActions_play_file"}, containerType = "PLAY_FILE_ACTION")
public final class PlayFileAction<V> extends Action<V> {
    @NepoField(name = BlocklyConstants.FILE)
    public final String fileName;

    public PlayFileAction(BlocklyBlockProperties properties, BlocklyComment comment, String fileName) {
        super(properties, comment);
        Assert.isTrue(!fileName.equals(""));
        this.fileName = fileName;
        setReadOnly();
    }

    /**
     * Creates instance of {@link PlayFileAction}. This instance is read only and can not be modified.
     *
     * @param filename of the sound; must be different then empty string,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment added from the user,
     * @return read only object of class {@link PlayFileAction}
     */
    public static <V> PlayFileAction<V> make(String filename, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new PlayFileAction<V>(properties, comment, filename);
    }

    /**
     * @return the name of the file that will be played
     */
    public String getFileName() {
        return this.fileName;
    }

}
