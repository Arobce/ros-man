// const flowbite = require('flowbite');
import axios from "axios";
import prettyBytes from "pretty-bytes";
import setupEditors from "./setupEditor";

const form = document.querySelector("[data-form]");

const queryParamsContainer = document.querySelector("[data-query-params]");
const requestHeadersContainer = document.querySelector(
  "[data-request-headers]"
);
const keyValueTemplate = document.querySelector("[data-key-value-template]");

// Result ontainers
const responseHeadersContainer = document.querySelector(
  "[data-response-headers]"
);

// Editors
const { requestEditor, updateResponseEditor } = setupEditors();

queryParamsContainer.append(createKeyValuePair());
requestHeadersContainer.append(createKeyValuePair());

// Add query param button
document
  .querySelector("[data-add-query-param-btn]")
  .addEventListener("click", (event) => {
    queryParamsContainer.append(createKeyValuePair());
  });

// Add request header button
document
  .querySelector("[data-add-request-header-param-btn]")
  .addEventListener("click", (event) => {
    requestHeadersContainer.append(createKeyValuePair());
  });

//   For tracking total time
axios.interceptors.request.use((request) => {
  request.customData = request.customData || {};
  request.customData.startTime = new Date().getTime();

  return request;
});

axios.interceptors.response.use(updateEndTime, (e) => {
  return Promise.reject(updateEndTime(e.response));
});

function updateEndTime(response) {
  response.customData = response.customData || {};
  response.customData.time =
    new Date().getTime() - response.config.customData.startTime;

  return response;
}

// On form submit
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  //   JSON data
  let jsonData;

  try {
    jsonData = JSON.parse(requestEditor.state.doc.toString() || null);
  } catch (e) {
    alert("NO json");
    return;
  }

  const url = document.querySelector("[data-url]").value;
  const method = document.querySelector("[data-method]").value;

  axios({
    url,
    method,
    params: getKeyValuePairsToObjects(queryParamsContainer),
    headers: getKeyValuePairsToObjects(requestHeadersContainer),
    data: jsonData,
  })
    .catch((e) => e)
    .then((response) => {
      console.log(response);

      showAndPopulatResults(response);
    });
});

function showAndPopulatResults(response) {
  const responseSection = document.querySelector("[data-response-section]");
  responseSection.classList.remove("hidden");

  updateResponseHeaders(response.headers);
  updateResponseDetails(response);
  updateResponseEditor(response.data);
}

function updateResponseDetails(responseDetails) {
  document.querySelector("[data-status]").textContent = responseDetails.status;
  document.querySelector("[data-time]").textContent =
    responseDetails.customData.time;
  document.querySelector("[data-size]").textContent = prettyBytes(
    JSON.stringify(responseDetails.data).length +
      JSON.stringify(responseDetails.headers).length
  );
}

function updateResponseHeaders(responseHeaders) {
  responseHeadersContainer.innerHTML = "";

  Object.entries(responseHeaders).forEach(([key, value]) => {
    const keyElement = document.createElement("div");
    const valueElement = document.createElement("div");

    keyElement.textContent = key;
    valueElement.textContent = value;

    responseHeadersContainer.append(keyElement, valueElement);
  });
}

function getKeyValuePairsToObjects(keyValuePairsContainer) {
  const keyValuePairs = [
    ...keyValuePairsContainer.querySelectorAll("[data-key-value-pair]"),
  ];

  return keyValuePairs.reduce((keyValueObj, keyValue) => {
    const key = keyValue.querySelector("[data-key]").value;
    const value = keyValue.querySelector("[data-value]").value;

    if (key === "") return keyValueObj;

    return { ...keyValueObj, [key]: value };
  }, {});
}

/**
 * Creates a new key-value pair element.
 * @returns {Element} The created key-value pair element.
 */
function createKeyValuePair() {
  // Clone the template element
  const element = keyValueTemplate.content.cloneNode(true);

  // Add a click event listener to the remove button
  element
    .querySelector("[data-remove-btn]")
    .addEventListener("click", (event) => {
      // Remove the closest element with the data-key-value-pair attribute
      event.target.closest("[data-key-value-pair]").remove();
    });

  // Return the created element
  return element;
}
