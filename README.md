# 🌡️ Smart IoT Dashboard (MQTT)

แอปพลิเคชัน Real-time Dashboard สำหรับติดตามค่าอุณหภูมิผ่านโปรโตคอล MQTT พัฒนาด้วย **React Native** และ **Expo** โดยเน้นการออกแบบ UI ที่สะอาดตาและใช้งานง่ายตามหลัก Material Design

## ✨ Features
- **Real-time Monitoring**: รับข้อมูลจาก MQTT Broker (HiveMQ Cloud) และแสดงผลทันที
- **Dynamic Charting**: แสดงกราฟเส้นแนวโน้มอุณหภูมิ 10 ข้อมูลล่าสุดด้วย `react-native-chart-kit`
- **Two-way Communication**: สามารถพิมพ์ค่าอุณหภูมิจำลองและ Publish กลับไปยัง Topic ที่กำหนดได้
- **Modern UI**: ใช้ส่วนประกอบจาก `react-native-paper` เพื่อประสบการณ์ใช้งานที่ดีเยี่ยม
- **Connection Status**: มีระบบตรวจสอบสถานะการเชื่อมต่อ (Online/Offline) แบบ Real-time

## 🛠️ Tech Stack
- **Framework**: [React Native (Expo)](https://expo.dev/)
- **Protocol**: MQTT via [Paho JavaScript Client](https://www.eclipse.org/paho/index.php?page=clients/js/index.php)
- **UI Framework**: [React Native Paper](https://reactnativepaper.com/)
- **Visuals**: [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)

## 🚀 Getting Started

### Prerequisites
- Node.js (แนะนำ LTS)
- Expo Go app บนมือถือของคุณ

### Installation
1. Clone repository นี้ลงเครื่อง:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
