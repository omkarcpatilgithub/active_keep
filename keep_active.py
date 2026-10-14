import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time
from datetime import datetime
import pyautogui
import keyboard
import os
import ctypes
from enum import Enum

class ActivityState(Enum):
    IDLE = 0
    WORKING = 1
    AWAY = 2

class SystemKeepActive:
    def __init__(self, root):
        self.root = root
        self.root.title("Keep System Active - Teams Status Manager")
        self.root.geometry("500x400")
        self.root.resizable(False, False)

        self.is_active = False
        self.activity_log = []
        self.last_activity_time = time.time()

        self.setup_ui()
        self.setup_tray()

    def setup_ui(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.pack(fill="both", expand=True)

        # Title
        title = ttk.Label(main_frame, text="Keep System Active", font=("Arial", 16))
        title.pack(pady=10)

        subtitle = ttk.Label(main_frame, text="Keep Teams status as 'Available'", font=("Arial", 10), foreground="gray")
        subtitle.pack(pady=5)

        # Status indicator
        status_frame = ttk.LabelFrame(main_frame, text="Status", padding="10")
        status_frame.pack(fill="x", pady=10)

        self.status_var = tk.StringVar(value="Inactive")
        self.status_label = ttk.Label(status_frame, text="● INACTIVE", font=("Arial", 14), foreground="red")
        self.status_label.pack(pady=5)

        self.timer_label = ttk.Label(status_frame, text="", font=("Arial", 10))
        self.timer_label.pack(pady=5)

        # Control buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill="x", pady=15)

        self.start_btn = ttk.Button(button_frame, text="▶ Start", command=self.start_activity, width=15)
        self.start_btn.pack(side="left", padx=5)

        self.stop_btn = ttk.Button(button_frame, text="⏹ Stop", command=self.stop_activity, width=15, state="disabled")
        self.stop_btn.pack(side="left", padx=5)

        # Settings frame
        settings_frame = ttk.LabelFrame(main_frame, text="Settings", padding="10")
        settings_frame.pack(fill="x", pady=10)

        # Interval setting
        ttk.Label(settings_frame, text="Activity Interval (seconds):").pack(anchor="w")
        self.interval_var = tk.IntVar(value=60)
        interval_spinbox = ttk.Spinbox(settings_frame, from_=10, to=300, textvariable=self.interval_var, width=10)
        interval_spinbox.pack(anchor="w", padx=20, pady=5)

        # Activity type
        ttk.Label(settings_frame, text="Activity Type:").pack(anchor="w", pady=(10, 0))
        self.activity_type_var = tk.StringVar(value="mouse")

        ttk.Radiobutton(settings_frame, text="Mouse Movement (Silent)", variable=self.activity_type_var, value="mouse").pack(anchor="w", padx=20)
        ttk.Radiobutton(settings_frame, text="Keyboard (Scroll Lock toggle)", variable=self.activity_type_var, value="keyboard").pack(anchor="w", padx=20)
        ttk.Radiobutton(settings_frame, text="Both", variable=self.activity_type_var, value="both").pack(anchor="w", padx=20)

        # Options
        self.prevent_sleep_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(settings_frame, text="Prevent system sleep", variable=self.prevent_sleep_var).pack(anchor="w", pady=(10, 0), padx=20)

        self.log_activity_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(settings_frame, text="Log activities", variable=self.log_activity_var).pack(anchor="w", padx=20)

        # Info text
        info_text = ttk.Label(main_frame, text="⚠ Note: This keeps your system active. Teams will show you as 'Available'.",
                             font=("Arial", 9), foreground="blue", wraplength=400, justify="center")
        info_text.pack(pady=10)

    def setup_tray(self):
        """Setup system tray icon (for future enhancement)"""
        pass

    def start_activity(self):
        """Start keeping system active"""
        if self.is_active:
            return

        self.is_active = True
        self.start_btn.config(state="disabled")
        self.stop_btn.config(state="normal")
        self.status_label.config(text="● ACTIVE", foreground="green")

        # Prevent sleep if enabled
        if self.prevent_sleep_var.get():
            self.prevent_sleep()

        # Start monitoring thread
        monitor_thread = threading.Thread(target=self.monitor_loop, daemon=True)
        monitor_thread.start()

        self.log("System keep-active started")

    def stop_activity(self):
        """Stop keeping system active"""
        self.is_active = False
        self.start_btn.config(state="normal")
        self.stop_btn.config(state="disabled")
        self.status_label.config(text="● INACTIVE", foreground="red")
        self.timer_label.config(text="")

        # Allow sleep again if it was disabled
        if self.prevent_sleep_var.get():
            self.allow_sleep()

        self.log("System keep-active stopped")

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
                self.timer_label.config(text=f"Running for: {minutes}m {seconds}s | Activities: {activity_count}")

                # Perform activity
                activity_type = self.activity_type_var.get()

                if activity_type in ["mouse", "both"]:
                    self.simulate_mouse_activity()

                if activity_type in ["keyboard", "both"]:
                    self.simulate_keyboard_activity()

                activity_count += 1

                if self.log_activity_var.get():
                    self.log(f"Activity #{activity_count}: {activity_type}")

                # Sleep until next activity
                time.sleep(interval)

            except Exception as e:
                self.log(f"Error: {str(e)}")
                time.sleep(5)

    def simulate_mouse_activity(self):
        """Simulate subtle mouse movement"""
        try:
            current_pos = pyautogui.position()
            # Move mouse slightly and back
            pyautogui.moveTo(current_pos[0] + 1, current_pos[1] + 1, duration=0.1)
            time.sleep(0.2)
            pyautogui.moveTo(current_pos[0], current_pos[1], duration=0.1)
        except Exception as e:
            print(f"Mouse activity error: {e}")

    def simulate_keyboard_activity(self):
        """Simulate keyboard activity using Scroll Lock toggle"""
        try:
            # Toggle Scroll Lock on and off (doesn't interfere with user input)
            keyboard.press_and_release('scroll lock')
            time.sleep(0.2)
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
            self.log("System sleep prevented")
        except Exception as e:
            print(f"Sleep prevention error: {e}")

    def allow_sleep(self):
        """Allow system to sleep again"""
        try:
            # ES_CONTINUOUS = 0x80000000
            ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
            self.log("System sleep allowed")
        except Exception as e:
            print(f"Allow sleep error: {e}")

    def log(self, message):
        """Log a message"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        self.activity_log.append(log_entry)
        print(log_entry)

    def on_closing(self):
        """Handle window closing"""
        if self.is_active:
            if messagebox.askyesno("Confirm", "Keep-Active is running. Stop before closing?"):
                self.stop_activity()

        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = SystemKeepActive(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()
