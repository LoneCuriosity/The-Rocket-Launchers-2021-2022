String incomingString;

void setup() {
  Serial.begin(115200);  
  pinMode(13, OUTPUT);
}

void loop() {
  if(Serial.available()){
    incomingString = Serial.readString();
    if(incomingString.indexOf("on") > 0){
      digitalWrite(13, HIGH);
    }
    if(incomingString.indexOf("off") > 0){
      digitalWrite(13, LOW);
    }
  }  
}
