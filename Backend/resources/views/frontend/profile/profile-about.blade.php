@include('frontend.profile.profile-view')
<link rel="stylesheet" href="{{ asset('css/about.css') }}">



<!-- Create Your Own About Button -->
<div class="about-container">
    @if (Auth::check() && Auth::user()->role === 'Institute' && Auth::user()->id === $institute->user_id)
        @if ($aboutSection && $aboutSection->exists)
            <!-- Show update + delete buttons if about exists -->
            <button class="open-modal-btn" onclick="toggleModal('updateAboutModal')">✏️ Update</button>
            <button class="delete-about-btn"
                onclick="openDeleteModal('{{ route('institute.destroy', $institute->id) }}')">🗑️ Delete</button>
        @else
            <!-- Show create button if no about section -->
            <button class="create-about-btn" onclick="toggleModal('createAboutModal')">Create Your Own About</button>
        @endif
    @endif
</div>

<!-- Modal -->
<div id="createAboutModal" class="about-modal-overlay">
    <div class="about-modal-content">
        <button type="button" class="about-modal-close" onclick="closeModal('createAboutModal')">&times;</button>
        <div class="about-modal-header">Create Your Own About</div>
        <div class="about-modal-body">
            <form id="aboutForm" action="{{ route('about.submit', ['id' => $institute->id]) }}" method="POST"
                enctype="multipart/form-data">

                @csrf
                <!-- Institute Overview -->
                <div class="form-group">
                    <label for="instituteOverview">Institute Overview</label>
                    <textarea id="instituteOverview" name="institute_overview" rows="4"
                        placeholder="This is the introduction to the institute. It should provide a brief description of the institution, including its goals.."></textarea>
                </div>

                <!-- Mission -->
                <div class="form-group">
                    <label for="mission">Mission</label>
                    <textarea id="mission" name="mission" rows="4" placeholder="Write about the mission..."></textarea>
                </div>

                <!-- Vision -->
                <div class="form-group">
                    <label for="vision">Vision</label>
                    <textarea id="vision" name="vision" rows="4" placeholder="Write about the vision..."></textarea>
                </div>

                <!-- History -->
                <div class="form-group">
                    <label for="history">History</label>
                    <textarea id="history" name="history" rows="4"
                        placeholder="This is the history of the institute. It should provide a brief description of the institution's history..."></textarea>
                </div>

                <!-- Chancellor Introduction -->
                <div class="form-group">
                    <label for="chancellorIntro">Chancellor Introduction</label>
                    <textarea id="chancellorIntro" name="chancellor_intro" rows="3" placeholder="Write about the chancellor..."></textarea>
                    <label for="chancellorPhoto">Chancellor Photo</label>
                    <input type="file" id="chancellorPhoto" name="chancellor_photo" accept="image/*">
                </div>

                <!-- Vice-Chancellor Introduction -->
                <div class="form-group">
                    <label for="viceChancellorIntro">Vice-Chancellor Introduction</label>
                    <textarea id="viceChancellorIntro" name="vice_chancellor_intro" rows="3"
                        placeholder="Write about the vice-chancellor..."></textarea>
                    <label for="viceChancellorPhoto">Vice-Chancellor Photo</label>
                    <input type="file" id="viceChancellorPhoto" name="vice_chancellor_photo" accept="image/*">
                </div>

                <!-- Academic Excellence & Achievements -->
                <div class="form-group">
                    <label for="academicExcellence">Academic Excellence & Achievements</label>
                    <textarea id="academicExcellence" name="academic_excellence" rows="4"
                        placeholder="Write about the institute's academic achievements, teaching methodologies, and standout programs...
                    
Include photos from classrooms, labs, or lectures to visually represent the institute’s academic environment."></textarea>
                    <label for="academicImages">Upload Related Images</label>
                    <input type="file" id="academicImages" name="academic_images[]" accept="image/*" multiple>
                </div>

                <!-- Programs Offered -->
                <div class="form-group">
                    <label for="programsOffered">Programs Offered</label>
                    <textarea id="programsOffered" name="programs_offered" rows="4"
                        placeholder="Write about the Detail of different academic programs, degrees, and diplomas offered by the institute...
                    
Use images that represent each program, such as graduation ceremonies, class activities, or project works."></textarea>
                    <label for="programsImages">Upload Related Images</label>
                    <input type="file" id="programsImages" name="programs_images[]" accept="image/*" multiple>
                </div>

                <!-- Global Partnerships -->
                <div class="form-group">
                    <label for="globalPartnerships">Global Partnerships</label>
                    <textarea id="globalPartnerships" name="global_partnerships" rows="4"
                        placeholder="Mention partnerships with universities, research organizations, and international institutions...
Display logos or photos from global collaborations, international exchange programs, or photos from partner events."></textarea>
                    <label for="partnershipsImages">Upload Related Images</label>
                    <input type="file" id="partnershipsImages" name="partnerships_images[]" accept="image/*"
                        multiple>
                </div>

                <!-- Life at [Institute Name] -->
                <div class="form-group">
                    <label for="lifeAtInstitute">Life at {{ $institute->institute_name }}</label>
                    <textarea id="lifeAtInstitute" name="life_at_institute" rows="4"
                        placeholder="Describe student life, extracurricular activities, and campus culture...
Use vibrant images of campus life, including events, student clubs, and gatherings."></textarea>
                    <label for="lifeImages">Upload Related Images</label>
                    <input type="file" id="lifeImages" name="life_images[]" accept="image/*" multiple>
                </div>

                <!-- Sports & Recreation -->
                <div class="form-group">
                    <label for="sportsRecreation">Sports & Recreation</label>
                    <textarea id="sportsRecreation" name="sports_recreation" rows="4"
                        placeholder="Explain the sports and recreation facilities available to students and highlight any sports teams...
Add photos of sports events, student athletes in action, or images of recreational facilities like gymnasiums or swimming pools."></textarea>
                    <label for="sportsImages">Upload Related Images</label>
                    <input type="file" id="sportsImages" name="sports_images[]" accept="image/*" multiple>
                </div>

                <!-- Upcoming Programs & Developments -->
                <div class="form-group">
                    <label for="upcomingPrograms">Upcoming Programs & Developments</label>
                    <textarea id="upcomingPrograms" name="upcoming_programs" rows="4"
                        placeholder="Highlight future educational programs, new initiatives, or campus developments...
Show images of construction sites for new buildings or renderings of new campus facilities."></textarea>
                    <label for="upcomingImages">Upload Related Images</label>
                    <input type="file" id="upcomingImages" name="upcoming_images[]" accept="image/*" multiple>
                </div>

                <!-- Campus Overview -->
                <div class="form-group">
                    <label for="campusImages">Campus Overview Images <br> (Include wide-angle photos of the campus,
                        individual buildings, or detailed shots of specific facilities.)</label>
                    <input type="file" id="campusImages" name="campus_images[]" accept="image/*" multiple>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="confirm-btn">Save About Section</button>
                <button type="reset" class="reset-btn" id="resetForm">Reset</button>
            </form>
        </div>
    </div>
</div>

<!-- Upload Progress Modal -->
<div id="uploadProgressModal" class="upload-modal" style="display:none;">
    <div class="upload-modal-content">
        <h3>Uploading Files...</h3>
        <div id="uploadList"></div>
    </div>
</div>




<div class="container about-section">
    @if ($aboutSection)
        <section class="about-content">

            <!-- Institute Overview -->
            @if ($aboutSection->institute_overview)
                <div class="overview">
                    <div class="buttons">
                        <h2>Institute Overview</h2>
                        <p class="overview-text">{!! nl2br(e($aboutSection->institute_overview)) !!}</p>
                    </div>
            @endif

            <!-- Mission and Vision -->
            <div class="mission-vision">
                @if ($aboutSection->mission)
                    <div class="section mission">
                        <h3>Mission</h3>
                        <p>{!! nl2br(e($aboutSection->mission)) !!}</p>
                    </div>
                @endif

                @if ($aboutSection->vision)
                    <div class="section vision">
                        <h3>Vision</h3>
                        <p>{!! nl2br(e($aboutSection->vision)) !!}</p>
                    </div>
                @endif
            </div>

            <hr class="divider">

            <!-- History -->
            @if ($aboutSection->history)
                <div class="section history">
                    <h3>History</h3>
                    <p>{!! nl2br(e($aboutSection->history)) !!}</p>
                </div>
            @endif

            <hr class="divider">

            <!-- Chancellor Introduction -->
            @if ($aboutSection->chancellor_intro)
                <div class="chancellor-intro">
                    <div class="chancellor-photo">
                        @if ($aboutSection->chancellor_photo)
                            <img src="{{ asset('storage/' . $aboutSection->chancellor_photo) }}"
                                alt="Chancellor Photo">
                        @endif
                    </div>
                    <div class="chancellor-description">
                        <h3>Chancellor Introduction</h3>
                        <p>{!! nl2br(e($aboutSection->chancellor_intro)) !!}</p>
                    </div>
                </div>
            @endif

            <!-- Vice Chancellor Introduction -->
            @if ($aboutSection->vice_chancellor_intro)
                <div class="vice-chancellor-intro">
                    <div class="vice-chancellor-photo">
                        @if ($aboutSection->vice_chancellor_photo)
                            <img src="{{ asset('storage/' . $aboutSection->vice_chancellor_photo) }}"
                                alt="Vice-Chancellor Photo">
                        @endif
                    </div>
                    <div class="vice-chancellor-description">
                        <h3>Vice-Chancellor Introduction</h3>
                        <p>{!! nl2br(e($aboutSection->vice_chancellor_intro)) !!}</p>
                    </div>
                </div>
            @endif

            <hr class="divider">

            <!-- Academic Excellence -->
            @if ($aboutSection->academic_excellence)
                <div class="section academic-excellence">
                    <h3>Academic Excellence & Achievements</h3>
                    <p>{!! nl2br(e($aboutSection->academic_excellence)) !!}</p>
                    @if ($aboutSection->academic_images)
                        <div class="gallery">
                            @foreach (json_decode($aboutSection->academic_images) as $image)
                                <img src="{{ asset('storage/' . $image) }}" alt="Academic Image">
                            @endforeach
                        </div>
                    @endif
                </div>
            @endif

            <hr class="divider">

            <!-- Programs Offered -->
            @if ($aboutSection->programs_offered)
                <div class="section programs-offered">
                    <h3>Programs Offered</h3>
                    <p>{!! nl2br(e($aboutSection->programs_offered)) !!}</p>
                    @if ($aboutSection->programs_images)
                        <div class="gallery">
                            @foreach (json_decode($aboutSection->programs_images) as $image)
                                <img src="{{ asset('storage/' . $image) }}" alt="Programs Image">
                            @endforeach
                        </div>
                    @endif
                </div>
            @endif

            <hr class="divider">

            <!-- Global Partnerships -->
            @if ($aboutSection->global_partnerships)
                <div class="section global-partnerships">
                    <h3>Global Partnerships</h3>
                    <p>{!! nl2br(e($aboutSection->global_partnerships)) !!}</p>
                    @if ($aboutSection->partnerships_images)
                        <div class="gallery">
                            @foreach (json_decode($aboutSection->partnerships_images) as $image)
                                <img src="{{ asset('storage/' . $image) }}" alt="Partnerships Image">
                            @endforeach
                        </div>
                    @endif
                </div>
            @endif

            <hr class="divider">

            <!-- Life at Institute -->
            @if ($aboutSection->life_at_institute)
                <div class="section life-at-institute">
                    <h3>Life at {{ $institute->name }}</h3>
                    <p>{!! nl2br(e($aboutSection->life_at_institute)) !!}</p>
                    @if ($aboutSection->life_images)
                        <div class="gallery">
                            @foreach (json_decode($aboutSection->life_images) as $image)
                                <img src="{{ asset('storage/' . $image) }}" alt="Life Image">
                            @endforeach
                        </div>
                    @endif
                </div>
            @endif

            <hr class="divider">

            <!-- Sports & Recreation -->
            @if ($aboutSection->sports_recreation)
                <div class="section sports-recreation">
                    <h3>Sports & Recreation</h3>
                    <p>{!! nl2br(e($aboutSection->sports_recreation)) !!}</p>
                    @if ($aboutSection->sports_images)
                        <div class="gallery">
                            @foreach (json_decode($aboutSection->sports_images) as $image)
                                <img src="{{ asset('storage/' . $image) }}" alt="Sports Image">
                            @endforeach
                        </div>
                    @endif
                </div>
            @endif

            <hr class="divider">

            <!-- Upcoming Programs & Developments -->
            @if ($aboutSection->upcoming_programs)
                <div class="section upcoming-programs">
                    <h3>Upcoming Programs & Developments</h3>
                    <p>{!! nl2br(e($aboutSection->upcoming_programs)) !!}</p>
                    @if ($aboutSection->upcoming_images)
                        <div class="gallery">
                            @foreach (json_decode($aboutSection->upcoming_images) as $image)
                                <img src="{{ asset('storage/' . $image) }}" alt="Upcoming Image">
                            @endforeach
                        </div>
                    @endif
                </div>
            @endif

            <hr class="divider">

            <!-- Campus Overview -->
            @if ($aboutSection->campus_images)
                <div class="section campus-overview">
                    <h3>Campus Overview</h3>
                    <div class="gallery">
                        @foreach (json_decode($aboutSection->campus_images) as $image)
                            <img src="{{ asset('storage/' . $image) }}" alt="Campus Image">
                        @endforeach
                    </div>
                </div>
            @endif
        </section>
    @else
        <p>No Data</p>
    @endif
</div>

<!-- Image Modal -->
<div id="imageModal" class="image-modal">
    <span class="close">&times;</span>
    <span class="prev">&#10094;</span>
    <span class="next">&#10095;</span>
    <img class="modal-content" id="modalImage">
</div>


<!-- Update Modal -->
<div id="updateAboutModal" class="about-modal-overlay">
    <div class="about-modal-content">
        <button type="button" class="about-modal-close" onclick="closeModal('updateAboutModal')">&times;</button>
        <div class="about-modal-header">Update Your About</div>
        <div class="about-modal-body">
            <form id="updateAboutForm" action="{{ route('institute.update', $institute->id) }}" method="POST"
                enctype="multipart/form-data">
                @csrf
                @method('PUT')

                <!-- Institute Overview -->
                <div class="form-group">
                    <label for="instituteOverview">Institute Overview</label>
                    <textarea id="instituteOverview" name="institute_overview" rows="4"
                        placeholder="This is the introduction to the institute.">{{ $aboutSection->institute_overview }}</textarea>
                </div>

                <!-- Mission -->
                <div class="form-group">
                    <label for="mission">Mission</label>
                    <textarea id="mission" name="mission" rows="4" placeholder="Write about the mission...">{{ $aboutSection->mission }}</textarea>
                </div>

                <!-- Vision -->
                <div class="form-group">
                    <label for="vision">Vision</label>
                    <textarea id="vision" name="vision" rows="4" placeholder="Write about the vision...">{{ $aboutSection->vision }}</textarea>
                </div>

                <!-- History -->
                <div class="form-group">
                    <label for="history">History</label>
                    <textarea id="history" name="history" rows="4" placeholder="This is the introduction to the institute.">{{ $aboutSection->history }}</textarea>
                </div>

                <!-- Chancellor Introduction -->
                <div class="form-group">
                    <label for="chancellorIntro">Chancellor Introduction</label>
                    <textarea id="chancellorIntro" name="chancellor_intro" rows="3">{{ $aboutSection->chancellor_intro }}</textarea>
                    <label for="chancellorPhoto">Chancellor Photo</label>
                    <input type="file" id="chancellorPhoto" name="chancellor_photo" accept="image/*">
                    @if ($aboutSection->chancellor_photo)
                        <div class="image-container">
                            <img src="{{ asset('storage/' . $aboutSection->chancellor_photo) }}" width="100"
                                height="100">
                            <button type="button"
                                onclick="removeSingleImage('chancellor_photo', '{{ $institute->id }}', this)">×</button>
                        </div>
                    @endif
                </div>

                <!-- Vice-Chancellor Introduction -->
                <div class="form-group">
                    <label for="viceChancellorIntro">Vice-Chancellor Introduction</label>
                    <textarea id="viceChancellorIntro" name="vice_chancellor_intro" rows="3">{{ $aboutSection->vice_chancellor_intro }}</textarea>
                    <label for="viceChancellorPhoto">Vice-Chancellor Photo</label>
                    <input type="file" id="viceChancellorPhoto" name="vice_chancellor_photo" accept="image/*">
                    @if ($aboutSection->vice_chancellor_photo)
                        <div class="image-container">
                            <img src="{{ asset('storage/' . $aboutSection->vice_chancellor_photo) }}" width="100"
                                height="100">
                            <button type="button"
                                onclick="removeSingleImage('vice_chancellor_photo', '{{ $institute->id }}', this)">×</button>
                        </div>
                    @endif
                </div>

                <!-- Academic Excellence & Achievements -->
                <div class="form-group"> <label for="academicExcellence">Academic Excellence & Achievements</label>
                    <textarea id="academicExcellence" name="academic_excellence" rows="4"
                        placeholder="Write about the institute's academic achievements, teaching methodologies, and standout programs...">{{ $aboutSection->academic_excellence }}
                    </textarea>
                </div>

                <!-- Programs Offered -->
                <div class="form-group"> <label for="programsOffered">Programs Offered</label>
                    <textarea id="programsOffered" name="programs_offered" rows="4"
                        placeholder="Write about the details of different academic programs, degrees, and diplomas offered by the institute...">{{ $aboutSection->programs_offered }}
                    </textarea>
                </div>

                <!-- Global Partnerships -->
                <div class="form-group"> <label for="globalPartnerships">Global Partnerships</label>
                    <textarea id="globalPartnerships" name="global_partnerships" rows="4"
                        placeholder="Mention partnerships with universities, research organizations, and international institutions...">{{ $aboutSection->global_partnerships }}
                    </textarea>
                </div>

                <!-- Life at Institute -->
                <div class="form-group"> <label for="lifeAtInstitute">Life at
                        {{ $aboutSection->institute_name }}</label>
                    <textarea id="lifeAtInstitute" name="life_at_institute" rows="4"
                        placeholder="Describe student life, extracurricular activities, and campus culture...">{{ $aboutSection->life_at_institute }}
                    </textarea>
                </div>

                <!-- Sports & Recreation -->
                <div class="form-group"> <label for="sportsRecreation">Sports & Recreation</label>
                    <textarea id="sportsRecreation" name="sports_recreation" rows="4"
                        placeholder="Explain the sports and recreation facilities available to students and highlight any sports teams...">{{ $aboutSection->sports_recreation }}
                    </textarea>
                </div>

                <!-- Upcoming Programs & Developments -->
                <div class="form-group"> <label for="upcomingPrograms">Upcoming Programs & Developments</label>
                    <textarea id="upcomingPrograms" name="upcoming_programs" rows="4"
                        placeholder="Highlight future educational programs, new initiatives, or campus developments...">{{ $aboutSection->upcoming_programs }}
                    </textarea>
                </div>

                @php
                    $multiImageFields = [
                        'academic_images' => 'Academic Excellence & Achievements',
                        'programs_images' => 'Programs Offered',
                        'partnerships_images' => 'Global Partnerships',
                        'life_images' => 'Life at ' . $aboutSection->institute_name,
                        'sports_images' => 'Sports & Recreation',
                        'upcoming_images' => 'Upcoming Programs & Developments',
                        'campus_images' => 'Campus Overview Images',
                    ];
                @endphp

                @foreach ($multiImageFields as $field => $label)
                    <div class="form-group">
                        <label for="{{ $field }}">{{ $label }}</label>
                        <input type="file" id="{{ $field }}" name="{{ $field }}[]"
                            accept="image/*" multiple>
                        <input type="hidden" id="removed_{{ $field }}" name="removed_{{ $field }}"
                            value="[]">
                        <div class="image-preview-container" id="{{ $field }}Existing">
                            @if ($aboutSection->$field)
                                @foreach (json_decode($aboutSection->$field) as $img)
                                    <div class="image-container"
                                        style="display:inline-block; position:relative; margin:5px;">
                                        <img src="{{ asset('storage/' . $img) }}" width="100"
                                            style="display:block;">
                                        <button type="button"
                                            style="position:absolute; top:0; right:0; background:red; color:white; border:none; border-radius:50%;"
                                            onclick="removeMultiImage('{{ $field }}', '{{ $img }}', 'removed_{{ $field }}', this)">×</button>
                                    </div>
                                @endforeach
                            @endif
                        </div>
                        <div class="image-preview-container" id="{{ $field }}Preview"></div>
                    </div>
                @endforeach

                <button type="submit" class="submit-btn">Update About Section</button>
            </form>
        </div>
    </div>
</div>


<!-- Delete Confirmation Modal -->
<div class="delete-modal" id="deleteModal">
    <div class="delete-modal-content">
        <button class="delete-modal-close" onclick="closeDeleteModal()">&times;</button>
        <div class="delete-modal-header">Confirm Deletion</div>
        <div class="delete-modal-body">
            <p>Are you sure you want to delete this institute's information?</p>
            <form id="deleteForm" action="" method="POST">
                @csrf
                @method('DELETE')
                <button type="submit" class="delete-modal-confirm-btn">Yes, Delete</button>
                <button type="button" class="delete-modal-cancel-btn" onclick="closeDeleteModal()">Cancel</button>
            </form>
        </div>
    </div>
</div>





<script>
    document.addEventListener("DOMContentLoaded", () => {
        // Target ONLY the create modal
        const createModal = document.getElementById('createAboutModal');
        const createBtn = document.querySelector('.create-about-btn');
        const closeBtn = createModal.querySelector('.about-modal-close');
        const aboutForm = document.getElementById('aboutForm');
        const resetFormButton = document.getElementById("resetForm");

        // If you keep the inline onclick on the button, you can remove this 'open' listener.
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                createModal.classList.add('active'); // use the same class as other modals
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                createModal.classList.remove('active');
            });
        }

        // Click outside to close
        createModal.addEventListener('click', (e) => {
            if (e.target === createModal) {
                createModal.classList.remove('active');
            }
        });

        // Create progress modal element
        const uploadModal = document.createElement('div');
        uploadModal.id = 'uploadProgressModal';
        uploadModal.style.position = 'fixed';
        uploadModal.style.top = '50%';
        uploadModal.style.left = '50%';
        uploadModal.style.transform = 'translate(-50%, -50%)';
        uploadModal.style.backgroundColor = '#fff';
        uploadModal.style.padding = '20px';
        uploadModal.style.borderRadius = '10px';
        uploadModal.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        uploadModal.style.display = 'none';
        uploadModal.style.zIndex = '9999';
        uploadModal.innerHTML = `
        <div style="margin-bottom: 10px;">Uploading files...</div>
        <progress id="uploadProgressBar" value="0" max="100" style="width:100%;"></progress>
        <div id="uploadPercent" style="text-align:right; margin-top:5px;">0%</div>
    `;
        document.body.appendChild(uploadModal);



        // 🔹 Reset form + previews + errors
        if (resetFormButton) {
            resetFormButton.addEventListener("click", () => {
                aboutForm.reset();

                // Clear previews
                const previewContainers = aboutForm.querySelectorAll(".image-preview-container");
                previewContainers.forEach(container => container.innerHTML = "");

                // Remove all error messages
                const errorMessages = aboutForm.querySelectorAll(".file-error");
                errorMessages.forEach(err => err.remove());
            });
        }

        // 🔹 File input handling (previews + size validation)
        const fileInputs = aboutForm.querySelectorAll('input[type="file"]');
        fileInputs.forEach((fileInput) => {
            fileInput.addEventListener("change", () => {
                const previewContainerId = `${fileInput.id}Preview`;
                let previewContainer = document.getElementById(previewContainerId);

                if (!previewContainer) {
                    previewContainer = document.createElement("div");
                    previewContainer.id = previewContainerId;
                    previewContainer.classList.add("image-preview-container");
                    fileInput.insertAdjacentElement("afterend", previewContainer);
                }

                // Remove old error
                const oldError = fileInput.parentElement.querySelector(".file-error");
                if (oldError) oldError.remove();

                // Clear previews
                previewContainer.innerHTML = "";

                // Loop through selected files
                Array.from(fileInput.files).forEach((file) => {
                    if (file.size > 2 * 1024 * 1024) {
                        const error = document.createElement("div");
                        error.classList.add("file-error");
                        error.style.color = "red";
                        error.style.fontSize = "13px";
                        error.style.marginTop = "5px";
                        error.innerText =
                            `❌ ${file.name} exceeds 2MB and was not added.`;
                        fileInput.parentElement.appendChild(error);
                        return;
                    }

                    // Show preview
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement("img");
                        img.src = e.target.result;
                        img.alt = file.name;
                        img.classList.add("preview-image");
                        img.style.maxWidth = "120px";
                        img.style.margin = "5px";
                        previewContainer.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                });
            });
        });

        // 🔹 AJAX form submission with single progress bar
        aboutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(aboutForm);

            uploadModal.style.display = 'block';
            const progressBar = document.getElementById('uploadProgressBar');
            const percentText = document.getElementById('uploadPercent');

            const xhr = new XMLHttpRequest();
            xhr.open('POST', aboutForm.action);

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    progressBar.value = percent;
                    percentText.innerText = `${percent}%`;
                }
            });

            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 302) {
                    // Success: reload page or close modal
                    uploadModal.style.display = 'none';
                    location.reload();
                } else {
                    alert('Upload failed!');
                    uploadModal.style.display = 'none';
                }
            };

            xhr.send(formData);
        });
    });




    //Update modal js

    // Function to toggle modal visibility by passing modal ID
    function toggleModal(modalId) {
        var modal = document.querySelector(`#${modalId}`); // Get modal by its ID
        modal.classList.toggle('active'); // Toggle the 'active' class to show/hide modal
    }

    function toggleModal(modalId) {
        document.getElementById(modalId).classList.toggle('active');
    }

    function closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    document.addEventListener("DOMContentLoaded", () => {
        const aboutForm = document.getElementById('updateAboutForm');
        const closeModalBtn = document.querySelector('.about-modal-close');

        // Create progress modal
        const uploadModal = document.createElement('div');
        uploadModal.id = 'uploadProgressModal';
        uploadModal.style.position = 'fixed';
        uploadModal.style.top = '50%';
        uploadModal.style.left = '50%';
        uploadModal.style.transform = 'translate(-50%, -50%)';
        uploadModal.style.backgroundColor = '#fff';
        uploadModal.style.padding = '20px';
        uploadModal.style.borderRadius = '10px';
        uploadModal.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        uploadModal.style.display = 'none';
        uploadModal.style.zIndex = '9999';
        uploadModal.innerHTML = `
        <div style="margin-bottom: 10px;">Uploading files...</div>
        <progress id="uploadProgressBar" value="0" max="100" style="width:100%;"></progress>
        <div id="uploadPercent" style="text-align:right; margin-top:5px;">0%</div>
    `;
        document.body.appendChild(uploadModal);

        // Handle file inputs for new previews & validation
        const fileInputs = aboutForm.querySelectorAll('input[type="file"]');
        fileInputs.forEach((input) => {
            input.addEventListener('change', () => {
                const previewContainerId = input.id + "Preview";
                let previewContainer = document.getElementById(previewContainerId);

                if (!previewContainer) {
                    previewContainer = document.createElement('div');
                    previewContainer.id = previewContainerId;
                    previewContainer.classList.add('image-preview-container');
                    input.insertAdjacentElement("afterend", previewContainer);
                }

                previewContainer.innerHTML = ""; // Clear previous new previews

                const validFiles = [];

                Array.from(input.files).forEach((file) => {
                    if (file.size > 2 * 1024 * 1024) {
                        const error = document.createElement('div');
                        error.classList.add('file-error');
                        error.style.color = 'red';
                        error.style.fontSize = '13px';
                        error.style.marginTop = '5px';
                        error.innerText =
                            `❌ ${file.name} exceeds 2MB and was skipped.`;
                        input.parentElement.appendChild(error);
                    } else {
                        validFiles.push(file); // Keep only valid files

                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.alt = file.name;
                            img.classList.add('preview-image');
                            img.style.maxWidth = "120px";
                            img.style.margin = "5px";
                            previewContainer.appendChild(img);
                        };
                        reader.readAsDataURL(file);
                    }
                });

                // Replace the input files with valid files for form submission
                const dataTransfer = new DataTransfer();
                validFiles.forEach(f => dataTransfer.items.add(f));
                input.files = dataTransfer.files;

            });
        });

        // Handle form submission with AJAX + progress bar
        aboutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(aboutForm);

            uploadModal.style.display = 'block';
            const progressBar = document.getElementById('uploadProgressBar');
            const percentText = document.getElementById('uploadPercent');

            const xhr = new XMLHttpRequest();
            xhr.open(aboutForm.method, aboutForm.action);

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    progressBar.value = percent;
                    percentText.innerText = `${percent}%`;
                }
            });

            xhr.onload = () => {
                uploadModal.style.display = 'none';
                if (xhr.status === 200 || xhr.status === 302) {
                    location.reload();
                } else {
                    alert('Upload failed!');
                }
            };

            xhr.send(formData);
        });

    });


    function removeSingleImage(field, instituteId, btn) {
        btn.parentElement.remove();
        // Optionally, mark it as removed for backend if you handle deletion in update method
    }

    function removeMultiImage(field, imageName, hiddenInputId, btn) {
        btn.parentElement.remove();
        let input = document.getElementById(hiddenInputId);
        let removed = input.value ? JSON.parse(input.value) : [];
        removed.push(imageName);
        input.value = JSON.stringify(removed);
    }






    // Function to open the delete modal
    function openDeleteModal(actionUrl) {
        // Set the action of the delete form dynamically
        document.getElementById('deleteForm').action = actionUrl;

        // Show the modal
        const modal = document.getElementById('deleteModal');
        modal.style.display = 'flex';
    }

    // Function to close the delete modal
    function closeDeleteModal() {
        const modal = document.getElementById('deleteModal');
        modal.style.display = 'none';
    }



    //image modal
    document.addEventListener("DOMContentLoaded", () => {
        const modal = document.getElementById("imageModal");
        const modalImg = document.getElementById("modalImage");
        const closeBtn = modal.querySelector(".close");
        const prevBtn = modal.querySelector(".prev");
        const nextBtn = modal.querySelector(".next");

        let currentIndex = 0;
        let images = [];

        // Collect all gallery images
        images = Array.from(document.querySelectorAll(".gallery img"));

        // Open modal on image click
        images.forEach((img, index) => {
            img.addEventListener("click", () => {
                currentIndex = index;
                openModal();
            });
        });

        function openModal() {
            modal.style.display = "block";
            modalImg.src = images[currentIndex].src;
        }

        function closeModal() {
            modal.style.display = "none";
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            modalImg.src = images[currentIndex].src;
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % images.length;
            modalImg.src = images[currentIndex].src;
        }

        // Event listeners
        closeBtn.addEventListener("click", closeModal);
        prevBtn.addEventListener("click", showPrev);
        nextBtn.addEventListener("click", showNext);

        // Close modal on outside click
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Keyboard support
        document.addEventListener("keydown", (e) => {
            if (modal.style.display === "block") {
                if (e.key === "ArrowLeft") showPrev();
                if (e.key === "ArrowRight") showNext();
                if (e.key === "Escape") closeModal();
            }
        });
    });
</script>
