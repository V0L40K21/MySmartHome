// Copyright 2022 <V0L40K>
#include <Arduino.h>
#define RELAY_PIN 19

void setup() { pinMode(RELAY_PIN, OUTPUT); }

void loop() {
  digitalWrite(RELAY_PIN, HIGH);
  delay(1000);
  digitalWrite(RELAY_PIN, LOW);
  delay(1000);
}