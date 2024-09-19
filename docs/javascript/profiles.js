let baseURL;
document$.subscribe(() => {
  // init the base URL
  baseURL = window.location.origin + "/";
  fetchCountries();
  initializeSearchableSelects();
  loadProviders();
  handleProviderChange(); // Load certifications based on default provider
});

function initializeSearchableSelects() {
  const selectWrappers = document.querySelectorAll(".wrapper");

  selectWrappers.forEach((wrapper) => {
    const selectType = wrapper.getAttribute("data-type");
    const selectBtn = wrapper.querySelector(".select-btn");
    const searchInp = wrapper.querySelector("input");
    const optionsList = wrapper.querySelector(".options");

    // Handle the toggle of the dropdown
    selectBtn.addEventListener("click", () => {
      closeOpenedWrappers(wrapper);
      // add active class list to relevant wrapper
      wrapper.classList.toggle("active");
    });

    // Search functionality within the dropdown
    searchInp.addEventListener("keyup", () => {
      filterOptions(selectType, searchInp.value, optionsList);
    });
  });
}

function closeOpenedWrappers() {
  const selectWrappers = document.querySelectorAll(".wrapper");

  selectWrappers.forEach((wrapper) => {
    if (wrapper.classList.contains("active")) {
      wrapper.classList.remove("active");
    }
  });
}
function filterOptions(selectType, searchValue, optionsList) {
  const items = optionsList.querySelectorAll("li");
  const searchText = searchValue.toLowerCase();

  let found = false;
  items.forEach((item) => {
    const text = item.innerText.toLowerCase();
    if (text.startsWith(searchText)) {
      item.style.display = "";
      found = true;
    } else {
      item.style.display = "none";
    }
  });

  let notFoundItem = optionsList.querySelector(".not-found");
  if (!found) {
    if (!notFoundItem) {
      notFoundItem = document.createElement("li");
      notFoundItem.classList.add("not-found");
      notFoundItem.innerText = "No results found";
      optionsList.appendChild(notFoundItem);
    }
    notFoundItem.style.display = "";
  } else if (notFoundItem) {
    notFoundItem.style.display = "none";
  }
}

function loadProviders() {
  // Fetch providers from the providers.json file
  fetch(baseURL + "information/providers.json")
    .then((response) => response.json())
    .then((providers) => {
      const providerSelectOptions = document.querySelector(
        ".wrapper[data-type='providers'] .options"
      );

      const defaultValue =
        '<li data-value="" onclick="handleProviderChange(this)" >All providers</li>';
      providerSelectOptions.insertAdjacentHTML("beforeend", defaultValue);

      providers.forEach((provider) => {
        const li = document.createElement("li");
        li.innerHTML = provider.text;
        li.setAttribute("data-value", provider.value);
        li.onclick = () => handleProviderChange(li);
        providerSelectOptions.appendChild(li);
      });
    })
    .catch((error) => console.error("Error fetching providers:", error));
}

async function handleProviderChange(selectedValue) {
  const providerSelectBtn = document.querySelector(
    ".wrapper[data-type='providers']"
  );
  const providerInputBox = document.querySelector(
    ".wrapper[data-type='providers'] input"
  );
  const providerSelect = document.querySelector(
    ".wrapper[data-type='providers'] .select-btn span"
  );
  const certificateSelect = document.querySelector(
    ".wrapper[data-type='certifications'] .select-btn"
  );
  const certificateOption = document.querySelector(
    ".wrapper[data-type='certifications'] .options"
  );
  const countrySelectSpan = document.querySelector(
    ".wrapper[data-type='countries'] .select-btn span"
  );
  // clear input box
  providerInputBox.value = "";

  const profileSection = document.getElementById("profileSection");

  if (selectedValue && selectedValue.getAttribute("data-value")) {
    certificateSelect.classList.remove("disabled");
    // remove existing li tags
    certificateOption.innerHTML = "";
    profileSection.innerHTML = "";

    // change provider
    providerSelect.innerHTML = selectedValue.innerHTML;
    providerSelect.setAttribute(
      "data-value",
      selectedValue.getAttribute("data-value")
    );

    // Fetch certifications based on selected provider
    const certs = await fetchCerts(providerSelect.getAttribute("data-value"));

    const certificationSelectOptions = document.querySelector(
      ".wrapper[data-type='certifications'] .options"
    );

    //insert default value
    const defaultValue =
      '<li data-value="" onclick="handleCertChange(this)">All Certifications</li>';
    certificationSelectOptions.insertAdjacentHTML("beforeend", defaultValue);

    certs.forEach((cert) => {
      const li = document.createElement("li");
      li.innerHTML = cert.text;
      li.setAttribute("data-value", cert.value);
      li.onclick = () => handleCertChange(li);
      certificationSelectOptions.appendChild(li);
    });

    // set the default certificates as All certificates
    const certificateSelectSpan = certificateSelect.querySelector("span");
    certificateSelectSpan.innerHTML = "All certificates";
    certificateSelectSpan.setAttribute("data-value", "");

    // Fetch profiles for All certificates initially
    fetchProfiles(
      providerSelect.innerHTML,
      certificateSelectSpan.getAttribute("data-value"),
      countrySelectSpan.getAttribute("data-value")
    );
  } else {
    certificateSelect.classList.add("disabled");
    providerSelect.innerHTML = "All providers";
    providerSelect.setAttribute("data-value", "");

    // fetch all profiles from profile.json
    fetchAllProfiles(countrySelectSpan.getAttribute("data-value") || "");
  }

  // close provider menu
  providerSelectBtn.classList.remove("active");
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

function handleCertChange(selectedCert) {
  // const providerSelect = document.getElementById("providerSelect").value;
  // const certSelect = document.getElementById("certSelect").value;
  // const countrySelect = document.getElementById("countrySelect").value;
  const certificationBtn = document.querySelector(
    ".wrapper[data-type='certifications']"
  );
  const certificateSelect = document.querySelector(
    ".wrapper[data-type='certifications'] .select-btn span"
  );
  const providerSelect = document.querySelector(
    ".wrapper[data-type='providers'] .select-btn span"
  );
  const countrySelect = document.querySelector(
    ".wrapper[data-type='countries'] .select-btn span"
  );

  // update select box
  certificateSelect.innerHTML = selectedCert.innerHTML;
  certificateSelect.setAttribute(
    "data-value",
    selectedCert.getAttribute("data-value")
  );

  const certificateValue = certificateSelect.getAttribute("data-value");
  const providerValue = providerSelect.getAttribute("data-value");
  const countryValue = countrySelect.getAttribute("data-value");
  // fetchProfiles(providerSelect, certSelect, countrySelect);
  fetchProfiles(providerValue, certificateValue, countryValue);

  // close certification Menu
  certificationBtn.classList.remove("active");
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
  modal.querySelector(
    ".location"
  ).innerHTML = `<img src="${baseURL}/assets/location.png" alt="Location Icon" />`;
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
          <span>
            <a href="${cert.credlyURL}" class="certificate-name" target="_blank">
              <img src="${baseURL}assets/certs/${cert.provider}/${cert.certificationImage}" alt="${cert.certificationName}"/>
              <span class="name-text">${cert.certificationName}</span>
            </a>
          </span>
        `
            )
            .join("")
        : "<span>No certifications found for this user.</span>";

    // certificates section
    const certificationContainer = modal.querySelector(".certificates-section .certificate-icon");

    certificationContainer.innerHTML = `
        ${certListHTML}
      `;

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
  const providers = await fetch(baseURL + "information/providers.json").then(
    (res) => res.json()
  );
  const certificationsInfo = await fetch(`${baseURL}/information/certs.json`).then((res) => res.json());

  const userCertifications = [];

  const promises = providers.map(async (provider) => {
    const certOwners = await fetch(
      `${baseURL}/certs/${provider.value}/all.json`
    ).then((res) => res.json());

    for (const [certification, users] of Object.entries(certOwners)) {
      if (users.includes(`${userId}.json`)) {
        const certDetails = await fetch(
          `${baseURL}/certs/${provider.value}/${certification}/${userId}.json`
        ).then((res) => res.json());

        const selectedCertificate = certificationsInfo[provider.text].find((certificate) => {
          if(certificate.value === certification){
            return certificate;
          }
        });

        userCertifications.push({
          provider: provider.text,
          certificationName: selectedCertificate.text,
          certificationImage: selectedCertificate.icon,
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
  const countrySelectSpan = document.querySelector(
    ".wrapper[data-type='countries'] .select-btn span"
  );
  const countrySelectOptions = document.querySelector(
    ".wrapper[data-type='countries'] .options"
  );

  try {
    const countries = await fetch(baseURL + "information/countries.json").then(
      (response) => response.json()
    );

    //sort countries
    countries.sort((a, b) => a.text.localeCompare(b.text));

    // change country button value to default
    countrySelectSpan.innerHTML = "All countries";
    countrySelectSpan.setAttribute("data-value", "");

    // set default value
    const defaultValue =
      '<li data-value="" onclick="handleChangeCountry(this)">All countries</li>';
    countrySelectOptions.insertAdjacentHTML("beforeend", defaultValue);

    //render countries
    countries.forEach((country) => {
      const li = document.createElement("li");
      li.setAttribute("data-value", country.value);
      li.innerHTML = country.text;
      li.onclick = () => handleChangeCountry(li);
      countrySelectOptions.appendChild(li);
    });
  } catch (error) {
    console.log(`Error fetching countries: ${error.message}`);
  }
}

function handleChangeCountry(selectedCountry) {
  const countrySelectWrapper = document.querySelector(
    ".wrapper[data-type='countries']"
  );
  const countrySelectSpan = document.querySelector(
    ".wrapper[data-type='countries'] .select-btn span"
  );
  const providerSelectSpan = document.querySelector(
    ".wrapper[data-type='providers'] .select-btn span"
  );
  const certificationsSelectSpan = document.querySelector(
    ".wrapper[data-type='certifications'] .select-btn span"
  );

  // change the selected country value
  countrySelectSpan.innerHTML = selectedCountry.innerHTML;
  countrySelectSpan.setAttribute(
    "data-value",
    selectedCountry.getAttribute("data-value")
  );

  // close country menu
  countrySelectWrapper.classList.remove("active");

  fetchProfiles(
    providerSelectSpan.getAttribute("data-value"),
    certificationsSelectSpan.getAttribute("data-value"),
    selectedCountry.getAttribute("data-value")
  );
}

function resetFilters() {
  const wrappers = document.querySelectorAll(".wrapper");
  wrappers.forEach((wrapper) => {
    const selectBtn = wrapper.querySelector(".select-btn span");
    selectBtn.innerText = `All ${wrapper.getAttribute("data-type")}`;
    selectBtn.setAttribute("data-value", "");
  });

  // close all opened wrappers
  closeOpenedWrappers();

  // reset Profiles
  handleProviderChange();
}

function getRandomProfiles(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
