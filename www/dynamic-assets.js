document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
  fetch('./dynamic_assets.json')
    .then((response) => response.json())
    .then((dynamicAssets) => {
      dynamicAssets.scripts.forEach(function (script) {
        const scriptEl = document.createElement('script');
        fetch(script.url)
          .then((res) => res.text())
          .then((data) => {
            localStorage.setItem(script.js_name, data);
            scriptEl.text = data;
            document.body.appendChild(script);
          })
          .catch(() => {
            if (localStorage.getItem(script.js_name)) {
              scriptEl.text = localStorage.getItem(script.js_name);
            } else {
              scriptEl.src = `./dynamic/${script.js_name}`;
            }
            document.body.appendChild(script);
          });
      });

      dynamicAssets.styles.forEach(function (style) {
        const link = document.createElement('link');
        fetch(style.url)
          .then((res) => res.text())
          .then((data) => {
            localStorage.setItem(style.name, data);
            link.rel = 'stylesheet';
            link.href = 'data:text/css;base64,' + btoa(data);
            document.head.appendChild(link);
          })
          .catch(() => {
            if (localStorage.getItem(style.name)) {
              link.rel = 'stylesheet';
              link.href = 'data:text/css;base64,' + btoa(unescape(encodeURIComponent(localStorage.getItem(style.name))));
            } else {
              link.rel = 'stylesheet';
              link.href = `./dynamic/${style.name}`;
            }
            document.head.appendChild(link);
          });
      });
    });
}
