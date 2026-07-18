function initScrapbook() {
    if (window.scrapbookInitialized) return;
    window.scrapbookInitialized = true;

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    const items = document.querySelectorAll('.scrapbook-item');
    
    items.forEach((item) => {
        gsap.fromTo(item, 
            {
                opacity: 0,
                y: 80,
                rotation: (Math.random() * 4) - 2
            }, 
            {
                opacity: 1,
                y: 0,
                rotation: (Math.random() * 8) - 4,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: item,
                    scroller: "#scrapbookPage",
                    start: "top 85%", 
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
}
