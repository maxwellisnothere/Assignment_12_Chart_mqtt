import Paho from 'paho-mqtt';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Provider as PaperProvider, Appbar, Card, Text, TextInput, Button, Divider, Badge } from 'react-native-paper';

// 💡 แนะนำ: ในหน้างานจริงควรใช้ react-native-dotenv เพื่อดึงค่าเหล่านี้
// สำหรับ Assignment นี้ ผมย้ายมาไว้เป็นค่าคงที่ด้านบนเพื่อให้จัดการง่ายขึ้น
const MQTT_CONFIG = {
  HOST: "_",
  PORT: _,
  TOPIC: "_",
  USER: "_",
  PASS: "_",
};

export default function App() {
  const [client, setClient] = useState<Paho.Client | null>(null);
  const [status, setStatus] = useState<string>('Disconnected');
  const [tempInput, setTempInput] = useState<string>('');
  const [tempData, setTempData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [timeLabels, setTimeLabels] = useState<string[]>(['', '', '', '', '', '', '', '', '', '']);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    // Polyfill สำหรับกรณีรันบน Browser หรือสภาพแวดล้อมที่ไม่มี localStorage
    if (typeof window !== 'undefined' && !window.localStorage) {
      (window as any).localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      } as any;
    }

    const clientId = `SPU_IoT_${Math.random().toString(16).substring(2, 8)}`;
    const mqttClient = new Paho.Client(MQTT_CONFIG.HOST, MQTT_CONFIG.PORT, clientId);

    mqttClient.onConnectionLost = (responseObject: any) => {
      setStatus(`Disconnected: ${responseObject.errorMessage || 'Unknown error'}`);
    };

    mqttClient.onMessageArrived = (message: any) => {
      const value = parseFloat(message.payloadString);
      if (!isNaN(value)) {
        const now = new Date();
        const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        setTempData((prev) => [...prev, value].slice(-10));
        setTimeLabels((prev) => [...prev, timeString].slice(-10));
        setHistory((prev) => [`${timeString}  |  ${value} °C`, ...prev].slice(0, 10));
      }
    };

    const connectOptions = {
      useSSL: true,
      userName: MQTT_CONFIG.USER,
      password: MQTT_CONFIG.PASS,
      onSuccess: () => {
        setStatus('Connected');
        mqttClient.subscribe(MQTT_CONFIG.TOPIC);
        setClient(mqttClient);
      },
      onFailure: (err: any) => {
        setStatus(`Failed: ${err.errorMessage}`);
      }
    };

    mqttClient.connect(connectOptions);

    return () => {
      if (mqttClient.isConnected()) {
        mqttClient.disconnect();
      }
    };
  }, []);

  const sendMessage = () => {
    if (client?.isConnected() && tempInput !== '') {
      const message = new Paho.Message(tempInput);
      message.destinationName = MQTT_CONFIG.TOPIC;
      client.send(message);
      setTempInput('');
    }
  };

  const isConnected = status === 'Connected';

  return (
    <PaperProvider>
      <Appbar.Header elevated style={styles.appbar}>
        <Appbar.Content title="Smart IoT Dashboard" subtitle="SPU Engineering Assignment" />
        <Badge style={[styles.badge, { backgroundColor: isConnected ? '#2ecc71' : '#e74c3c' }]}>
          {isConnected ? 'ONLINE' : 'OFFLINE'}
        </Badge>
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card} elevation={2}>
          <Card.Title 
            title="Publish Data" 
            subtitle={`Topic: ${MQTT_CONFIG.TOPIC}`} 
            left={(props) => <Text {...props} style={styles.icon}>📤</Text>} 
          />
          <Card.Content>
            <TextInput
              mode="outlined"
              label="ระบุอุณหภูมิ (°C)"
              value={tempInput}
              onChangeText={setTempInput}
              keyboardType="numeric"
              activeOutlineColor="#3498db"
              style={styles.input}
            />
            <Button 
              mode="contained" 
              onPress={sendMessage} 
              disabled={!isConnected}
              buttonColor="#3498db"
              style={styles.button}
            >
              Send to MQTT
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card} elevation={2}>
          <Card.Title 
            title="Real-time Analytics" 
            subtitle="Last 10 records" 
            left={(props) => <Text {...props} style={styles.icon}>📈</Text>} 
          />
          <Card.Content style={styles.chartContainer}>
            <LineChart
              data={{
                labels: timeLabels,
                datasets: [{ 
                  data: tempData,
                  color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
                  strokeWidth: 3 
                }]
              }}
              width={Dimensions.get("window").width - 50}
              height={220}
              yAxisSuffix="°C"
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(180, 180, 180, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(50, 50, 50, ${opacity})`,
                propsForDots: { r: "4", strokeWidth: "2", stroke: "#2ecc71" }
              }}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card} elevation={2}>
          <Card.Title 
            title="Activity Logs" 
            left={(props) => <Text {...props} style={styles.icon}>⏱️</Text>} 
          />
          <Divider />
          <Card.Content style={styles.logContainer}>
            {history.length > 0 ? (
              history.map((item, index) => (
                <Text key={index} style={styles.historyText}>{item}</Text>
              ))
            ) : (
              <Text style={styles.emptyText}>Waiting for incoming data...</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 12, backgroundColor: '#F5F7FA' },
  appbar: { backgroundColor: '#ffffff' },
  badge: { marginRight: 16, paddingHorizontal: 8, fontSize: 11, fontWeight: 'bold' },
  card: { backgroundColor: '#FFFFFF', marginBottom: 16, borderRadius: 12 },
  icon: { fontSize: 22 },
  input: { backgroundColor: '#ffffff', marginBottom: 12 },
  button: { borderRadius: 8 },
  chartContainer: { alignItems: 'center', paddingRight: 10 },
  chart: { marginVertical: 8, borderRadius: 12 },
  logContainer: { paddingTop: 8 },
  historyText: { 
    fontSize: 14, 
    color: '#2C3E50', 
    paddingVertical: 10, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#ECF0F1' 
  },
  emptyText: { textAlign: 'center', color: '#95A5A6', marginVertical: 20, fontStyle: 'italic' }
});