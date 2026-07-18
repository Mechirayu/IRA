import os, re
# style.css update
css_path = "style.css"
with open(css_path, "r") as f:
    css = f.read()

# Add video-frame classes to end of style.css
css += """
.video-frame {
    position: relative;
    background: #fff;
    padding: 6px;
    border-radius: 8px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.6);
}
.video-frame.landscape {
    aspect-ratio: 16/9;
    width: min(92vw, 900px);
}
.video-frame.portrait {
    aspect-ratio: 9/16;
    width: min(92vw, 430px);
}
.video-frame video, .video-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
    background: #000;
}
"""
with open(css_path, "w") as f:
    f.write(css)

# memories_v3.js update
js_path = "public/memories_v3.js"
with open(js_path, "r", encoding="utf-8") as f:
    js = f.read()

# Replace MediaManager
new_manager = """const MediaManager = {
    cache: new Map(),
    pending: new Map(),
    
    init: function() {
        console.log("MediaManager: Aggressive background preload started.");
        const promises = [];
        for (let i = 1; i <= Object.keys(MEMORY_CONFIG).length; i++) {
            promises.push(this.preloadMedia(i));
        }
        Promise.all(promises).then(() => console.log("All media preloaded successfully."));
    },
    
    preloadMedia: function(indexOrKey) {
        const memoryKey = typeof indexOrKey === "number" ? indexOrKey : (indexOrKey + 1);
        const memory = MEMORY_CONFIG[memoryKey];
        const id = memory.video || memory.image;
        
        if (this.cache.has(id) || this.pending.has(id)) return this.pending.get(id) || Promise.resolve(this.cache.get(id));
        
        const loadPromise = new Promise(async (resolve, reject) => {
            const isVid = !!memory.video;
            try {
                const response = await fetch(id);
                if (!response.ok) throw new Error("HTTP " + response.status);
                const blob = await response.blob();
                const cachedURL = URL.createObjectURL(blob);
                
                const result = { 
                    src: cachedURL, 
                    isVid: isVid,
                    frame: memory.frame
                };
                this.cache.set(id, result);
                this.pending.delete(id);
                resolve(result);
            } catch (e) {
                this.pending.delete(id);
                reject(e);
            }
        });
        
        this.pending.set(id, loadPromise);
        return loadPromise;
    },
    
    getMedia: async function(indexOrKey) {
        const memoryKey = typeof indexOrKey === "number" && indexOrKey < 18 ? indexOrKey + 1 : indexOrKey;
        const memory = MEMORY_CONFIG[memoryKey];
        const id = memory.video || memory.image;
        
        if (this.cache.has(id)) return this.cache.get(id);
        
        const forceOpen = () => {
            console.warn(`MediaManager: Timeout/Error waiting for ${id}. Forcing open.`);
            const isVid = !!memory.video;
            const result = { 
                src: id, 
                isVid: isVid,
                frame: memory.frame
            };
            this.cache.set(id, result);
            return result;
        };

        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(forceOpen()), 4000));
        let loadPromise = this.pending.get(id) || this.preloadMedia(indexOrKey);
        
        loadPromise = loadPromise.catch(e => {
            console.error("MediaManager: preload failed", e);
            return forceOpen();
        });
        
        return Promise.race([loadPromise, timeoutPromise]);
    }
};"""

js = re.sub(r"const MediaManager = \{.*?\n\};\n", new_manager + "\n", js, flags=re.DOTALL)

# Update openPolaroidStrict to use blob src and clean up old displayNode logic
new_open = """function openPolaroidStrict(mediaObj, envElement, index, cloneElement, originalRot) {
    const modalRoot = document.getElementById("modal-root") || document.body;
    const backdrop = document.getElementById("polaroidBackdrop");
    
    const polaroidWrapper = document.createElement("div");
    const isVid = mediaObj.isVid;
    const orientationClass = mediaObj.frame;
    
    polaroidWrapper.className = "desk-polaroid-wrapper is-open";
    polaroidWrapper.innerHTML = `
        <div class="video-frame ${orientationClass}">
        </div>
    `;
    
    const frame = polaroidWrapper.querySelector(".video-frame");
    let displayNode;
    
    if (isVid) {
        displayNode = document.createElement("video");
        displayNode.preload = "auto";
        displayNode.playsInline = true;
        displayNode.muted = true;
        displayNode.src = mediaObj.src;
    } else {
        displayNode = new Image();
        displayNode.src = mediaObj.src;
    }
    
    frame.appendChild(displayNode);
    
    document.body.classList.add("is-paused-background");
    
    if (isVid) {
        const playPromise = displayNode.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log("Autoplay prevented, fallback to controls:", e);
                displayNode.controls = true;
            });
        }
    }
    
    gsap.set(polaroidWrapper, { opacity: 0, scale: 0.8 });
    modalRoot.appendChild(polaroidWrapper);
    
    gsap.to(cloneElement, { opacity: 0, duration: 0.2 });
    gsap.to(polaroidWrapper, { opacity: 1, scale: 0.9, duration: 0.3, ease: "back.out(1.2)" });
    
    if (!isVid) playSnapSound();
    
    const closeIt = () => {
        document.body.classList.remove("is-paused-background");
        backdrop.style.opacity = "0";
        backdrop.style.pointerEvents = "none";
        
        gsap.to(polaroidWrapper, { 
            opacity: 0, 
            scale: 0.8, 
            duration: 0.2, 
            onComplete: () => {
                if (isVid) {
                    displayNode.pause();
                    displayNode.src = ""; // Clean up
                    displayNode.load();
                    displayNode.remove();
                }
                polaroidWrapper.remove();
                
                gsap.set(cloneElement, { opacity: 1 });
                gsap.to(cloneElement, {
                    x: 0, 
                    y: 0,
                    scale: 1,
                    rotation: originalRot,
                    duration: 0.4,
                    ease: "power2.out",
                    onComplete: () => {
                        EnvelopeClonePool.release(cloneElement);
                        envElement.classList.remove("is-opening");
                        envElement.isAnimating = false;
                        window.activePolaroid = false;
                        checkAllOpened();
                    }
                });
            }
        });
    };
    
    polaroidWrapper.onclick = (e) => {
        e.stopPropagation();
        closeIt();
    };
    backdrop.onclick = closeIt;
}"""

js = re.sub(r"function openPolaroidStrict\([^\{]+\{.*?\n\}\n", new_open + "\n", js, flags=re.DOTALL)

# Ensure no desk-polaroid-inner is being used if I replaced it
js = js.replace(".desk-polaroid-inner", ".desk-polaroid-wrapper")

with open(js_path, "w", encoding="utf-8") as f:
    f.write(js)

