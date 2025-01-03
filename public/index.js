import { loadConnectAndInitialize } from "@stripe/connect-js";

// Utility function to extract query parameters
const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

const instance = loadConnectAndInitialize({
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  fetchClientSecret: async () => {
    // Get the token from the query string
    const token = getQueryParam("token");
    if (!token) {
      console.error("Token is missing in the URL query parameters.");
      document.querySelector("#container").setAttribute("hidden", "");
      document.querySelector("#error").removeAttribute("hidden");
      return undefined;
    }

    // Pass the token to the API endpoint
    const response = await fetch(
      `${window.location.origin}/api/account_session?token=${encodeURIComponent(token)}`,
      { method: "GET" }
    );

    if (!response.ok) {
      const { error } = await response.json();
      document.querySelector("#container").setAttribute("hidden", "");
      document.querySelector("#error").removeAttribute("hidden");
      console.error("Error fetching client secret:", error);
      return undefined;
    }

    const { client_secret: clientSecret } = await response.json();
    document.querySelector("#container").removeAttribute("hidden");
    document.querySelector("#error").setAttribute("hidden", "");
    return clientSecret;
  },
  appearance: {
    overlays: "dialog",
    variables: {
      colorPrimary: "#0070f3",
      colorBackground: "#ffffff",
      colorText: "#333333",
      colorDanger: "#e02020",
      spacingUnit: "8px",
      borderRadius: "4px",
    },
  },
  fonts: [
    {
      cssSrc: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
    },
  ],
});

const container = document.getElementById("container");

const renderComponent = async (componentType) => {
  container.innerHTML = ""; // Clear the container
  const component = instance.create(componentType);
  container.appendChild(component);
};

document.querySelectorAll("#navigation a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const componentType = link.dataset.component;
    renderComponent(componentType);
  });
});

// Initialize with the default component
renderComponent("payments");