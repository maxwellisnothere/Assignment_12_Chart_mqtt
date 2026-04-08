import Paho from 'paho-mqtt';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function App() {
  // แก้ไข Error: ระบุ Type ให้กับ State ที่ชัดเจน ป้องกันปัญหา type 'never'
  const [client, setClient] = useState<Paho.Client | null>(null);
  const [status, setStatus] = useState<string>('Disconnected');
  const [tempInput, setTempInput] = useState<string>('');
  
  const [tempData, setTempData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [timeLabels, setTimeLabels] = useState<string[]>(['', '', '', '', '', '', '', '', '', '']);
  const [history, setHistory] = useState<string[]>([]); // ระบุว่าเป็น Array ของ String

  const MQTT_HOST = "9f4069ce3cda4e42b6d129c77a3b0d64.s1.eu.hivemq.cloud";
  const MQTT_PORT = 8884; 
  const TOPIC = "spu/demo/temp";
  
  useEffect(() => {
    // จำลอง localStorage
    if (typeof window !== 'undefined' && !window.localStorage) {
      (window as any).localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      } as any;
    }

    const clientId = "Veleho338_" + Math.random().toString(16).substring(2, 8);
    const mqttClient = new Paho.Client(MQTT_HOST, MQTT_PORT, clientId);

    mqttClient.onConnectionLost = (responseObject: any) => {
      // โชว์สาเหตุที่หลุดบนหน้าจอเลย
      const errorMsg = responseObject.errorCode !== 0 ? responseObject.errorMessage : "Unspecified";
      setStatus(`Disconnected 🔴 (${errorMsg})`);
      console.log("Connection Lost: " + errorMsg);
    };

    mqttClient.onMessageArrived = (message: any) => {
      const value = parseFloat(message.payloadString);
      if (!isNaN(value)) {
        const now = new Date();
        const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        setTempData((prev) => [...prev, value].slice(-10));
        setTimeLabels((prev) => [...prev, timeString].slice(-10));
        setHistory((prev) => [`${timeString} | ${TOPIC}: ${value}`, ...prev].slice(0, 10));
      }
    };

    setStatus('กำลังพยายามเชื่อมต่อ... ⏳'); // เปลี่ยนสถานะให้รู้ว่าแอปกำลังทำงาน
    
    mqttClient.connect({
      useSSL: true,
      userName: "Assignment_12", 
      password: "Veleho338", 
      onSuccess: () => {
        setStatus('Connected 🟢');
        mqttClient.subscribe(TOPIC);
        setClient(mqttClient);
      },
      onFailure: (err: any) => {
        // ดึง Error Message ของ Paho มาแสดง
        setStatus(`Failed 🔴: ${err.errorMessage || err.errorCode}`);
        console.log("Connect failed: ", err);
      }
    });

    return () => {
      if (mqttClient.isConnected()) {
        mqttClient.disconnect();
      }
    };
  }, []);

  const sendMessage = () => {
    if (client && client.isConnected() && tempInput !== '') {
      const message = new Paho.Message(tempInput);
      message.destinationName = TOPIC;
      client.send(message);
      setTempInput(''); 
    } else {
      alert("กรุณารอให้เชื่อมต่อสำเร็จ หรือกรอกตัวเลขก่อนส่งค่ะ");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>MQTT Status: {status}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="ระบุอุณหภูมิ เช่น 26.5"
          value={tempInput}
          onChangeText={setTempInput}
        />
        <TouchableOpacity style={styles.button} onPress={sendMessage}>
          <Text style={styles.buttonText}>SEND MQTT MESSAGE</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>Temperature ล่าสุด 10 ค่า</Text>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: timeLabels,
            datasets: [{ data: tempData }]
          }}
          width={Dimensions.get("window").width - 40}
          height={220}
          yAxisSuffix="°C"
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: "4", strokeWidth: "2", stroke: "#000" }
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </View>

      <Text style={styles.subHeader}>Received ล่าสุด 10 รายการ</Text>
      <View style={styles.historyContainer}>
        {history.map((item, index) => (
          <Text key={index} style={styles.historyText}>{item}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f5f5f5', paddingTop: 50 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  inputContainer: { marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, backgroundColor: '#fff', marginBottom: 10 },
  button: { backgroundColor: '#2196F3', padding: 12, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  subHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  chartContainer: { alignItems: 'center', marginBottom: 20 },
  historyContainer: { backgroundColor: '#fff', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#ddd' },
  historyText: { fontSize: 12, color: '#333', marginBottom: 5 }
});