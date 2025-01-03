import { loadConnectAndInitialize } from "@stripe/connect-js";

const instance = loadConnectAndInitialize({
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  fetchClientSecret: async () => {
    try {
      const response = await fetch(
        `${window.location.origin}/api/account_session`,
        { method: "POST" }
      );

      const app = document.querySelector("#app");
      const loading = document.querySelector("#loading");

      if (response.status === 401) {
        window.location.href = process.env.AUTH_URL;
        removeLoading = false;
        return;
      }

      if (!response?.ok) {
        throw new Error("Failed to fetch client secret");
      }

      const { client_secret: clientSecret } = await response.json();

      app.removeAttribute("hidden");
      loading.remove();

      return clientSecret;
    } catch {
      console.error("Error fetching client secret");
      console.log("message-el", document.querySelector("#loading-message"))
      document.querySelector("#loading-message").textContent =
        "Something went wrong. Please try again later.";

      return null;
    }
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
      cssSrc:
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
    },
  ],
});

const container = document.getElementById("container");

const renderComponent = async (componentType) => {
  container.innerHTML = ""; // Clear the container
  const component = instance.create(componentType);
  container.appendChild(component);
};

const allLinks = document.querySelectorAll("#navigation a");

allLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const componentType = link.dataset.component;
    allLinks.forEach((link) => {
      link.classList.remove("active");
    });
    link.classList.add("active");
    renderComponent(componentType);
  });
});

// Initialize with the default component
renderComponent("payments");
