// This file is automatically generated by the Open Roberta Lab.

#define _ARDUINO_STL_NOT_NEEDED
#include <Arduino.h>

#include <Arduino_LSM9DS1.h>
#include <Arduino_HTS221.h>
#include <Arduino_LPS22HB.h>
#include <Arduino_APDS9960.h>
#include <NEPODefs.h>

void getAllRawData();
void printClassWithHighestProbability();


double ___classes;
double ___inputs;
double ___neurons;
std::list<double> ___probabilities;
double ___mostLikelyClass;
double ___pOfMostLikelyClass;
double ___x;
double ___y;
double ___z;
float xAsFloat, yAsFloat, zAsFloat;
int _taster_record = 2;
int _led_L = LED_BUILTIN;
int rAsInt, gAsInt, bAsInt;

void getAllRawData() {
    // visitNeuralNetworkInitRawData
    while (true) {
        if ( digitalRead(_taster_record) ) {
            break;
        }
        delay(1);
    }
    while ( true ) {
        if ( ! digitalRead(_taster_record) ) {
            break;
        }
        while (true) {
            if ( (IMU.accelerationAvailable()?(IMU.readAcceleration(xAsFloat,yAsFloat,zAsFloat),___x = (double) xAsFloat,___y = (double) yAsFloat,___z = (double) zAsFloat,1) : 0) ) {
                break;
            }
            delay(1);
        }
        // visitNeuralNetworkAddRawData
        // visitNeuralNetworkAddRawData
        // visitNeuralNetworkAddRawData
        delay(1);
    }
}

void printClassWithHighestProbability() {
    ___mostLikelyClass = 0;
    ___pOfMostLikelyClass = 0;
    for ( double ___i : ___probabilities ) {
        if ( _getListElementByIndex(___probabilities, ___i) > ___pOfMostLikelyClass ) {
            ___mostLikelyClass = ___i;
            ___pOfMostLikelyClass = _getListElementByIndex(___probabilities, ___i);
        }
        delay(1);
    }
    Serial.println(___mostLikelyClass);
    Serial.println(___pOfMostLikelyClass);
}

void setup()
{
    Serial.begin(9600);
    IMU.begin();
    pinMode(_taster_record, INPUT);
    HTS.begin();
    pinMode(_led_L, OUTPUT);
    BARO.begin();
    APDS.begin();
    ___classes = 4;
    ___inputs = 3;
    ___neurons = 30;
    ___probabilities = _createListRepeat(___classes, (double) 0);
    ___mostLikelyClass = 0;
    ___pOfMostLikelyClass = 0;
    ___x = 0;
    ___y = 0;
    ___z = 0;
}

void loop()
{
    // visitNeuralNetworkSetup
    for (int ___classNumber = 0; ___classNumber < ___classes; ___classNumber += 1) {
        for (int ___datasets = 1; ___datasets < 10; ___datasets += 1) {
            getAllRawData();
            // visitNeuralNetworkAddTrainingsData
            delay(1);
        }
        delay(1);
    }
    // visitNeuralNetworkTrain
    while ( true ) {
        getAllRawData();
        // visitNeuralNetworkClassify
        printClassWithHighestProbability();
        delay(1);
    }
}