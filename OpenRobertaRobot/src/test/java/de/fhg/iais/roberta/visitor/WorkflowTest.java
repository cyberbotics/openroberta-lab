package de.fhg.iais.roberta.visitor;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.junit.Before;

import de.fhg.iais.roberta.components.ConfigurationAst;
import de.fhg.iais.roberta.components.ConfigurationComponent;
import de.fhg.iais.roberta.components.ProgramAst;
import de.fhg.iais.roberta.components.Project;
import de.fhg.iais.roberta.factory.IRobotFactory;
import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.syntax.lang.blocksequence.Location;
import de.fhg.iais.roberta.syntax.lang.blocksequence.MainTask;
import de.fhg.iais.roberta.util.Util;
import de.fhg.iais.roberta.util.test.UnitTestHelper;
import de.fhg.iais.roberta.worker.IWorker;

public class WorkflowTest {

    private IRobotFactory robotFactory;
    protected List<IWorker> workerChain;
    protected List<Phrase<Void>> phrases;
    protected List<ConfigurationComponent> configurationComponents;

    @Before
    public void setUp() throws Exception {
        phrases = new ArrayList<>(Arrays.asList(new Location<>("0", "0"), new MainTask<>()));
        configurationComponents = new ArrayList<>();
    }

    protected void setupRobotFactory(String robotName) {
        robotFactory = Util.configureRobotPlugin(robotName, "", "", Collections.emptyList());
    }

    protected Project executeWorkflow() {
        ProgramAst<Void> programAst = new ProgramAst.Builder<Void>()
            .setRobotType(robotFactory.getGroup())
            .addToTree(phrases)
            .build();

        ConfigurationAst configurationAst = new ConfigurationAst.Builder()
            .setRobotType(robotFactory.getGroup())
            .addComponents(configurationComponents)
            .build();

        configurationAst.setRobotName(robotFactory.getPluginProperties().getRobotName());

        Project project = new Project.Builder()
            .setFactory(robotFactory)
            .setProgramAst(programAst)
            .setConfigurationAst(configurationAst)
            .build();

        if ( project.hasSucceeded() ) {
            for ( IWorker worker : workerChain ) {
                worker.execute(project);
                if ( !project.hasSucceeded() ) {
                    break;
                }
            }
        }
        return project;
    }

    protected Project executeWorkflow(String workflowName) {
        ProgramAst<Void> programAst = new ProgramAst.Builder<Void>()
            .setRobotType(robotFactory.getGroup())
            .addToTree(phrases)
            .build();

        ConfigurationAst configurationAst = new ConfigurationAst.Builder()
            .setRobotType(robotFactory.getGroup())
            .addComponents(configurationComponents)
            .build();

        Project project = new Project.Builder()
            .setFactory(robotFactory)
            .setProgramAst(programAst)
            .setConfigurationAst(configurationAst)
            .build();

        UnitTestHelper.executeWorkflow(workflowName, robotFactory, project);
        return project;
    }
}