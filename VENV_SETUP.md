# Virtual Environment Setup Guide

This guide explains how to run the Keep System Active app with Python virtual environment isolation.

## Why Virtual Environment?

✅ **Isolated dependencies** - Packages only installed for this app, not system-wide  
✅ **Clean uninstall** - Just delete the `venv` folder to remove everything  
✅ **No conflicts** - Won't interfere with other Python projects  
✅ **Best practice** - Professional Python development approach  

---

## 🚀 Quick Start (One-Time Setup)

### Step 1: Run Setup
Double-click: **`setup_venv.bat`**

This will:
- Create a virtual environment folder (`venv/`)
- Install all dependencies in that folder
- Take 1-2 minutes

### Step 2: Run the App
After setup, double-click: **`run_venv_advanced.bat`** (or `run_venv_basic.bat`)

**That's it!** The app will launch with the isolated virtual environment.

---

## 📁 File Structure

```
Desktop/claude/
├── setup_venv.bat              ← Run this first (one time only)
├── run_venv_advanced.bat       ← Run this to start the app (advanced version)
├── run_venv_basic.bat          ← Run this to start the app (basic version)
├── venv/                       ← Virtual environment folder (created by setup)
│   ├── Scripts/
│   ├── Lib/
│   └── ...
├── keep_active_advanced.py
├── keep_active.py
├── requirements.txt
├── README.md
└── VENV_SETUP.md              ← This file
```

---

## 🔄 How It Works

### First Time:
1. Run `setup_venv.bat`
   - Creates `venv/` folder
   - Installs dependencies inside `venv/`
   - Takes ~1-2 minutes

### Every Time After:
1. Run `run_venv_advanced.bat`
   - Activates the virtual environment
   - Starts the app
   - Auto-deactivates when app closes

---

## ❓ Troubleshooting

### Problem: "Virtual environment not found"
**Solution:** Run `setup_venv.bat` first

### Problem: "python command not found"
**Solution:** 
- Python not installed - Download from https://www.python.org
- Not in PATH - Reinstall with "Add Python to PATH" checked

### Problem: Setup is slow
**Normal!** First-time setup downloads and installs ~50MB of packages. Subsequent runs are instant.

### Problem: Want to reset everything
**Solution:** 
1. Delete the `venv` folder
2. Run `setup_venv.bat` again
3. All clean and fresh!

---

## 📋 Manual Commands (Advanced)

If you want to do this manually instead of using the batch files:

### Create Virtual Environment:
```bash
python -m venv venv
```

### Activate Virtual Environment:
```bash
venv\Scripts\activate
```

### Install Dependencies:
```bash
pip install -r requirements.txt
```

### Run the App:
```bash
python keep_active_advanced.py
```

### Deactivate Virtual Environment:
```bash
deactivate
```

---

## ✅ Verification

After setup, you should have:
- ✅ `venv/` folder exists
- ✅ `venv/Scripts/python.exe` file exists
- ✅ `venv/Lib/site-packages/` contains packages

You can verify in Command Prompt:
```bash
venv\Scripts\python.exe --version
```

Should show Python 3.x.x

---

## 🗑️ Clean Uninstall

To completely remove everything related to this app:

1. Delete the entire `Desktop/claude` folder
2. Done! No registry entries, no system files touched

That's the beauty of virtual environments - complete isolation!

---

## 📌 Summary

| Action | Command |
|--------|---------|
| **First Setup** | Double-click `setup_venv.bat` |
| **Run App (Advanced)** | Double-click `run_venv_advanced.bat` |
| **Run App (Basic)** | Double-click `run_venv_basic.bat` |
| **Full Reset** | Delete `venv/` folder, then run setup again |
| **Manual Activate** | `venv\Scripts\activate` |

---

**Next Step:** Run `setup_venv.bat` now! ▶️
