package de.fhg.iais.roberta.syntax.configuration;

import de.fhg.iais.roberta.transformer.forClass.NepoConfiguration;
import de.fhg.iais.roberta.util.dbc.DbcException;

@NepoConfiguration(containerType = "SOUND", category = "CONFIGURATION_BLOCK",
    blocklyNames = {"robBrick_sound", "robConf_sound"})
public class Sound extends ConfigurationComponent {
    private Sound() {
        super(null, true, null, null, null);
        throw new DbcException("should NEVER be called");
    }
}
