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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBLENBQUMsQyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBhZGRDYW52YXNXZWJHTENvbnRleHRMb3NzRXZlbnRMaXN0ZW5lciA9ICgpID0+IHtcbiAgICBjb25zdCBjYW52YXNlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiY2FudmFzXCIpO1xuICAgIGlmIChjYW52YXNlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgY29uc3QgY2FudmFzID0gY2FudmFzZXNbMF07XG4gICAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd3ZWJnbGNvbnRleHRsb3N0JywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuY29uc3QgcmVtb3ZlQ2FudmFzV2ViR0xDb250ZXh0TG9zc0V2ZW50TGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgY29uc3QgY2FudmFzZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImNhbnZhc1wiKTtcbiAgICBpZiAoY2FudmFzZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IGNhbnZhc2VzWzBdO1xuICAgICAgICBjYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2ViZ2xjb250ZXh0bG9zdCcpO1xuICAgIH1cbn1cblxuY29uc3QgdmlzdWFsaXN0YXRpb25NZW51SXRlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aXN1YWxpc2F0aW9uJyk7XG5jb25zdCB2aXN1YWxpc2F0aW9uUG9wdXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXNhdGlvbi1wb3B1cCcpO1xudmlzdWFsaXNhdGlvblBvcHVwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG52aXN1YWxpc3RhdGlvbk1lbnVJdGVtLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW92ZXJcIiwgKCkgPT4ge1xuICAgIHZpc3VhbGlzYXRpb25Qb3B1cC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbn0pXG52aXN1YWxpc3RhdGlvbk1lbnVJdGVtLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpID0+IHtcbiAgICB2aXN1YWxpc2F0aW9uUG9wdXAuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbn0pIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9