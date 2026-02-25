/**
 * Intersection Observer Utility
 * Handles fade-in animations on scroll
 */

export default function checkIntersection(selector) {
  const elements = document.querySelectorAll(selector);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
  });

  elements.forEach((el) => observer.observe(el));
}
