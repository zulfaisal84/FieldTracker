# Field Tracker - Technician Field Work Mobile App

## 🎯 PROJECT MISSION
A mobile app that allows field technicians to submit work reports with photos to managers for approval/rejection workflow.

## 👥 USER ROLES & WORKFLOW
### Technician Users:
1. **Create Job Entry**: Add job description and details
2. **Capture Photos**: Take multiple photos of work completed
3. **Submit Report**: Send job + photos to manager for review
4. **Resubmit if Rejected**: Edit and resubmit rejected jobs

### Manager Users:
1. **Review Submissions**: View technician job reports and photos
2. **Approve Jobs**: Mark completed work as approved
3. **Reject Jobs**: Send back to technician with feedback for redo
4. **Track Progress**: Monitor all technician activities

## 🔄 CORE WORKFLOW
```
Technician → Create Job → Add Photos → Submit
                ↓
Manager → Review → Approve ✅ OR Reject ❌
                ↓                    ↓
            Complete            Back to Technician
                                    ↓
                            Edit & Resubmit
```

## 🏗️ KEY FEATURES TO BUILD
- User authentication (technician/manager roles)
- Job creation and editing interface
- Photo capture and upload
- Manager approval/rejection system
- Job status tracking (submitted/approved/rejected)
- Push notifications for status updates
- Cross-platform (iOS + Android)

## 📋 PREVIOUS PROJECT ANALYSIS (techtracker_pro)
### ✅ What Was Already Built:
1. **Complete Login System**: 
   - User type toggle (Technician/Manager)
   - Email/password authentication
   - Role-based UI switching

2. **Comprehensive Job Management**:
   - Job creation with title, site, date, assignment
   - Job status workflow: Created → In Progress → Submitted → Approved/Rejected
   - Work status tracking: Not Started → Working → Completed

3. **Advanced Photo System**:
   - Before/During/After photo categories
   - Photo metadata (timestamp, description, task linking)
   - Organized by tasks and daily progress

4. **Manager Dashboard**:
   - Statistics cards (pending reviews, approved today, total jobs)
   - Job filtering and prioritization
   - Urgent job highlighting for submitted items

5. **Time Tracking**:
   - Daily time entries with start/end times
   - Automatic hour calculation
   - Time session management

6. **Data Architecture**:
   - React Context for state management
   - Detailed job interfaces with TypeScript
   - Mock data with realistic job scenarios

### 🛠️ Technical Stack Used:
- React Native 0.72.10 + TypeScript
- React Navigation (Stack Navigator)
- React Native Image Picker
- AsyncStorage for persistence
- Context API for state management

### 🎨 UI/UX Approach:
- Clean white background design
- Red primary color (#DC2626)
- Icon-based status indicators
- Card-based job layout
- Responsive platform-specific styling

### Tech Stack Decision
- **Frontend**: React Native with TypeScript
- **Reason**: Single codebase for both platforms, excellent camera/photo support

## Project Status
- **Current State**: ✅ WORKING! App runs successfully on iOS simulator
- **Project Name**: Field Tracker (folder: FieldTracker)
- **Location**: /Users/muhamadzulfaisalsallehmustafa/FieldTracker
- **GitHub Repository**: https://github.com/zulfaisal84/FieldTracker
- **iOS Test**: ✅ Successfully showing React Native welcome screen
- **Git Protection**: ✅ Initial commit pushed to GitHub
- **Days Worked**: 3 days (2 previous + today)

## App Architecture
```
Frontend: React Native + TypeScript
Backend: Node.js/Express + PostgreSQL/Firebase
Key Components:
- User Authentication (roles: Technician/Manager)
- Job CRUD operations  
- Photo upload/storage
- Status workflow: Submitted → Approved/Rejected
- Push notifications
```

## Workflow
1. Technician creates job entry
2. Adds job description and photos
3. Submits to manager
4. Manager reviews and approves/rejects
5. If rejected, technician can edit and resubmit

## Development Commands
```bash
# Project setup completed
cd FieldTracker
npx react-native run-ios
npx react-native run-android

# Common troubleshooting
cd ios && pod install && cd ..
npx react-native clean
npx react-native start --reset-cache
```

## Known Issues & Solutions
- iOS build takes extremely long (5+ minutes): Normal for first build
- Build timeout: Use Xcode directly instead of CLI
- Metro bundler port conflict: Kill process on 8081 first

## Quick iOS Setup
1. Open Xcode: `open ios/FieldTracker.xcworkspace`
2. Select iPhone simulator
3. Click Run button (▶️)
4. First build takes 5-10 minutes

## Next Steps
1. Set up React Native project
2. Configure development environment
3. Implement core features
4. Test on both platforms

## Auto-Update Policy
This file will be automatically updated after every significant change:
- Project setup steps
- Code implementations
- Bug fixes and solutions
- Development commands that work
- Known issues and resolutions
- Progress milestones

## 🛡️ CRASH PROTECTION STRATEGY
### Session Recovery Protocol:
**Tell Claude:** "This is the Field Tracker project - read CLAUDE.md"
**Claude will:** Automatically read this file and understand full project context

### Planning Session (Pre-Code):
- ✅ Project requirements documented
- ✅ Previous project analyzed
- 🔄 Architecture decisions needed
- 🔄 Development approach planning
- 🔄 Risk mitigation strategies
- 🔄 Testing approach defined

## 🧠 BRAINSTORMING NOTES

### 📝 Terminology:
- **PP** = Previous Project (techtracker_pro)
- **CP** = Current Project (FieldTracker)

### 🔄 PP Workflow Analysis:

#### 🚪 Login Screen Changes for CP:
- **PP**: Email + Password authentication
- **CP**: Username + Password authentication ✅
- Reason: Simpler for field technicians

#### 🔐 Authentication Strategy Discussion:
**Questions & Considerations:**

1. **User Role Toggle**: Keep [👷 Technician] / [👔 Manager] ✅
2. **Username Format**: No specific format ✅
3. **Manager Creates Technician Accounts**: 
   - Manager sets username + temporary password
   - Technician forced to change password on first login
4. **Validation**: Check if username exists ✅
5. **Storage Strategy DECISION**: 
   - **Cloud Storage (Firebase/Backend)** ✅ CHOSEN
   - **Offline-First Design**: Work without internet, sync when available
   - **Local Cache**: Photos + data stored locally until internet available
   - **Priority**: Photos and descriptions are most crucial data

6. **Offline-First Workflow - ISSUE IDENTIFIED**:
   - ❌ Problem: Can't login without internet = Can't access app features
   - 🤔 Need solution for offline authentication

7. **Bootstrap Manager Access**: Setup Wizard (Option B) ✅

8. **Offline Authentication Solutions to Consider**:
   - Cache login credentials after first successful login?
   - Offline mode with limited features?
   - Biometric authentication for offline access?

#### 🔄 Job Status Workflow Changes for CP:

**PP Workflow**:
```
Created → In Progress → Submitted → Approved/Rejected
(With Start/End Session buttons for time tracking)
```

**CP DETAILED Workflow (Option B)** ✅:

**Terminology**: Tech = Technician, Boss = Manager

**Job Status Flow**:
```
Created → [Start Work] → In Progress → [Complete Work] → Completed → [Submit Job] → Submitted → Approved/Rejected
          (Any tech)      (All techs)     (Validation)    (Ready)      (Boss review)      (Outcome)
```

**Multi-Tech Assignment**:
- ✅ One job can have multiple techs assigned
- ✅ ANY tech hits "Start Work" → Job becomes "In Progress" for ALL
- ✅ Cloud notification to Boss: "Job X officially started"

**Daily Progress System**:
- ✅ Each tech can add daily progress in Job Details
- ✅ Flexible dating: Can add Monday's work on Tuesday/Wednesday
- ✅ Per day: Multiple completed tasks + multiple pending tasks
- ✅ Each completed task requires photos

**Validation & Submission**:
- ✅ "Complete Work" button → Validates all mandatory fields
- ✅ If valid: Button changes to "Submit Job" 
- ✅ Submit → Boss notification for review

**Approval/Rejection Cycle**:
- ✅ Boss approves → Job removed from tech list, moves to 2-year history
- ✅ Boss rejects → Job back to "In Progress", all techs notified
- ✅ Boss can generate reports from approved job history

**Questions Answered**:

**1. Multi-Tech Coordination** ✅:
- Tech A adds task → ALL assigned techs + Boss get notification
- Techs can see each other's daily progress in real-time
- ANY assigned tech can hit "Complete Job" (uniform terminology)
- App validates ALL mandatory fields before allowing completion

**2. Daily Progress Mandatory Fields** ✅:
- **Per Task Required**: Description, Before photo, After photo, Start time, Complete time
- **Optional**: During photos, Pending tasks
- **Photo descriptions**: Mandatory for every photo uploaded
- **Multi-day tasks**: Techs can update complete time until "Complete Job" hit

**3. Rejection & Task Management** ✅:
- Boss can specify which tasks need fixing + add rejection comments
- Techs can edit/add tasks even AFTER submission (before approval)
- "Update Submitted Job" button → overwrites same job (no duplicates)
- All task updates have Save button → saves to cloud → visible in Job Details

**4. Photo & Time Management** ✅:
- Photo size limit: 2MB per photo ✅
- Techs can retake/reupload photos and edit descriptions
- Date format: dd/mm/yyyy (separate field)
- Time format: hh:mm AM/PM (separate field)

**Task Update Flow**:
```
Add/Edit Task → Save Button → Cloud Storage → Job Details Page Updated
                                    ↓
                        All assigned techs + Boss notified
```

**Post-Submission Editing**:
```
Job Submitted → Tech can still edit → Update Submitted Job → Overwrites cloud data
                                           ↓
                                    Boss sees updated version
```

**5. Notifications & Connectivity** ✅:
- Real-time Firebase notifications
- Offline users see notifications when back online
- Notification types: Job started, task added, pending task added, job completed, job submitted, information edited, photo replaced

**6. Job Creation & Assignment** ✅:
- Only Boss can create jobs
- Boss selects multiple techs in create job page
- Boss can Cancel Job (button only for Boss)
- Mandatory fields: Site Location, Brief Job Description, Creation Date
- Example: "KLCC Tower 1" + "Machine 1 Electrical Works" + auto date

**7. Edge Cases & Security** ✅:
- Accidental Start Job → Contact Boss to cancel & recreate
- Boss manages tech accounts (registration/deletion)
- Simultaneous task creation → Notification sent, techs discuss & delete duplicates

**8. Reports & History** ✅:
- Report content: All tasks + photos only (PDF format)
- Filter options: Date and Site (expandable later)
- Format may change based on client feedback

**9. User Management** ✅:
- Boss has tech management function (create/delete accounts)
- Mandatory password change on first login
- Boss can reset forgotten passwords → temporary password

**10. Complete Notification Types** ✅:
- Job created/assigned, Job approved, Job rejected, Tech account created
- ❌ Password reset notification (tech not logged in - good catch!)

**11. Tech Management Details** ✅:
- Separate "Manage Techs" screen for Boss
- Tech info: Username, real name, phone, email, creation date
- Boss can assign job to multiple techs (like PP) but NOT to himself

**12. Job List Organization** ✅:
- Techs: See ALL assigned jobs (no filtering initially)
- Boss: See ALL jobs (Created, In Progress, Completed, Submitted)
- Boss can view real-time progress of In Progress jobs (tasks, photos, etc.)
- Job sorting: By Status

**13. Data Validation** ✅:
- Site Location: Free text input
- Tech usernames: No restrictions

**14. App Navigation Discussion** 🤔:
- **Techs**: Maybe no bottom tabs needed (simpler)
- **Boss**: Bottom tabs recommended
- Question: What navigation approach for techs?

**Navigation Decisions** ✅:

**👷 Tech Navigation**:
- Back button navigation ✅
- Popup notifications ✅  
- Separate "Change Password" page ✅
- Keep minimal features for field work ✅

**👔 Boss Navigation**:
- Bottom tabs: Job List, Create Job, Manage Techs, Reports, Settings ✅
- Create Job: Full screen (not modal overlay)
- Notifications: Integrated in Job List ✅

**Both Users**:
- User Profile screens needed ✅
- **Logout Placement** ✅:
  - **Tech**: Header menu (⋯) → Profile → Logout
  - **Boss**: Settings tab → Logout (red button at bottom)

**Clarification Notes**:
- "Navigation approach" = app screen navigation (not GPS)
- "Modal overlay" = popup window (Boss will use full screen instead)

---
**Note**: This file is maintained to preserve project context across sessions and will be updated continuously throughout development.