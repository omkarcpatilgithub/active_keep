import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time
from datetime import datetime
import pyautogui
import keyboard
import os
import ctypes
import json
from pathlib import Path
from enum import Enum

class ActivityState(Enum):
    IDLE = 0
    WORKING = 1
    AWAY = 2

class SystemKeepActiveAdvanced:
    def __init__(self, root):
        self.root = root
        self.root.title("Keep System Active - Teams Status Manager")
        self.root.geometry("600x550")
        self.root.resizable(False, False)

        self.is_active = False
        self.activity_log = []
        self.last_activity_time = time.time()
        self.config_file = Path("keep_active_config.json")

        self.setup_ui()
        self.load_config()

    def setup_ui(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="15")
        main_frame.pack(fill="both", expand=True)

        # Title
        title = ttk.Label(main_frame, text="Keep System Active", font=("Arial", 18))
        title.pack(pady=5)

        subtitle = ttk.Label(main_frame, text="Keep Teams status as 'Available'", font=("Arial", 10), foreground="gray")
        subtitle.pack(pady=2)

        # Status indicator
        status_frame = ttk.LabelFrame(main_frame, text="Current Status", padding="10")
        status_frame.pack(fill="x", pady=10)

        self.status_label = ttk.Label(status_frame, text="● INACTIVE", font=("Arial", 14), foreground="red")
        self.status_label.pack(pady=5)

        self.timer_label = ttk.Label(status_frame, text="", font=("Arial", 10))
        self.timer_label.pack(pady=3)

        self.next_activity_label = ttk.Label(status_frame, text="", font=("Arial", 9), foreground="gray")
        self.next_activity_label.pack(pady=2)

        # Control buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill="x", pady=15)

        self.start_btn = ttk.Button(button_frame, text="▶ START", command=self.start_activity, width=20)
        self.start_btn.pack(side="left", padx=5)

        self.stop_btn = ttk.Button(button_frame, text="⏹ STOP", command=self.stop_activity, width=20, state="disabled")
        self.stop_btn.pack(side="left", padx=5)

        # Settings frame
        settings_frame = ttk.LabelFrame(main_frame, text="Settings", padding="10")
        settings_frame.pack(fill="x", pady=5)

        # Interval setting
        interval_frame = ttk.Frame(settings_frame)
        interval_frame.pack(fill="x", pady=5)
        ttk.Label(interval_frame, text="Activity Interval (sec):").pack(side="left")
        self.interval_var = tk.IntVar(value=60)
        interval_spinbox = ttk.Spinbox(interval_frame, from_=10, to=300, textvariable=self.interval_var, width=8)
        interval_spinbox.pack(side="left", padx=10)
        ttk.Label(interval_frame, text="⏱ How often to simulate activity", font=("Arial", 8)).pack(side="left")

        # Activity type
        ttk.Label(settings_frame, text="Activity Type:", font=("Arial", 9)).pack(anchor="w", pady=(5, 3))
        self.activity_type_var = tk.StringVar(value="mouse")

        activity_options_frame = ttk.Frame(settings_frame)
        activity_options_frame.pack(fill="x", padx=20, pady=3)

        ttk.Radiobutton(activity_options_frame, text="🖱 Mouse (Silent)", variable=self.activity_type_var, value="mouse").pack(anchor="w")
        ttk.Radiobutton(activity_options_frame, text="⌨ Keyboard (Scroll Lock)", variable=self.activity_type_var, value="keyboard").pack(anchor="w")
        ttk.Radiobutton(activity_options_frame, text="🔄 Both", variable=self.activity_type_var, value="both").pack(anchor="w")

        # Options
        options_frame = ttk.Frame(settings_frame)
        options_frame.pack(fill="x", pady=(10, 0))

        self.prevent_sleep_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="Prevent system sleep", variable=self.prevent_sleep_var).pack(anchor="w", pady=2)

        self.auto_start_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(options_frame, text="Auto-start when app launches", variable=self.auto_start_var).pack(anchor="w", pady=2)

        self.log_activity_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="Log activities to console", variable=self.log_activity_var).pack(anchor="w", pady=2)

        # Info section
        info_frame = ttk.LabelFrame(main_frame, text="Info", padding="10")
        info_frame.pack(fill="x", pady=5)

        info_text = "✓ This app simulates minimal system activity to keep Windows from marking you idle\n" \
                   "✓ Teams will show you as 'Available' continuously\n" \
                   "✓ Safe to use - doesn't interfere with your work"
        ttk.Label(info_frame, text=info_text, font=("Arial", 9), justify="left", wraplength=500).pack(anchor="w")

        # Status bar
        status_bar = ttk.Frame(self.root)
        status_bar.pack(fill="x", side="bottom", padx=10, pady=5)

        self.status_bar_label = ttk.Label(status_bar, text="Ready", font=("Arial", 8), foreground="gray")
        self.status_bar_label.pack(side="left")

    def start_activity(self):
        """Start keeping system active"""
        if self.is_active:
            return

        self.is_active = True
        self.start_btn.config(state="disabled")
        self.stop_btn.config(state="normal")
        self.status_label.config(text="● ACTIVE", foreground="green")
        self.status_bar_label.config(text="System is being kept active...", foreground="green")

        # Prevent sleep if enabled
        if self.prevent_sleep_var.get():
            self.prevent_sleep()

        # Start monitoring thread
        monitor_thread = threading.Thread(target=self.monitor_loop, daemon=True)
        monitor_thread.start()

        self.log("✓ Keep-Active started")
        self.save_config()

    def stop_activity(self):
        """Stop keeping system active"""
        self.is_active = False
        self.start_btn.config(state="normal")
        self.stop_btn.config(state="disabled")
        self.status_label.config(text="● INACTIVE", foreground="red")
        self.timer_label.config(text="")
        self.next_activity_label.config(text="")
        self.status_bar_label.config(text="Stopped", foreground="gray")

        # Allow sleep again if it was disabled
        if self.prevent_sleep_var.get():
            self.allow_sleep()

        self.log("✗ Keep-Active stopped")
        self.save_config()

    def monitor_loop(self):
        """Main monitoring loop"""
        start_time = time.time()
        activity_count = 0

        while self.is_active:
            try:
                interval = self.interval_var.get()

                # Update timer
                elapsed = int(time.time() - start_time)
                minutes = elapsed // 60
                seconds = elapsed % 60
                hours = minutes // 60

                if hours > 0:
                    time_str = f"{hours}h {minutes % 60}m {seconds}s"
                else:
                    time_str = f"{minutes}m {seconds}s"

                self.timer_label.config(text=f"⏱ Running for: {time_str} | ✓ Activities: {activity_count}")
                self.next_activity_label.config(text=f"Next activity in ~{interval}s")

                # Perform activity
                activity_type = self.activity_type_var.get()

                if activity_type in ["mouse", "both"]:
                    self.simulate_mouse_activity()

                if activity_type in ["keyboard", "both"]:
                    self.simulate_keyboard_activity()

                activity_count += 1

                if self.log_activity_var.get():
                    self.log(f"Activity #{activity_count}: {activity_type.upper()}")

                # Sleep until next activity
                for _ in range(interval):
                    if not self.is_active:
                        break
                    time.sleep(1)

            except Exception as e:
                self.log(f"⚠ Error: {str(e)}")
                time.sleep(5)

    def simulate_mouse_activity(self):
        """Simulate subtle mouse movement"""
        try:
            current_pos = pyautogui.position()
            # Move mouse slightly and back (1 pixel)
            pyautogui.moveTo(current_pos[0] + 1, current_pos[1] + 1, duration=0.05)
            time.sleep(0.1)
            pyautogui.moveTo(current_pos[0], current_pos[1], duration=0.05)
        except Exception as e:
            print(f"Mouse activity error: {e}")

    def simulate_keyboard_activity(self):
        """Simulate keyboard activity using Scroll Lock toggle"""
        try:
            # Toggle Scroll Lock on and off (doesn't interfere with user input)
            keyboard.press_and_release('scroll lock')
            time.sleep(0.15)
            keyboard.press_and_release('scroll lock')
        except Exception as e:
            print(f"Keyboard activity error: {e}")

    def prevent_sleep(self):
        """Prevent system from sleeping (Windows)"""
        try:
            # ES_SYSTEM_REQUIRED = 0x00000001
            # ES_DISPLAY_REQUIRED = 0x00000002
            # ES_CONTINUOUS = 0x80000000
            ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)
            self.log("✓ System sleep prevented")
        except Exception as e:
            print(f"Sleep prevention error: {e}")

    def allow_sleep(self):
        """Allow system to sleep again"""
        try:
            # ES_CONTINUOUS = 0x80000000
            ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
            self.log("✓ System sleep allowed")
        except Exception as e:
            print(f"Allow sleep error: {e}")

    def save_config(self):
        """Save current configuration"""
        config = {
            "interval": self.interval_var.get(),
            "activity_type": self.activity_type_var.get(),
            "prevent_sleep": self.prevent_sleep_var.get(),
            "auto_start": self.auto_start_var.get(),
            "log_activity": self.log_activity_var.get(),
        }
        try:
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            print(f"Error saving config: {e}")

    def load_config(self):
        """Load saved configuration"""
        try:
            if self.config_file.exists():
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                    self.interval_var.set(config.get("interval", 60))
                    self.activity_type_var.set(config.get("activity_type", "mouse"))
                    self.prevent_sleep_var.set(config.get("prevent_sleep", True))
                    self.auto_start_var.set(config.get("auto_start", False))
                    self.log_activity_var.set(config.get("log_activity", True))

                    # Auto-start if enabled
                    if self.auto_start_var.get():
                        self.root.after(500, self.start_activity)
        except Exception as e:
            print(f"Error loading config: {e}")

    def log(self, message):
        """Log a message"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        self.activity_log.append(log_entry)
        print(log_entry)

    def on_closing(self):
        """Handle window closing"""
        if self.is_active:
            if messagebox.askyesno("Confirm Exit", "Keep-Active is running.\n\nDo you want to stop it before closing?"):
                self.stop_activity()
                self.root.destroy()
        else:
            self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = SystemKeepActiveAdvanced(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()
