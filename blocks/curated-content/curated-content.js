// import Swiper from "../swiper/swiper-bundle.js";

// let swiperInstance = null;

// function initSwiper(wrapper, block) {
//   // Prevent re-initialization
//   if (wrapper.classList.contains("swiper-initialized")) return;

//   // Get all slide elements
//   const slideElements = [...block.children];

//   // Add necessary classes to existing elements
//   wrapper.classList.add("swiper");
//   block.classList.add("swiper-wrapper");

//   // Add swiper-slide class to each child div
//   slideElements.forEach((slide) => {
//     slide.classList.add("swiper-slide");
//   });

//   // Initialize Swiper with the specified configuration
//   swiperInstance = new Swiper(wrapper, {
//     slidesPerView: 1.1,
//     grabCursor: true,
//     touchEventsTarget: "container",
//     touchRatio: 1,
//     simulateTouch: true,
//     spaceBetween: 16,
//     breakpoints: {
//       768: {
//         slidesPerView: 3, // desktop
//         spaceBetween: 16,
//       },
//       1024: {
//         slidesPerView: 3,
//         spaceBetween: 16,
//       },
//       1440: {
//         slidesPerView: 3,
//         spaceBetween: 16,
//       },
//     },
//   });

//   wrapper.classList.add("swiper-initialized");
// }

// export default function decorate(block) {
//   // Find the wrapper (parent of block)
//   const wrapper = block.parentElement;

//   if (wrapper && wrapper.classList.contains("curated-content-wrapper")) {
//     // Find the section container
//     const section = wrapper.parentElement;
//     if (section && section.classList.contains("curated-content-container")) {
//       // Create inner wrapper div
//       const innerWrapper = document.createElement("div");
//       innerWrapper.classList.add("curated-content-inner-wrapper");
      
//       // Move all children of section into the inner wrapper
//       while (section.firstChild) {
//         innerWrapper.appendChild(section.firstChild);
//       }
      
//       // Append the inner wrapper back to the section
//       section.appendChild(innerWrapper);
//     }
    
//     // Initialize swiper
//     initSwiper(wrapper, block);

//     // Reinitialize on window resize if needed
//     let resizeTimeout;
//     window.addEventListener("resize", () => {
//       clearTimeout(resizeTimeout);
//       resizeTimeout = setTimeout(() => {
//         const slideElements = [...block.children];
//         const isDesktop = window.innerWidth >= 768;

//         // If swiper is initialized but shouldn't be (desktop with <= 3 slides)
//         if (
//           wrapper.classList.contains("swiper-initialized") &&
//           isDesktop &&
//           slideElements.length <= 3
//         ) {
//           if (swiperInstance) {
//             swiperInstance.destroy(true, true);
//             swiperInstance = null;
//           }
//           wrapper.classList.remove("swiper", "swiper-initialized");
//           block.classList.remove("swiper-wrapper");
//           slideElements.forEach((slide) => {
//             slide.classList.remove("swiper-slide");
//           });
//         }
//         // If swiper is not initialized but should be
//         else if (!wrapper.classList.contains("swiper-initialized")) {
//           initSwiper(wrapper, block);
//         }
//       }, 250);
//     });
//   }
// }
