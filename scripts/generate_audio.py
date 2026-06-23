import wave
import struct
import math
import random
import os

sample_rate = 44100

def ensure_dir(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)

def generate_departure_beep(filename):
    print(f"Generating departure beep to {filename}...")
    ensure_dir(filename)
    with wave.open(filename, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sample_rate)
        
        # Beep 1: 0.18s of 550Hz sine
        for i in range(int(0.18 * sample_rate)):
            val = math.sin(2.0 * math.pi * 550 * (i / sample_rate))
            # Apply fade in and out to prevent clipping click
            envelope = 1.0
            if i < 200: envelope = i / 200
            elif i > int(0.18 * sample_rate) - 200: envelope = (int(0.18 * sample_rate) - i) / 200
            w.writeframes(struct.pack('<h', int(val * 0.25 * envelope * 32767)))
            
        # Silence: 0.08s
        for i in range(int(0.08 * sample_rate)):
            w.writeframes(struct.pack('<h', 0))
            
        # Beep 2: 0.18s of 550Hz sine
        for i in range(int(0.18 * sample_rate)):
            val = math.sin(2.0 * math.pi * 550 * (i / sample_rate))
            envelope = 1.0
            if i < 200: envelope = i / 200
            elif i > int(0.18 * sample_rate) - 200: envelope = (int(0.18 * sample_rate) - i) / 200
            w.writeframes(struct.pack('<h', int(val * 0.25 * envelope * 32767)))

def generate_rolling_loop(filename):
    print(f"Generating rolling loop to {filename}...")
    ensure_dir(filename)
    
    # We will generate a 2.4 second looping track of rhythmic low rumble "click-clack"
    # A click-clack group occurs every 0.6 seconds (4 groups in 2.4s)
    # Each click-clack group consists of:
    # - primary click: t = 0
    # - secondary click: t = 0.15s
    # - background low frequency rumble
    duration = 2.4
    num_samples = int(duration * sample_rate)
    
    with wave.open(filename, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sample_rate)
        
        # Simple low pass filter state
        lp = 0.0
        alpha = 0.08 # filter coefficient for low pass rumble
        
        lp_click = 0.0
        alpha_click = 0.25 # filter coefficient for click sound
        
        for i in range(num_samples):
            t = i / sample_rate
            
            # Base rumble (low frequency random noise)
            noise = random.uniform(-1, 1)
            lp = lp + alpha * (noise - lp)
            rumble = lp * 0.15
            
            # Add rhythmic rail clicks ("click-clack")
            # Loop period: 0.6 seconds
            t_period = t % 0.6
            
            click_amplitude = 0.0
            
            # First joint hit (wheels of bogie 1)
            if 0 <= t_period < 0.08:
                # rapid decaying noise burst
                decay = math.exp(-t_period * 120)
                click_noise = random.uniform(-1, 1)
                lp_click = lp_click + alpha_click * (click_noise - lp_click)
                click_amplitude += lp_click * 0.35 * decay
                
            # Second joint hit (wheels of bogie 2, 0.12s later)
            if 0.12 <= t_period < 0.20:
                dt = t_period - 0.12
                decay = math.exp(-dt * 120)
                click_noise = random.uniform(-1, 1)
                lp_click = lp_click + alpha_click * (click_noise - lp_click)
                click_amplitude += lp_click * 0.22 * decay # slightly softer
                
            # Third joint hit (connector / trailing wheels, 0.35s later)
            if 0.35 <= t_period < 0.43:
                dt = t_period - 0.35
                decay = math.exp(-dt * 120)
                click_noise = random.uniform(-1, 1)
                lp_click = lp_click + alpha_click * (click_noise - lp_click)
                click_amplitude += lp_click * 0.18 * decay
                
            total_val = rumble + click_amplitude
            # Hard limit to prevent clipping
            total_val = max(-1.0, min(1.0, total_val))
            
            # Soft fade-in and fade-out at the absolute edges of the 2.4s file to ensure seamless looping
            edge_fade = 1.0
            fade_samples = 4000
            if i < fade_samples:
                edge_fade = i / fade_samples
            elif i > num_samples - fade_samples:
                edge_fade = (num_samples - i) / fade_samples
                
            w.writeframes(struct.pack('<h', int(total_val * edge_fade * 0.35 * 32767)))

if __name__ == "__main__":
    generate_departure_beep("apps/web/public/audio/metro-departure.mp3")
    generate_rolling_loop("apps/web/public/audio/metro-rolling-loop.mp3")
    print("Audio assets generated successfully!")
