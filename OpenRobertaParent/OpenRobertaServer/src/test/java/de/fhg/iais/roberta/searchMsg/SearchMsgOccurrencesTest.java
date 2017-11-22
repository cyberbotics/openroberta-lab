package de.fhg.iais.roberta.searchMsg;

import java.io.File;
import java.util.regex.Pattern;

import org.junit.Ignore;
import org.junit.Test;

public class SearchMsgOccurrencesTest {
    private static final Pattern ALL = Pattern.compile(".+");

    @Test
    public void testMessageOccurences() throws Exception {
        SearchMsgKeyOccurrences smo =
            new SearchMsgKeyOccurrences(new File("../../../blockly/robMsg/robMessages.js"), new File("../../../blockly/msg/messages.js"));
        smo.search(new File("../OpenRobertaRobot/src/main/java"), ALL);
        smo.search(new File("../OpenRobertaServer/src/main/java"), ALL);
        smo.search(new File("../RobotArdu/src/main/java"), ALL);
        smo.search(new File("../RobotEV3/src/main/java"), ALL);
        smo.search(new File("../RobotMbed/src/main/java"), ALL);
        smo.search(new File("../RobotNAO/src/main/java"), ALL);
        smo.search(new File("../RobotNXT/src/main/java"), ALL);

        smo.search(new File("../OpenRobertaServer/staticResources/index.html"), ALL);
        smo.search(new File("../OpenRobertaServer/staticResources/js"), ALL);

        smo.search(new File("../../../blockly/blockly_compressed.js"), ALL);
        smo.search(new File("../../../blockly/appengine"), ALL);
        smo.search(new File("../../../blockly/blocks"), ALL);
        smo.search(new File("../../../blockly/core"), ALL);
        smo.search(new File("../../../blockly/demos"), ALL);
        smo.search(new File("../../../blockly/generators"), ALL);
        smo.search(new File("../../../blockly/i18n"), ALL);
        smo.search(new File("../../../blockly/media"), ALL);
        smo.search(new File("../../../blockly/tests"), ALL);

        smo.statistics();
    }
}