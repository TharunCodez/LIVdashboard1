
export interface SensorData {
  deviceID: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  rain: boolean;
  reservoir: number;
  valve: boolean;
  pump: boolean;
}

export interface WebSocketMessage {
  type: 'UPDATE' | 'INIT';
  data: SensorData;
}
