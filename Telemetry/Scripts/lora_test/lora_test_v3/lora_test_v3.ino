#include <SoftwareSerial.h>
 
SoftwareSerial lora(10,11);
 
void setup()
{
  Serial.begin(115200);
  Serial1.begin(115200); 
}
 
void loop()
{
  String rcvMsg;
  if (Serial1.available() > 0) { // Did we get a message
    Serial.print(rcvMsg);
    rcvMsg  = Serial1.readString();
    if (rcvMsg.startsWith("+RCV")) { // starts with "+RCV"
      Serial.print(rcvMsg);
    }
  }
}
