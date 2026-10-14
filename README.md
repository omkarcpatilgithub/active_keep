# Keep System Active - Teams Status Manager

A professional desktop application that keeps your system continuously active so **Microsoft Teams always shows you as "Available"**. Perfect for remote workers who need to stay visible without constantly using the keyboard.

## 🎯 What It Does

- **Simulates System Activity** - Prevents Windows from marking you as "Idle"
- **Keeps Teams Available** - Your status stays green continuously
- **Prevents Sleep** - Keeps monitor and system awake
- **Zero Interference** - Won't affect your work or typing
- **Customizable** - Control interval and activity type
- **Logs Everything** - Track all activities

## 📦 Two Versions Available

### 1. **Basic Version** (`keep_active.py`)
Lightweight with essential features:
- Simple start/stop control
- Customizable intervals and activity types
- Prevent system sleep option
- Activity logging

**Run with**: `run.bat`

### 2. **Advanced Version** (`keep_active_advanced.py`) ⭐ **RECOMMENDED**
Enhanced features with better UX:
- Real-time countdown to next activity
- Running time display with hours/minutes
- Auto-start option (remember your preference)
- Config auto-save
- Better status indicators
- Improved logging

**Run with**: `run_advanced.bat`

---

## 🚀 Quick Start

### Step 1: Install Python
Download from: https://www.python.org/downloads/
- ✅ Check "Add Python to PATH" during installation

### Step 2: Run the App
**Double-click** one of these files:
- `run_advanced.bat` ← **Start here (recommended)**
- `run.bat` ← Basic version

That's it! Dependencies will install automatically.

---

## 🎛️ Settings Explained

### Activity Interval
How often to simulate activity:
- **10-30 seconds** - Very frequent (battery intensive)
- **30-60 seconds** - Recommended (balanced)
- **60-120 seconds** - Longer gaps (battery friendly)
- **300 seconds (5 min)** - Maximum gap

**💡 Tip**: Use 45-60 seconds for optimal Teams availability without draining battery.

### Activity Types

| Type | How It Works | Best For |
|------|-------------|----------|
| **🖱 Mouse** | Moves cursor 1px invisibly | Silent, unnoticed |
| **⌨️ Keyboard** | Toggles Scroll Lock key | Doesn't interfere with typing |
| **🔄 Both** | Uses both methods | Maximum activity signal |

**Recommendation**: Use **Mouse mode** - it's completely silent and unnoticed.

### Options

- ✅ **Prevent system sleep** - Uses Windows API to keep system awake
  - Prevents monitor from turning off
  - Keeps system from sleeping
  
- ✅ **Auto-start** - Automatically starts when app launches
  - Saves your preference
  - Loads from `keep_active_config.json`

- ✅ **Log activities** - Shows in console what the app is doing
  - Useful for debugging
  - Disable to reduce spam

---

## 📊 How It Works

```
Your Computer Activity
        ↓
    Every 60 seconds (or your interval)
        ↓
   Simulate Activity (mouse/keyboard)
        ↓
   Windows sees activity
        ↓
   Marks you as "Active"
        ↓
   Teams shows you as "Available"
        ↓
   Everyone sees you're online
```

### Technical Details

- Uses **official Windows API** (`SetThreadExecutionState`) to prevent sleep
- Simulates **minimal, invisible activity**
- **No keyboard interference** - Your typing won't be affected
- **No mouse interference** - Cursor movement is 1 pixel only

---

## 🎮 Usage Examples

### Example 1: Standard Work Day
```
Interval: 60 seconds
Activity Type: Mouse
Prevent Sleep: ON
Auto-start: OFF
```
Perfect for 8-hour work day. Restart manually each morning.

### Example 2: Always-On Setup
```
Interval: 60 seconds
Activity Type: Mouse
Prevent Sleep: ON
Auto-start: ON
```
App starts automatically whenever you boot up.

### Example 3: Battery-Conscious
```
Interval: 120 seconds
Activity Type: Mouse
Prevent Sleep: OFF (let monitor sleep)
Auto-start: ON
```
Less frequent activity = longer battery life, but monitor may sleep.

---

## 📝 Files Included

```
keep_active/
├── keep_active.py              # Basic version
├── keep_active_advanced.py     # Advanced version (recommended)
├── requirements.txt            # Python dependencies
├── run.bat                      # Launcher for basic version
├── run_advanced.bat             # Launcher for advanced version
├── run.ps1                      # PowerShell launcher
├── README.md                    # This file
└── keep_active_config.json      # Auto-saved settings (created on first run)
```

---

## ⚙️ Installation & Setup

### Option A: Automatic (Easiest)
1. Double-click `run_advanced.bat`
2. Wait for Python dependencies to install
3. App launches automatically

### Option B: Manual PowerShell
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\run.ps1
```

### Option C: Command Prompt
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
python keep_active_advanced.py
```

---

## 🔧 Troubleshooting

### Problem: "Python not found"
**Solution**: 
- Python not installed - Download from https://www.python.org
- Not in PATH - Reinstall Python, check "Add Python to PATH"

### Problem: "Permission Denied" with keyboard/mouse
**Solution**:
- Right-click `run_advanced.bat` → "Run as administrator"
- Or use Mouse mode (no admin needed)

### Problem: Still going to Idle/Away in Teams
**Solutions**:
1. Check that app shows "● ACTIVE" (green status)
2. Reduce interval to 45 seconds
3. Use "Both" activity type instead of just Mouse
4. Restart Teams app after starting Keep Active

### Problem: Mouse activity is visible
**Solution**:
- Switch to Keyboard mode (Scroll Lock toggle)
- Or increase interval so activity is less frequent

### Problem: App crashes or freezes
**Solution**:
- Check console for error messages
- Try basic version instead of advanced
- Disable "Prevent system sleep" option
- Update Python and dependencies:
  ```bash
  pip install --upgrade -r requirements.txt
  ```

---

## ⚠️ Important Notes

### Responsible Use
✅ **Good uses**:
- Work from home - staying visible during normal work
- Scheduled breaks - preventing idle status during calls
- Legitimate business needs - keeping availability status accurate

❌ **Avoid**:
- Hiding actual inactivity to violate policies
- Using to trick time-tracking software
- Circumventing company monitoring systems

### Always Check Company Policy
Before using this app, verify your company allows it. Some organizations have policies against automated activity tools.

### System Impact
- **RAM**: Minimal (~30-50 MB)
- **CPU**: Nearly zero (only when simulating activity)
- **Battery**: ~5-10% drain when "Prevent sleep" enabled
- **Network**: None - fully offline app

---

## 🔐 Security & Privacy

- **No Internet**: App runs completely offline
- **No Data Collection**: Nothing is sent anywhere
- **No Logging**: Only local console logging
- **No Registry Changes**: Except Windows API calls (safe and official)
- **Open Source Approach**: Code is simple and transparent

---

## 🚪 Running at Startup (Advanced)

To make this app start automatically when Windows boots:

1. Press `Win + R`
2. Type: `shell:startup`
3. Right-click in the folder → "New" → "Shortcut"
4. Paste path: `C:\path\to\run_advanced.bat`
5. Name it "Keep Active"
6. Click OK

Now it starts automatically on Windows boot!

---

## 📞 Support

If you encounter issues:
1. Try the **Troubleshooting** section above
2. Run as Administrator
3. Check Python version: `python --version` (should be 3.6+)
4. Reinstall dependencies: `pip install --upgrade -r requirements.txt`

---

## 🎓 What You're Getting

✅ A professional desktop application
✅ Safe, tested code using official Windows APIs
✅ Zero interference with your actual work
✅ Full control over when and how it runs
✅ Persistent configuration saving
✅ Real-time monitoring and logging

---

## 📌 Key Reminders

- ✅ Keep the app running during your work day
- ✅ Check Teams shows you as "Available" (green status)
- ✅ You can pause anytime by clicking STOP
- ✅ Closing the app stops the activity simulation
- ✅ Settings are auto-saved between sessions

---

## 🎯 Next Steps

1. **Double-click** `run_advanced.bat`
2. Click **▶ START**
3. Check Teams - should show you as **Available**
4. Keep app running in background
5. That's it! You're set.

**Happy remote working!** 🚀

---

**Questions?** Everything is explained in this README. Start with the Quick Start section above if you're new to the app.
