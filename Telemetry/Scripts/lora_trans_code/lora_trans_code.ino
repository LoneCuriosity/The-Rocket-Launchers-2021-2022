#define ledPin 13

unsigned long lastTransmission;
const int interval = 5000;

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  if(millis() > lastTransmission + interval){
    Serial.print("AT+SEND=0,3,clk\r\n");
    digitalWrite(ledPin, HIGH);
    delay(100);
    digitalWrite(ledPin, LOW);
    lastTransmission = millis();
  }
}
