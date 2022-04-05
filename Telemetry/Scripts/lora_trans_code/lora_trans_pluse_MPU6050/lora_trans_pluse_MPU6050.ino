#include <Wire.h>
#include <MPU6050.h>

unsigned long lastTransmission;
const int interval = 1000;

float timeStep = 0.01;

float pitch = 0;
float roll = 0;
float yaw = 0;

MPU6050 mpu;

void setup() {
  Serial.begin(115200);

  while(!mpu.begin(MPU6050_SCALE_2000DPS, MPU6050_RANGE_2G)){
    Serial.println("Could not find a valid MPU6050 sensor, check wiring!");
    delay(500);
  }

  Serial.print("AT+PARAMETER=10,7,1,7\r\n");
  delay(3000);
  
  mpu.calibrateGyro();

  mpu.setThreshold(3);
}

void loop() {
  Vector norm = mpu.readNormalizeGyro();
  
  pitch = pitch + norm.YAxis * timeStep;
  roll = roll + norm.XAxis * timeStep;
  yaw = yaw + norm.ZAxis * timeStep;
    
  if(millis() > lastTransmission + interval){;
    String DataChunk = String(pitch) + ":" + String(roll) + ":" + String(yaw);
    Serial.print("AT+SEND=0," + String(DataChunk.length()) + "," + DataChunk + "\r\n");
  
    lastTransmission = millis();
  }
}
