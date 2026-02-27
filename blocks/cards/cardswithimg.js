import swiper from 'swiper/swiper-bundle.min.js';
export default function decoratecardwithimgs(block) {
    debugger
  const slides = Array.from(block.children);
  slides.forEach((el) => {
    el.classList.add("swiper-slide");
  });
}