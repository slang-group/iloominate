chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('../chrome-app/index.html', {
    'bounds': {
      'width': 400,
      'height': 500
    }
  });
});