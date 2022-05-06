#include <Wire.h>
#include <MPU6050.h>
#include <Adafruit_GPS.h>

#include "SparkFunBME280.h"
#include "RTClib.h"

#define GPSSerial Serial1

Adafruit_GPS GPS(&GPSSerial);
uint32_t timer = millis();

RTC_DS1307 rtc;
MPU6050 mpu;
BME280 mySensor;

String DDMMToDD(String DDMM, int DecPl){
      String adsub = DDMM.substring(0,2);
      String amsub = DDMM.substring(2);
      double aDsub = adsub.toDouble();
      double aMsub = amsub.toDouble();
      double adone = aMsub/60.00;
      double aDone = aDsub + adone;
      return String(aDone, DecPl);
}

void setup() {
  Serial.begin(115200);
  GPS.begin(9600);
   
  mySensor.setI2CAddress(0x77);
  
  while(!mpu.begin(MPU6050_SCALE_2000DPS, MPU6050_RANGE_2G))
  {
    Serial.println("ERROR: mpu6050");
    delay(500);
  }

  while(mySensor.beginI2C() == false){
    Serial.println("ERROR: bme280");
    delay(500);
  }

  while(!rtc.begin()){
    Serial.println("ERROR: rtc");
    delay(500);
  }

  /*if (! rtc.isrunning()) {
    Serial.println("RTC is NOT running, let's set the time!");
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }*/
  
  Wire.begin();

  GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCGGA);
  GPS.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ); 
  GPS.sendCommand(PGCMD_ANTENNA);
  delay(1000);
  GPSSerial.println(PMTK_Q_RELEASE);

  Serial.print("AT+PARAMETER=10,7,1,7\r\n");
}

void loop() {
   char c = GPS.read();
    
  if (GPS.newNMEAreceived()) {
    if (!GPS.parse(GPS.lastNMEA())) 
      return; 
  }

  if (millis() - timer > 500) {
    timer = millis();
    DateTime now = rtc.now();
    
    Vector normAccel = mpu.readNormalizeAccel();

    /*Serial.print(now.year(), DEC);
    Serial.print(',');
    Serial.print(now.month(), DEC);
    Serial.print(',');
    Serial.print(now.day(), DEC);
    Serial.print(',');
    Serial.print(now.hour(), DEC);
    Serial.print(',');
    Serial.print(now.minute(), DEC);
    Serial.print(',');
    Serial.print(now.second(), DEC);
    Serial.print(',');*/

    String Date = String(now.year(),DEC) + "," + String(now.month(),DEC) + "," + String(now.day(),DEC) + "," + String(now.hour(),DEC) + "," + String(now.minute(),DEC) + "," + String(now.second(),DEC);
    
    /*Serial.print(normAccel.XAxis);
    Serial.print(",");
    Serial.print(normAccel.YAxis);
    Serial.print(",");
    Serial.print(normAccel.ZAxis);
    Serial.print(",");*/

    String Accel = String(normAccel.XAxis) + "," + String(normAccel.YAxis) + "," + String(normAccel.ZAxis);
    
    /*Serial.print(mySensor.readFloatHumidity(), 0);
    Serial.print(",");
    Serial.print(mySensor.readFloatPressure(), 0);
    Serial.print(",");
    Serial.print(mySensor.readFloatAltitudeFeet() > 0 ? mySensor.readFloatAltitudeFeet() : 0, 1);
    Serial.print(",");
    Serial.print(mySensor.readTempF(), 2);
    Serial.print(",");*/

    String BME = String(mySensor.readFloatHumidity()) + "," + String(mySensor.readFloatPressure()) + "," + String(mySensor.readFloatAltitudeFeet() > 0 ? mySensor.readFloatAltitudeFeet() : 0, 1) + "," + String(mySensor.readTempF());

    String GPSCords = "";
    
    if(GPS.lat == 'N' && GPS.lon == 'E'){
      GPSCords = DDMMToDD((String)GPS.latitude, 6) + "," + (DDMMToDD((String)GPS.longitude, 6));
    } else if(GPS.lat == 'S' && GPS.lon == 'E'){
      GPSCords = "-" + DDMMToDD((String)GPS.latitude, 6) + "," + (DDMMToDD((String)GPS.longitude, 6));
    } else if(GPS.lat == 'N' && GPS.lon == 'W'){
      GPSCords = DDMMToDD((String)GPS.latitude, 6) + ",-" + (DDMMToDD((String)GPS.longitude, 6));
    } else if(GPS.lat == 'S' && GPS.lon == 'W') {
      GPSCords = "-" + DDMMToDD((String)GPS.latitude, 6) + ",-" + (DDMMToDD((String)GPS.longitude, 6));
    } else{
      GPSCords = "0,0";
    }

    String Packet = Date + "," + Accel + "," + BME + "," + GPSCords;
    Serial.print("AT+SEND=0," + String(Packet.length()) + "," + Packet + "\r\n");
  }
}
