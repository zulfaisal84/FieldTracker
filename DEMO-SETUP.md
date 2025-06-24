# Field Tracker - Demo Setup Guide

## 🎯 **DEMO-READY METHOD** (Consistent & Reliable)

### **For Client Demo Presentation - Follow These Exact Steps:**

#### **Step 1: Start Metro Bundler (CRITICAL - YOUR OWN TERMINAL)**
1. **NEVER run Metro in Claude Code terminal** - it won't be visible during demo
2. **Open a new Terminal window** (separate from Claude Code)
3. **Navigate to project:**
   ```bash
   cd /Users/muhamadzulfaisalsallehmustafa/FieldTracker
   ```
4. **Clear port 8081 first:**
   ```bash
   lsof -ti:8081 | xargs kill -9
   ```
5. **Start Metro bundler:**
   ```bash
   npx react-native start --reset-cache
   ```
6. **Keep that Metro terminal visible** during your demo presentation

#### **Step 2: Launch iOS Simulator**
- Open Xcode: 
  ```bash
  open ios/FieldTracker.xcworkspace
  ```
- Select iPhone simulator
- Click Run button (▶️)

#### **Step 3: Launch Android Emulator (SIMPLEST METHOD)**
- **Claude handles Android** - much simpler than multiple terminals
- **Tell Claude**: "Handle Android setup"
- **Claude runs**:
  ```bash
  adb shell pm clear com.fieldtracker
  npx react-native run-android
  ```
- **Result**: Android connects to your Metro, shows login page

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

### **REFRESH/RESTART SIMULATORS (Always Start at Login)**
To ensure both simulators start at login page:

#### **Refresh iOS:**
1. In iOS simulator: **Device → Erase All Content and Settings**
2. Or in Xcode: **Product → Clean Build Folder**, then Run (▶️)

#### **Refresh Android:**
1. In Android emulator: **Settings → System → Reset → Erase all data**
2. Or use command: **Cold boot restart**

#### **COMPLETE RESTART PROCESS (Practice Until Perfect):**

**Step 1: Kill Everything**
```bash
lsof -ti:8081 | xargs kill -9
pkill -f "emulator"
pkill -f "Simulator"
pkill -f "Xcode"
```

**Step 2: Start Metro (Your Terminal)**
```bash
cd /Users/muhamadzulfaisalsallehmustafa/FieldTracker
npx react-native start --reset-cache
```

**Step 3: Start iOS**
```bash
open ios/FieldTracker.xcworkspace
# Click Run (▶️) in Xcode
```

**Step 4: Start Android (Claude Handles)**
- **Tell Claude**: "Handle Android setup"
- **Claude clears cache and connects Android to Metro**
- **Much simpler than multiple terminals**

**Expected Metro Result:**
```
INFO  Connection established to app='org.reactjs.native.example.FieldTracker' on device='iPhone 16 Pro'
INFO  Connection established to app='com.fieldtracker' on device='sdk_gphone64_arm64 - 14 - API 34'
```

**Both should show LOGIN PAGE**

### **Important Notes:**
- **ALWAYS** use this exact method for consistency
- **NEVER** use Android Studio or `npx react-native run-ios` during demo
- **USE** direct emulator command: `emulator -avd TechTrackerSmall &`
- **KEEP** Metro terminal open and visible
- **USE** Xcode Run button for iOS (most reliable)
- **START FRESH** at login page every demo session

---
**Last Updated:** Demo preparation phase
**Critical for:** Client demo success and payment