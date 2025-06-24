# Field Tracker - Demo Setup Guide

## 🎯 **DEMO-READY METHOD** (Consistent & Reliable)

### **For Client Demo Presentation - Follow These Exact Steps:**

#### **Step 1: Start Metro Bundler (Separate Terminal)**
1. **Open a new Terminal window** (separate from Claude Code)
2. **Navigate to project:**
   ```bash
   cd /Users/muhamadzulfaisalsallehmustafa/FieldTracker
   ```
3. **Start Metro bundler:**
   ```bash
   npx react-native start
   ```
4. **Keep that Metro terminal visible** during your demo presentation

#### **Step 2: Launch iOS Simulator**
- Open Xcode: 
  ```bash
  open ios/FieldTracker.xcworkspace
  ```
- Select iPhone simulator
- Click Run button (▶️)

#### **Step 3: Launch Android Emulator**
- Open Android Studio → AVD Manager → Start emulator
- Once emulator is ready, run in **another terminal**:
  ```bash
  npx react-native run-android
  ```

### **Demo Login Credentials:**
- **Technician**: 
  - Select "👷 Technician"
  - Username: `tech1` or `tech2`
  - Password: any password
- **Manager**: 
  - Select "👔 Manager"
  - Username: `manager`
  - Password: any password

### **Demo Flow:**
1. **iOS as Technician** - Login with "tech1" 
2. **Android as Manager** - Login with "manager"
3. Cross-platform job workflow demonstration

### **Demo Presentation Setup:**
- ✅ Visible Metro terminal for client to see
- ✅ iOS simulator (Tech) + Android simulator (Boss) on Mac screen
- ✅ Screen sharing during meeting presentation
- ✅ Control over starting/stopping
- ✅ Reliable method that won't crash during demo

### **If App Crashes During Demo:**
1. **DON'T PANIC** - Metro is still running
2. Just click Run button (▶️) in Xcode again
3. App will reload quickly since Metro is cached

### **Important Notes:**
- **ALWAYS** use this exact method for consistency
- **NEVER** use `npx react-native run-ios` during demo (can crash)
- **KEEP** Metro terminal open and visible
- **USE** Xcode Run button for iOS (most reliable)

---
**Last Updated:** Demo preparation phase
**Critical for:** Client demo success and payment