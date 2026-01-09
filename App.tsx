
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Thermometer,
  Droplets,
  CloudRain,
  Waves,
  Power,
  Settings2,
  Globe,
  Moon,
  LayoutGrid,
  Monitor,
  BrainCircuit,
  Bell,
  User,
  MessageSquare
} from 'lucide-react';
import { SensorData } from './types';

// Components
const Header = () => (
  <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
        <img src="logo.png" alt="LIV Logo" className="w-full h-full object-contain" />
      </div>
      <h1 className="text-2xl font-black tracking-tighter text-black">LIV</h1>
    </div>
    <div className="flex items-center gap-4 text-gray-400">
      <Globe size={20} className="hover:text-green-700 cursor-pointer transition-colors" />
      <Moon size={20} className="hover:text-green-700 cursor-pointer transition-colors" />
    </div>
  </header>
);

const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6 flex justify-between items-center z-10 md:hidden">
    <div className="flex flex-col items-center gap-1 text-green-800">
      <div className="bg-green-50 p-2 rounded-xl relative">
        <LayoutGrid size={22} />
        <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <span className="text-[10px] font-bold">Dashboard</span>
    </div>
    <div className="flex flex-col items-center gap-1 text-gray-400">
      <Monitor size={22} />
      <span className="text-[10px]">Devices</span>
    </div>
    <div className="flex flex-col items-center gap-1 text-gray-400">
      <BrainCircuit size={22} />
      <span className="text-[10px]">Assistant</span>
    </div>
    <div className="flex flex-col items-center gap-1 text-gray-400">
      <Bell size={22} />
      <span className="text-[10px]">Alerts</span>
    </div>
    <div className="flex flex-col items-center gap-1 text-gray-400">
      <User size={22} />
      <span className="text-[10px]">Profile</span>
    </div>
  </nav>
);

const SensorCard = ({ icon: Icon, label, value, unit, color }: {
  icon: any,
  label: string,
  value: string | number,
  unit?: string,
  color: string
}) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-2 min-h-[160px] transition-all hover:shadow-md">
    <div className={`${color} mb-1 p-3 bg-gray-50 rounded-full`}>
      <Icon size={28} />
    </div>
    <div className="text-2xl font-bold text-gray-800">
      {value}{unit}
    </div>
    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
      {label}
    </div>
  </div>
);

const StatusToggle = ({ label, icon: Icon, active, status }: { label: string, icon: any, active: boolean, status: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center min-h-[220px] relative transition-all hover:shadow-md">
    <div className="w-full flex justify-between items-center mb-10">
      <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">{label}</span>
      <Icon size={20} className={active ? 'text-green-600' : 'text-gray-300'} />
    </div>

    <div className={`relative w-28 h-14 rounded-full flex items-center p-1 transition-colors duration-500 ${active ? 'bg-green-600' : 'bg-gray-200'}`}>
      <div className={`w-12 h-12 bg-white rounded-full shadow-lg transition-transform duration-300 transform ${active ? 'translate-x-14' : 'translate-x-0'}`}></div>
    </div>

    <div className={`mt-8 font-black text-xl tracking-tighter uppercase transition-colors duration-300 ${active ? 'text-green-700' : 'text-gray-400'}`}>
      {status}
    </div>
  </div>
);

const ReservoirTank = ({ level }: { level: number }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-[300px]">
    <div className="mb-6">
      <h3 className="font-bold text-green-950 text-lg">Reservoir Level</h3>
      <p className="text-xs text-gray-400">Live water level status</p>
    </div>

    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-40 h-48 border-4 border-green-800/10 rounded-3xl relative overflow-hidden bg-gray-50/50 shadow-inner">
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-1000 ease-in-out"
          style={{ height: `${level}%` }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 animate-pulse"></div>
        </div>
      </div>
      <div className="mt-6 text-4xl font-black text-blue-600 tracking-tighter">
        {level}%
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [data, setData] = useState<SensorData>({
    deviceID: "AVF001LIV01",
    temperature: 32,
    humidity: 69,
    soilMoisture: 56,
    rain: false,
    reservoir: 82,
    valve: false,
    pump: false
  });
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {

    const socket = new WebSocket("wss://livdashboard1.onrender.com");


    socket.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.deviceID) {
          setData(payload);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message', err);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      setTimeout(connectWebSocket, 3000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error', error);
      socket.close();
    };

    ws.current = socket;
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connectWebSocket]);

  return (
    <div className="pb-24 min-h-screen bg-[#FDFDFD] max-w-4xl mx-auto shadow-2xl relative">
      <Header />

      <main className="p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-green-950 tracking-tighter">Overview</h2>
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
              <Settings2 size={18} />
            </div>
          </div>
        </div>

        {/* Device Info Bar */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:border-green-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-700">
              <Monitor size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-green-950 leading-tight">Farm Field 1</h3>
              <p className="text-xs font-medium text-gray-400">ID: {data.deviceID}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {isConnected ? 'Online' : 'Offline'}
            </span>
            <span className="text-[10px] font-medium text-gray-300">Updated seconds ago</span>
          </div>
        </div>

        {/* Grid of Sensors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SensorCard
            icon={Thermometer}
            label="Temperature"
            value={data.temperature}
            unit="°C"
            color="text-orange-500"
          />
          <SensorCard
            icon={Waves}
            label="Soil Moisture"
            value={data.soilMoisture}
            unit="%"
            color="text-emerald-500"
          />
          <SensorCard
            icon={Droplets}
            label="Humidity"
            value={data.humidity}
            unit="%"
            color="text-cyan-500"
          />
          <SensorCard
            icon={CloudRain}
            label="Rain Status"
            value={data.rain ? 'Yes' : 'No'}
            color="text-blue-400"
          />
        </div>

        {/* Status Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReservoirTank level={data.reservoir} />
          <StatusToggle
            label="Main Pump"
            icon={Power}
            active={data.pump}
            status={data.pump ? 'Running' : 'Stopped'}
          />
          <StatusToggle
            label="Control Valve"
            icon={Settings2}
            active={data.valve}
            status={data.valve ? 'Open' : 'Closed'}
          />
        </div>
      </main>

      {/* Floating Action */}
      <div className="fixed bottom-20 right-6 md:right-8 z-20 md:bottom-8">
        <button className="w-16 h-16 bg-green-900 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 transition-transform active:scale-95">
          <MessageSquare size={28} />
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default App;
