// This file is automatically generated by the Open Roberta Lab.

#include <Arduino.h>
#include <Stepper/src/Stepper.h>
#include <NEPODefs.h>


int _SPU_S2 = 2048;
Stepper _stepper_S2(_SPU_S2, 6, 4, 5, 3);
void setup()
{}

void loop()
{
    _stepper_S2.setSpeed(10);
    _stepper_S2.step(_SPU_S2*(5)/360);
}