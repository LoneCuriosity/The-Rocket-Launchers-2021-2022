#include <HamShield.h>
#include <DDS.h>
#include <packet.h>
#include <avr/wdt.h> 
#include <Wire.h>
#include <MPU6050_light.h>
#include <Adafruit_GPS.h>
#include <SPI.h>
#include <SD.h>

#include "SparkFunBME280.h"
#include "SoftwareI2C.h"
#include "RTClib.h"

#define MIC_PIN 9
#define RESET_PIN A3
#define SWITCH_PIN 2
#define LED 4

#define GPSSerial Serial1

Adafruit_GPS GPS(&GPSSerial);
uint32_t loraTimer = millis();
uint32_t fileTimer = millis();

RTC_DS1307 rtc;
MPU6050 mpu(Wire);
BME280 bme;
File csv;
HamShield radio;
DDS dds;
AFSK afsk;
SoftwareI2C softwarei2c;

String Packet = "";
bool LED_ON = false;

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
  softwarei2c.begin(6, 7);
  
  pinMode(MIC_PIN, OUTPUT);
  digitalWrite(MIC_PIN, LOW);
  
  pinMode(SWITCH_PIN, INPUT_PULLUP);
  
  pinMode(RESET_PIN, OUTPUT);
  digitalWrite(RESET_PIN, HIGH);

  pinMode(LED, OUTPUT);
  
  Serial.begin(115200);
  
  Serial3.begin(115200);

  radio.initialize();
  radio.frequency(144390);
  radio.setRfPower(0);
  radio.setVolume1(0xFF);
  radio.setVolume2(0xFF);
  radio.setSQHiThresh(-100);
  radio.setSQLoThresh(-100);
  radio.bypassPreDeEmph();
  dds.start();
  afsk.start(&dds);
  delay(100);
  radio.setModeReceive();
  
  GPS.begin(9600);

  while (!SD.begin(53)) {
    Serial.println("{ERROR: SD Card}");
    digitalWrite(LED, HIGH);
    delay(1000);
    digitalWrite(LED, LOW);
    delay(1000);
  }
   
  bme.setI2CAddress(0x77);

  while(!rtc.begin()){
    Serial.println("{ERROR: RTC}");
    delay(1000);
    digitalWrite(LED, LOW);
    delay(1000);
  }

  GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCGGA);
  GPS.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ); // 1 Hz update rate
  GPS.sendCommand(PGCMD_ANTENNA);
  delay(1000);
  GPSSerial.println(PMTK_Q_RELEASE);

  rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));

  Wire.begin();

  while(bme.beginI2C() == false){
    Serial.println("{ERROR: BME280}");
    delay(1000);
    digitalWrite(LED, LOW);
    delay(1000);
  }
  
  byte status = mpu.begin();
  while(status!=0){
    Serial.println("{ERROR: MPU6050}");
    delay(1000);
    digitalWrite(LED, LOW);
    delay(1000);
  }

  mpu.calcOffsets(true,true);

  Serial3.print("AT+PARAMETER=10,7,1,7\r\n");

  csv = SD.open("test_1", FILE_WRITE);

  
}

void loop() {
  
  if(LED_ON == false){
    digitalWrite(LED, HIGH);
    LED_ON = true;
  }
  
  mpu.update();
    
  char c = GPS.read();

  if (GPS.newNMEAreceived()) {
    if (!GPS.parse(GPS.lastNMEA()))
      return;
  }
  
  if (millis() - loraTimer > 5000) {
    loraTimer = millis();
    DateTime now = rtc.now();
  
    String Rotation = String(mpu.getAngleX()) + "," + String(mpu.getAngleY()) + "," + String(mpu.getAngleZ());
    
    String Date = String(now.year(),DEC) + "," + String(now.month(),DEC) + "," + String(now.day(),DEC) + "," + String(now.hour(),DEC) + "," + String(now.minute(),DEC) + "," + now.second();

    String Accel = String(mpu.getAccX()) + "," + String(mpu.getAccY()) + "," + String(mpu.getAccZ()-1);

    String BME = String(bme.readFloatHumidity()) + "," + String(bme.readFloatPressure()) + "," + String(bme.readFloatAltitudeFeet() > 0 ? bme.readFloatAltitudeFeet() : 0, 1) + "," + String(bme.readTempF());

    String GPSCords = "";
    
    if(GPS.lat == 'N' && GPS.lon == 'E'){
      GPSCords = DDMMToDD((String)GPS.latitude, 6) + "," + (DDMMToDD((String)GPS.longitude, 6)) + "," + GPS.speed + "," + GPS.altitude + "," + GPS.satellites;
    } else if(GPS.lat == 'S' && GPS.lon == 'E'){
      GPSCords = "-" + DDMMToDD((String)GPS.latitude, 6) + "," + (DDMMToDD((String)GPS.longitude, 6)) + "," + GPS.speed + "," + GPS.altitude + "," + GPS.satellites;
    } else if(GPS.lat == 'N' && GPS.lon == 'W'){
      GPSCords = DDMMToDD((String)GPS.latitude, 6) + ",-" + (DDMMToDD((String)GPS.longitude, 6)) + "," + GPS.speed + "," + GPS.altitude + "," + GPS.satellites;
    } else if(GPS.lat == 'S' && GPS.lon == 'W') {
      GPSCords = "-" + DDMMToDD((String)GPS.latitude, 6) + ",-" + (DDMMToDD((String)GPS.longitude, 6)) + "," + GPS.speed + "," + GPS.altitude + "," + GPS.satellites;
    } else{
      GPSCords = "0,0,0,0,0";
    }

    Packet = Date + "," + Rotation + "," + Accel + "," + BME + "," + GPSCords;
    //Serial.println("AT+SEND=0," + String(Packet.length()) + "," + Packet + "\r\n");
    Serial3.print("AT+SEND=0," + String(Packet.length()) + "," + Packet + "\r\n");
    transmit(GPS.lastNMEA());
  }

  if (millis() - fileTimer > 100) {
    fileTimer = millis();

    csv.println(Packet);
    //csv.close();
  }
}

void transmit(String Msg) {
  radio.setModeTransmit();
  delay(500);

  AFSK::Packet *packet = AFSK::PacketBuffer::makePacket(22 + 32);

  packet->start();
  packet->appendCallsign("KG7OGM",0);
  packet->appendCallsign("KG7OGM",15,true);   
  packet->appendFCS(0x03);
  packet->appendFCS(0xf0);
  packet->print(Msg);
  packet->finish();

  bool ret = afsk.putTXPacket(packet);

  if(afsk.txReady()) {
    radio.setModeTransmit();
    
    if(!afsk.txStart()) {
      radio.setModeReceive();
    }
  }

  for(int i = 0; i < 500; i++) {
    if(afsk.encoder.isDone())
       break;
    delay(50);
  }

  radio.setModeReceive();
} 

ISR(TIMER2_OVF_vect) {
  TIFR2 = _BV(TOV2);
  static uint8_t tcnt = 0;
  if(++tcnt == 8) {
    dds.clockTick();
    tcnt = 0;
  }
}

ISR(ADC_vect) {
  static uint8_t tcnt = 0;
  TIFR1 = _BV(ICF1);
  dds.clockTick();
  if(++tcnt == 1) {
    afsk.timer();
    tcnt = 0;
  }
}
