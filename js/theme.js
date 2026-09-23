/* Resolve the saved preference before paint. Storage is optional. */
(function () {
  try {
    var theme = localStorage.getItem("siteon-theme");
    if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
  } catch (_) { /* Keep the original dark default. */ }
})();
