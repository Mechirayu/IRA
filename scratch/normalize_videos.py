import os
import glob
from moviepy import VideoFileClip

files = glob.glob("public/video-snaps/*.mp4")
for file in files:
    filename = os.path.basename(file)
    print(f"Processing {filename}...")
    
    clip = VideoFileClip(file)
    clip.write_videofile("temp_" + filename, logger=None, audio_codec="aac")
    clip.close()
    
    os.replace("temp_" + filename, file)
print("Done!")

