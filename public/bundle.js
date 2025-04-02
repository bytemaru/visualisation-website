/******/ (() => { // webpackBootstrap
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
const addCanvasWebGLContextLossEventListener = () => {
    const canvases = document.getElementsByTagName("canvas");
    if (canvases.length === 1) {
        const canvas = canvases[0];
        canvas.addEventListener('webglcontextlost', (event) => {
            window.location.reload();
        });
    }
}

const removeCanvasWebGLContextLossEventListener = () => {
    const canvases = document.getElementsByTagName("canvas");
    if (canvases.length === 1) {
        const canvas = canvases[0];
        canvas.removeEventListener('webglcontextlost');
    }
}

const visualistationMenuItem = document.getElementById('visualisation');
const visualisationPopup = document.getElementById('visualisation-popup');
visualisationPopup.style.display = 'none';
visualistationMenuItem.addEventListener("mouseover", () => {
    visualisationPopup.style.display = 'block';
})
visualistationMenuItem.addEventListener("mouseleave", () => {
    visualisationPopup.style.display = 'none';
})

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGFkZENhbnZhc1dlYkdMQ29udGV4dExvc3NFdmVudExpc3RlbmVyID0gKCkgPT4ge1xuICAgIGNvbnN0IGNhbnZhc2VzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJjYW52YXNcIik7XG4gICAgaWYgKGNhbnZhc2VzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBjb25zdCBjYW52YXMgPSBjYW52YXNlc1swXTtcbiAgICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmdsY29udGV4dGxvc3QnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jb25zdCByZW1vdmVDYW52YXNXZWJHTENvbnRleHRMb3NzRXZlbnRMaXN0ZW5lciA9ICgpID0+IHtcbiAgICBjb25zdCBjYW52YXNlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiY2FudmFzXCIpO1xuICAgIGlmIChjYW52YXNlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgY29uc3QgY2FudmFzID0gY2FudmFzZXNbMF07XG4gICAgICAgIGNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCd3ZWJnbGNvbnRleHRsb3N0Jyk7XG4gICAgfVxufVxuXG5jb25zdCB2aXN1YWxpc3RhdGlvbk1lbnVJdGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGlzYXRpb24nKTtcbmNvbnN0IHZpc3VhbGlzYXRpb25Qb3B1cCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aXN1YWxpc2F0aW9uLXBvcHVwJyk7XG52aXN1YWxpc2F0aW9uUG9wdXAuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbnZpc3VhbGlzdGF0aW9uTWVudUl0ZW0uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCAoKSA9PiB7XG4gICAgdmlzdWFsaXNhdGlvblBvcHVwLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xufSlcbnZpc3VhbGlzdGF0aW9uTWVudUl0ZW0uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCkgPT4ge1xuICAgIHZpc3VhbGlzYXRpb25Qb3B1cC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xufSlcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==