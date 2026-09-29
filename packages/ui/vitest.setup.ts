import "@testing-library/jest-dom/vitest";

// jsdom lacks the layout APIs Radix's popper and tooltip touch. Stubs only —
// no test depends on real geometry.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView ??= function () {};
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.releasePointerCapture ??= () => {};
// input-otp calls this from a timer, so a missing implementation surfaces as
// an unhandled error after the test that triggered it has already passed.
document.elementFromPoint ??= () => null;
