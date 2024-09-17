<div class="check-box-section">
      <label>Providers</label>
      <select id="providerSelect" onchange="handleProviderChange()">
        <option value="">Select Providers</option>
      </select>
      <label>Certificates</label>
      <select id="certSelect" onchange="handleCertChange()">
        <option value="">Select Certificate</option>
      </select>
      <label>Countries</label>
      <select id="countrySelect" onchange="handleChangeCountry()">
        <option value="">Select Country</option>
      </select>
    <button type="reset" onclick="resetFilters()">Reset</button>
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
          <div class="social-links">
            <!-- social links -->
          </div>
        </div>
        <div class="profile-right">
          <h2></h2>
          <p></p>
          <div class="location">
            <img src="" alt="Location Icon" />
          </div class="certifications">
          <!-- Certifications -->
        </div>
      </div>
    </div>
  </div>
