#define ledPin 13

String incomingString;

void setup() {
  Serial.begin(115200);
  pinMode(ledPin,OUTPUT);
}

void loop() {
  if(Serial.available()){
    incomingString = Serial.readString();
    if(incomingString.indexOf("clk") > 0){
      digitalWrite(ledPin, HIGH);
      delay(100);
      digitalWrite(ledPin, LOW);
    }  
  }
}
