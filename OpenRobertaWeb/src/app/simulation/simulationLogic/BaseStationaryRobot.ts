import { BaseRobot, SelectionListener } from './BaseRobot';
import { Interpreter } from '../../nepostackmachine/interpreter.interpreter';

export abstract class BaseStationaryRobot extends BaseRobot {
    constructor(id: number, configuration: object, interpreter: Interpreter, name: string, mySelectionListener: SelectionListener) {
        super(id, configuration, interpreter, name, mySelectionListener);
        this.mobile = false;
    }
}
