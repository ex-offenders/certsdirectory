
let baseURL;
document$.subscribe(() => {
  // init the base URL
  baseURL = window.location.origin + "/";
  loadProviders();
  handleProviderChange(); // Load certifications based on default provider
  fetchCountries();
});


function loadProviders() {
  // Fetch providers from the providers.json file
  fetch(baseURL + "providers.json")
    .then((response) => response.json())
    .then((providers) => {
      const providerSelect = document.getElementById("providerSelect");
      providerSelect.innerHTML = '<option value="">All providers</option>';
      providers.forEach((provider) => {
        const option = document.createElement("option");
        option.value = provider.value;
        option.text = provider.text;
        providerSelect.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching providers:", error));
}

async function handleProviderChange() {
  const providerSelect = document.getElementById("providerSelect").value;
  const certificateSelect = document.getElementById("certSelect");
  const profileSection = document.getElementById("profileSection");

  if (providerSelect !== "") {
    certificateSelect.disabled = false;
    profileSection.innerHTML = "";

    // Fetch certifications based on selected provider
    const certs = await fetchCerts(providerSelect);

    const certSelect = document.getElementById("certSelect");
    certSelect.innerHTML = '<option value="">All Certificates</option>';

    certs.forEach((cert) => {
      const option = document.createElement("option");
      option.value = cert.value;
      option.text = cert.text;
      certSelect.appendChild(option);
    });

    // Fetch profiles for All certificates initially
    fetchProfiles(providerSelect, "");
  } else {
    certificateSelect.disabled = true;
    certificateSelect.value = "";

    // fetch all profiles from profile.json
    fetchAllProfiles();
  }
}

async function fetchCerts(selectedProvider) {
  try {
    // Fetch certifications based on selected provider
    const certs = await fetch(`${baseURL}/information/certs.json`).then((res) =>
      res.json()
    );

    return certs[selectedProvider];
  } catch (error) {
    console.log(`Error fetching certifications: ${error.message}`);
  }
}

function handleCertChange() {
  const providerSelect = document.getElementById("providerSelect").value;
  const certSelect = document.getElementById("certSelect").value;
  const countrySelect = document.getElementById("countrySelect").value;

  fetchProfiles(providerSelect, certSelect, countrySelect);
}

function fetchAllProfiles(country = "") {
  fetch(baseURL + "./people/people.json")
    .then((response) => response.json())
    .then((people) => {
      const randomProfiles = getRandomProfiles(people, 10);
      fetchPeopleProfiles(randomProfiles, country);
    })
    .catch((error) => console.log("Error fetching users", error));
}

function fetchProfiles(provider, cert, countrySelect) {

  // if user tries to fetch with all value for provider
  if (provider === "") {
    fetchAllProfiles(countrySelect);
    return;
  }

  let url = `${baseURL}/certs/${provider}/all.json`;

  fetch(url)
    .then((response) => response.json())
    .then((certOwners) => {
      let profilesToFetch;

      if (cert === "") {
        // fetch all profiles for the provider
        profilesToFetch = Object.values(certOwners).flat();
      } else {
        // fetch profiles for the particular certification
        profilesToFetch = certOwners[cert] || [];
      }

      // convert from set to array to remove duplicates
      profilesToFetch = Array.from(new Set(profilesToFetch));

      if (profilesToFetch.length > 0) {
        fetchPeopleProfiles(profilesToFetch, countrySelect);
      } else {
        document.getElementById("profileSection").innerHTML =
          "<p>No profiles found.</p>";
      }
    })
    .catch((error) => console.error("Error fetching profiles:", error));
}

async function fetchPeopleProfiles(profileFiles, countryFilterValue = "") {
  const profileSection = document.getElementById("profileSection");
  profileSection.innerHTML = ""; // Clear previous profiles

  let profiles = [];

  try {
    const fetchPromises = profileFiles.map(async (file) => {
      return fetch(`${baseURL}/people/${file}`).then((response) =>
        response.json()
      );
    });

    profiles = await Promise.all(fetchPromises);

    // if there is active country filter then filtered all the fetched profiles by it
    if (countryFilterValue !== "") {
      profiles = profiles.filter(
        (profile) => profile.country === countryFilterValue
      );
    }

    // sort the result by name
    profiles.sort((a, b) => a.name.localeCompare(b.name));

    profiles.forEach((profileData) => {
      const profileCard = createProfileCard(profileData);
      profileSection.appendChild(profileCard);
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
  }
}

function getSocialLinkIcon(platform) {
  const socialLinkImages = {
    github: "assets/github.png",
    linkedin: "assets/linkedin.png",
    twitter: "assets/twitter.png",
    default: "assets/default.png", //default image
  };

  return baseURL + (socialLinkImages[platform] || socialLinkImages.default);
}
function createProfileCard(profile) {
  // default profile image path
  const defaultImage = "default.jpg";

  const card = document.createElement("div");
  card.innerHTML = card.classList.add("box");

  card.innerHTML = `
      <div class="box-top">
          <img class="round-image" src="${baseURL}images/${
            profile.profileImageLink || defaultImage
          }" alt="${profile.name} profile">
          <div class="title-flex">
              <h3 class="user-name">${profile.name}</h3>
              <p class="user-gender">${profile.gender}</p>
              <p class="user-work-place">${profile.workPlace}</p>
          </div>
          <div class="social_media_icons">
          ${profile?.socialLinks
            .map(
              (link) =>
                `<a class="social-links" href="${
                  link.link
                }" target="_blank"><img class="social_icon" src="${getSocialLinkIcon(
                  link.platform
                )}" alt="${link.platform}"></a>`
            )
            .join("")}
          </div>
      </div>
    `;

  // add event listener to show the modal with profile information of the user
  card.addEventListener("click", () => showProfileModal(profile));
  return card;
}

async function showProfileModal(profile) {
  const modal = document.getElementById("profileModal");

  modal.querySelector(".profile-pronouns").innerText = "";
  modal.querySelector(".position").innerText = "";
  modal.querySelector(".social-links").innerHTML = "";
  modal.querySelector(".profile-right h2").innerText = "";
  modal.querySelector(".profile-right p").innerText = "";
  modal.querySelector(".location").innerHTML =
    `<img src="${baseURL}/assets/location.png" alt="Location Icon" />`;
  const certListContainer = modal.querySelector(
    ".profile-right .cert-list-container"
  );
  if (certListContainer) {
    certListContainer.remove(); // Remove previous certification container if exists
  }

  modal.querySelector("img.profile-picture").src = `${
    profile.profileImageLink
      ? `${baseURL}/images/${profile.profileImageLink}`
      : `${baseURL}/images/default.jpg`
  }`;
  modal.querySelector(".profile-pronouns").innerText = profile.gender || "";
  modal.querySelector(".position").innerText = profile.position || "";

  const socialLinksContainer = modal.querySelector(".social-links");
  socialLinksContainer.innerHTML = profile.socialLinks
    .map(
      (link) => `
      <a href="${link.link}" target="_blank">
        <img src="${baseURL}/assets/${link.platform}.png" alt="${link.platform}" />
      </a>
    `
    )
    .join("");

  modal.querySelector(".profile-right h2").innerText =
    profile.name || "No Name";
  modal.querySelector(".profile-right p").innerText =
    profile.bio || "No Description";

  const locationContainer = modal.querySelector(".location");
  locationContainer.innerHTML += ` ${profile.country || "No Location"}`;

  // Fetch and display certifications
  getUserCertsLinks(profile.id).then((userCerts) => {
    const certListHTML =
      userCerts.length > 0
        ? userCerts
            .map(
              (cert) => `
          <li>${cert.provider}: <a href="${cert.credlyURL}" target="_blank">${cert.certification}</a></li>
        `
            )
            .join("")
        : "<li>No certifications found for this user.</li>";

    const certListContainer = document.createElement("div");
    certListContainer.classList.add("cert-list-container"); // Add a class to identify it later for clearing
    certListContainer.innerHTML = `
        <h3>Certifications:</h3>
        <ul>${certListHTML}</ul>
      `;
    modal.querySelector(".profile-right").appendChild(certListContainer);
  });

  // Show the modal
  modal.style.display = "flex";

  document.querySelector(".close-btn").addEventListener("click", closeModal);
}

function closeModal() {
  const modal = document.getElementById("profileModal");
  modal.style.display = "none";
}

// fetch profile related certification information
async function getUserCertsLinks(userId) {
  // first get all the available providers
  const providers = await fetch( baseURL + "information/providers.json").then((res) =>
    res.json()
  );

  const userCertifications = [];

  const promises = providers.map(async (provider) => {
    const certOwners = await fetch(`${baseURL}/certs/${provider.value}/all.json`).then(
      (res) => res.json()
    );

    for (const [certification, users] of Object.entries(certOwners)) {
      if (users.includes(`${userId}.json`)) {
        const certDetails = await fetch(
          `${baseURL}/certs/${provider.value}/${certification}/${userId}.json`
        ).then((res) => res.json());

        userCertifications.push({
          provider: provider.text,
          certification: certification,
          credlyURL: certDetails.credlyURL || "#",
        });
      }
    }
  });

  await Promise.all(promises);

  return userCertifications;
}

// fetch countries
async function fetchCountries() {
  const countrySelect = document.getElementById("countrySelect");

  try {
    const countries = await fetch(baseURL + "information/countries.json").then(
      (response) => response.json()
    );

    //sort countries
    countries.sort((a, b) => a.text.localeCompare(b.text));

    //render countries
    countrySelect.innerHTML = '<option value="">All countries</option>';
    countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.value;
      option.text = country.text;
      countrySelect.appendChild(option);
    });
  } catch (error) {
    console.log(`Error fetching countries: ${error.message}`);
  }
}

function handleChangeCountry() {
  const selectedCountry = document.getElementById("countrySelect").value;
  const selectedCert = document.getElementById("certSelect").value;
  const selectedProvider = document.getElementById("providerSelect").value;

  fetchProfiles(selectedProvider, selectedCert, selectedCountry);
}

function resetFilters() {
  document.getElementById("providerSelect").value = "";
  handleProviderChange();
  document.getElementById("certSelect").value = "";
  document.getElementById("countrySelect").value = "";
}

function getRandomProfiles(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
