const appId = "";
(async () => {
  const latestLocalization = await getAppStoreVersionLocalizations(0);
  const previousLocalization = await getAppStoreVersionLocalizations(1);
  const latestLocalization2 = { ...latestLocalization };
  for (const key in latestLocalization2) {
    latestLocalization2[key] = getValueByLocale({
      locale: latestLocalization2[key].attributes.locale,
      localization: previousLocalization,
    });
    const { id, type, attributes } = latestLocalization2[key];
    const { whatsNew } = attributes;
    latestLocalization2[key] = {
      id: key,
      type,
      attributes: {
        whatsNew,
      },
    };
  }
  console.log(latestLocalization2);
  for (const key in latestLocalization2) {
    const url = `https://appstoreconnect.apple.com/iris/v1/appStoreVersionLocalizations/${key}`;
    await fetch(url, {
      method: "PATCH",
      body: JSON.stringify({ data: latestLocalization2[key] }),
      headers: {
        "x-csrf-itc": "[asc-ui]",
        accept: "application/vnd.api+json",
        "content-type": "application/vnd.api+json",
      },
    })
      .then((response) => response.json())
      .then(console.log)
      .catch(console.log);
  }
})();

async function getAppStoreVersionLocalizations(i) {
  return Promise.resolve()
    .then(() => {
      const url = `https://appstoreconnect.apple.com/iris/v1/apps/${appId}?include=appStoreVersions&limit[appStoreVersions]=2`;
      return fetch(url)
        .then((response) => response.json())
        .then((data) => {
          return data.included.map((v) => v.id);
        });
    })
    .then((versionIds) => {
      const versionId = versionIds[i];
      const url = `https://appstoreconnect.apple.com/iris/v1/appStoreVersionLocalizations?include=appScreenshotSets,appPreviewSets&filter[appStoreVersion]=${versionId}`;
      return fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const locales = {};
          for (const item of data.data) {
            locales[item.id] = item;
          }
          return locales;
        });
    })
    .catch(console.log);
}

function getValueByLocale({ locale, localization }) {
  for (const key in localization) {
    if (localization[key].attributes.locale === locale) {
      return localization[key];
    }
  }
}
