---
hide:
  - navigation
  - toc
---

<!-- Connect Icons CDN -->
<link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/line.css">
<div class="check-box-section">  
          <!-- Provider Select -->
    <div class="wrapper" data-type="providers">
        <div class="select-btn">
          <span>All Providers</span>
          <i class="uil uil-angle-down"></i>
        </div>
        <div class="content">
          <div class="search">
            <i class="uil uil-search"></i>
            <input spellcheck="false" type="text" placeholder="Search Providers" autofocus>
          </div>
          <ul class="options"></ul>
        </div>
    </div>
    <!-- Certification Select -->
    <div class="wrapper" data-type="certifications">
        <div class="select-btn">
          <span>All certifications</span>
          <i class="uil uil-angle-down"></i>
        </div>
        <div class="content">
          <div class="search">
            <i class="uil uil-search"></i>
            <input spellcheck="false" type="text" placeholder="Search Certifications" autofocus>
          </div>
          <ul class="options"></ul>
        </div>
    </div>
    <!-- Country Select -->
    <div class="wrapper" data-type="countries">
        <div class="select-btn">
          <span>All countries</span>
          <i class="uil uil-angle-down"></i>
        </div>
        <div class="content">
          <div class="search">
            <i class="uil uil-search"></i>
            <input spellcheck="false" type="text" placeholder="Search Countries" autofocus>
          </div>
          <ul class="options"></ul>
        </div>
    </div>
    <button type="reset" id="reset" onclick="resetFilters()">Reset</button>
</div>

  <section class="wrap" id="profileSection">
    <!-- Profile Cards Will Be Rendered Here -->
  </section>

  <!-- Profile Modal -->
  <div id="profileModal" class="modal">
    <div class="modal-content">
      <span class="close-btn">&times;</span>
      <div class="modal-body">
        <div class="profile-left">
          <img src="" alt="Profile Picture" class="profile-picture" />
          <div class="profile-pronouns"></div>
          <div class="position"></div>
          <div class="location">
            <img src="" alt="Location Icon" />
          </div>
          <div class="social-links">
            <!-- social links -->
          </div>
        </div>
        <div class="profile-right">
          <h2></h2>
          <p></p>
          <div class="certificates-section">
              <div class="certificates">Certificates</div>
              <div class="certificate-icon"></div>
            </div>
        </div>
      </div>
    </div>
  </div>
