window.flashUpdate = function (elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.classList.add('text-green-400', 'scale-110');
        setTimeout(() => el.classList.remove('text-green-400', 'scale-110'), 200);
    }
}
